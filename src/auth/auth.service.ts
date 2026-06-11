import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL as string,
            process.env.SUPABASE_KEY as string,
        );
    }

    /**
     * Inicio de sesión (Sign-In)
     */
    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            throw new UnauthorizedException('Credenciales incorrectas o usuario no existe');
        }

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

        if (userError || !userData) {
            throw new UnauthorizedException('Perfil de usuario no encontrado en el sistema');
        }
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
     * Registro de usuarios (Sign-Up) - 
     */
    async signUp(signUpDto: SignUpDto) {
        //Desestructuramos los campos extendidos mapeados desde el DTO
        const { email, password, nombres, apellidos, rol_id, semestre, paralelo, materia } = signUpDto;

        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                //  TRANSFERENCIA DE METADATA EN TIEMPO REAL AL TRIGGER SQL
                data: {
                    nombres,
                    apellidos,
                    rol_id,
                    semestre: semestre || null,
                    paralelo: paralelo || null,
                    materia: materia || null // Envía la materia real al procedimiento 'handle_new_user'
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
            redirectTo: 'https://hospital-uta.vercel.app/reset-password', 
        });

        if (error) throw new BadRequestException(error.message);

        return { message: 'Se ha enviado un enlace de recuperación a tu correo.' };
    }

  async updatePassword(newPassword: string, accessToken: string, refreshToken: string) {
        const { data: sessionData, error: sessionError } = await this.supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        if (sessionError) {
            console.error(' Error de sincronización:', sessionError.message);
            throw new UnauthorizedException(`Enlace inválido: ${sessionError.message}`);
        }

        console.log('Sesión restaurada temporalmente para:', sessionData.user?.email);

        const { error: updateError } = await this.supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            console.error(' Error al actualizar datos:', updateError.message);
            throw new BadRequestException(updateError.message);
        }

        console.log('Contraseña cambiada con éxito.');
        return { message: 'Contraseña actualizada exitosamente.' };
    }
}