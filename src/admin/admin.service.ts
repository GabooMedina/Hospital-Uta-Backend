import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AdminService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string,
        );
    }

    /**
     * Listar los docentes del sistema ordenados cronológicamente
     */
    async findAllUsuarios() {
        const { data, error } = await this.supabase
            .from('usuarios')
            .select(`
                id, 
                nombres, 
                apellidos, 
                correo, 
                estado, 
                roles ( nombre )
            `)
            .eq('rol_id', 2)
            .order('created_at', { ascending: false }); 

        if (error) {
            throw new BadRequestException(error.message);
        }

        return data.map(u => {
            let nombreRol = 'Docente';
            if (u.roles) {
                nombreRol = Array.isArray(u.roles) 
                    ? u.roles[0]?.nombre 
                    : (u.roles as any).nombre;
            }

            return {
                id: u.id,
                nombre: `${u.nombres} ${u.apellidos}`,
                correo: u.correo,
                estado: u.estado || 'activo', 
                rol: nombreRol
            };
        });
    }

    
    async toggleUserRole(id: string, nuevoRol: string) {
        // 1. Consultamos el estado actual del docente en la base de datos
        const { data: usuarioActual, error: fetchError } = await this.supabase
            .from('usuarios')
            .select('estado')
            .eq('id', id)
            .single();

        if (fetchError || !usuarioActual) {
            throw new BadRequestException('No se pudo encontrar al docente en el sistema.');
        }

       
        const proximoEstado = usuarioActual.estado === 'activo' ? 'pendiente' : 'activo';

        // 3. Actualizamos únicamente la columna estado en la tabla maestra 'usuarios'
        const { error: updateError } = await this.supabase
            .from('usuarios')
            .update({ estado: proximoEstado })
            .eq('id', id);

        if (updateError) throw new BadRequestException(updateError.message);

        return { 
            message: proximoEstado === 'activo' 
                ? 'Docente aprobado y activado correctamente' 
                : 'Acceso de Docente suspendido correctamente' 
        };
    }
}