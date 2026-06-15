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
     * Inicio de sesión (Sign-In) con control relacional de aprobación para Docentes
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

        // Extraemos de forma segura el nombre del rol para evitar errores de lectura
        const nombreRol = userData.roles ? (userData.roles as any).nombre : 'ESTUDIANTE';

      
        if (nombreRol.toUpperCase() === 'ESTUDIANTE') {
            throw new UnauthorizedException('ACCESO_ESTUDIANTE_VR');
        }

        if (userData.estado && userData.estado.toLowerCase() === 'pendiente') {
            throw new UnauthorizedException('CUENTA_DOCENTE_PENDIENTE');
        }

        return {
            user: {
                id: authData.user.id,
                email: authData.user.email,
                nombres: userData.nombres,
                apellidos: userData.apellidos,
                rol: nombreRol,
                estado: userData.estado
            },
            access_token: authData.session?.access_token,
            refresh_token: authData.session?.refresh_token,
        };
    }

    /**
     * Registro de usuarios (Sign-Up) con inyección diferenciada de estados de seguridad
     */
    async signUp(signUpDto: SignUpDto) {
        const { email, password, nombres, apellidos, rol_id, semestre, paralelo, materia } = signUpDto;

        const estadoInicial = Number(rol_id) === 2 ? 'pendiente' : 'activo';

        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombres,
                    apellidos,
                    rol_id,
                    estado: estadoInicial, 
                    semestre: semestre || null,
                    paralelo: paralelo || null,
                    materia: materia || null 
                }
            }
        });

        if (error) {
            throw new BadRequestException(error.message);
        }

        return {
            message: estadoInicial === 'pendiente' 
                ? 'Registro en revisión. Su cuenta estará en lista de espera hasta la aprobación del Administrador.'
                : 'Usuario creado exitosamente. Se ha enviado un correo de confirmación.',
            uid: data.user?.id,
            estado: estadoInicial
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
        await this.supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        const { error: updateError } = await this.supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            throw new BadRequestException(updateError.message);
        }

        return { message: 'Contraseña actualizada exitosamente.' };
    }
}