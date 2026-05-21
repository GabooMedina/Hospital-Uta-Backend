import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
    private supabase: SupabaseClient;

    constructor() {
        // Inicializamos el cliente dentro del constructor para asegurar que process.env esté listo
        this.supabase = createClient(
            process.env.SUPABASE_URL as string,
            process.env.SUPABASE_KEY as string,
        );
    }

    /**
     * Inicio de sesión (Sign-In)
     * Valida contra Supabase Auth y cruza con la tabla pública 'usuarios'
     */
    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // 1. Intentar login en Supabase Auth
        const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            throw new UnauthorizedException('Credenciales incorrectas o usuario no existe');
        }

        // 2. Buscar datos extendidos en nuestra tabla 'usuarios' con un Join a 'roles'
        const { data: userData, error: userError } = await this.supabase
            .from('usuarios')
            .select(`
        nombres,
        apellidos,
        estado,
        roles (
          nombre
        )
      `)
            .eq('id', authData.user.id)
            .single();

        // Si el usuario existe en Auth pero no en nuestra tabla (o hubo error)
        if (userError || !userData) {
            throw new UnauthorizedException('Perfil de usuario no encontrado en el sistema');
        }

        // 3. Retornar la información completa para el Frontend
        return {
            user: {
                id: authData.user.id,
                email: authData.user.email,
                nombres: userData.nombres,
                apellidos: userData.apellidos,
                rol: userData.roles['nombre'], // Extraído del join con la tabla roles
                estado: userData.estado
            },
            access_token: authData.session?.access_token,
            refresh_token: authData.session?.refresh_token,
        };
    }

    /**
     * Registro de usuarios (Sign-Up)
     * Los metadatos en 'options.data' son capturados por el TRIGGER de la DB
     */
    async signUp(signUpDto: SignUpDto) {
        const { email, password, nombres, apellidos, rol_id } = signUpDto;

        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombres,    // Estos campos los recibe el Trigger en PostgreSQL
                    apellidos,
                    rol_id
                }
            }
        });

        if (error) {
            throw new BadRequestException(error.message);
        }

        return {
            message: 'Usuario creado exitosamente. Se ha enviado un correo de confirmación.',
            uid: data.user?.id
        };
    }
    async forgotPassword(email: string) {
        const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:5173/reset-password', 
        });

        if (error) throw new BadRequestException(error.message);

        return { message: 'Se ha enviado un enlace de recuperación a tu correo.' };
    }

  async updatePassword(newPassword: string, accessToken: string, refreshToken: string) {
        console.log('=== PROCESANDO RECUPERACIÓN CON AMBOS TOKENS ===');

        // Sincronizamos la sesión con el set completo exigido por Supabase
        const { data: sessionData, error: sessionError } = await this.supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken, // Ahora sí va lleno y válido
        });

        if (sessionError) {
            console.error('❌ Error de sincronización:', sessionError.message);
            throw new UnauthorizedException(`Enlace inválido: ${sessionError.message}`);
        }

        console.log('✅ Sesión restaurada temporalmente para:', sessionData.user?.email);

        // Actualizamos la clave del usuario autenticado en la sesión actual
        const { error: updateError } = await this.supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            console.error('❌ Error al actualizar datos:', updateError.message);
            throw new BadRequestException(updateError.message);
        }

        console.log('✅ Contraseña cambiada con éxito.');
        return { message: 'Contraseña actualizada exitosamente.' };
    }
}