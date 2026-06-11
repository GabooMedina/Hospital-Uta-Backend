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

    // Listar todos los usuarios del sistema para la auditoría de rangos
    async findAllUsuarios() {
        const { data, error } = await this.supabase
            .from('usuarios')
            .select(`
                id, 
                nombres, 
                apellidos, 
                correo, 
                roles ( nombre )
            `);

        if (error) {
            throw new BadRequestException(error.message);
        }

        return data.map(u => ({
            id: u.id,
            nombre: `${u.nombres} ${u.apellidos}`,
            correo: u.correo,
            rol: u.roles ? (u.roles as any).nombre : 'Estudiante'
        }));
    }

    // Motor de consistencia relacional para alteración de privilegios
    async toggleUserRole(id: string, nuevoRol: string) {
        const rolIdTarget = nuevoRol === 'Docente' ? 2 : 3; 

        // 1. Actualizamos el rol en la tabla maestra 'usuarios'
        const { error: roleError } = await this.supabase
            .from('usuarios')
            .update({ rol_id: rolIdTarget })
            .eq('id', id);

        if (roleError) throw new BadRequestException(roleError.message);

        // 2. Transacción de consistencia según tu modelo relacional
        if (nuevoRol === 'Docente') {
            // Si asciende a Docente, limpiamos su ficha estudiantil y creamos su registro docente
            await this.supabase.from('detalles_estudiantes').delete().eq('usuario_id', id);
            await this.supabase.from('detalles_docentes').upsert({ usuario_id: id });
        } else {
            // Si desciende a Estudiante, limpiamos su ficha docente e inicializamos su registro académico
            await this.supabase.from('detalles_docentes').delete().eq('usuario_id', id);
            await this.supabase.from('detalles_estudiantes').upsert({ 
                usuario_id: id, 
                semestre: '1er', 
                paralelo: 'A' 
            });
        }

        return { message: `Rol actualizado a ${nuevoRol} correctamente` };
    }
}