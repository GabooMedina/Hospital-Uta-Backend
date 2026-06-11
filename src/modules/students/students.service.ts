import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UpdateAlumnoDto } from './dto/update-alumno.dto'; 

@Injectable()
export class StudentsService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string,
        );
    }

    // 1. LISTAR ALUMNOS ACADÉMICOS (Filtra solo usuarios con rol_id = 3)
    async findAllAlumnos() {
        console.log('=== [BACKEND] DOCENTE SOLICITANDO LISTA DE ESTUDIANTES ===');
        
        const { data, error } = await this.supabase
            .from('usuarios')
            .select(`
                id, 
                nombres, 
                apellidos, 
                correo, 
                estado,
                detalles_estudiantes (
                    semestre,
                    paralelo
                )
            `)
            .eq('rol_id', 3);

        if (error) {
            console.error('❌ Error en query de Supabase (Students):', error.message);
            throw new BadRequestException(error.message);
        }

        return data.map(u => {
            const detalles = u.detalles_estudiantes;
            const infoAcademica = Array.isArray(detalles) ? detalles[0] : detalles;

            return {
                id: u.id,
                nombre: `${u.nombres} ${u.apellidos}`,
                correo: u.correo,
                estado: u.estado,
                semestre: infoAcademica?.semestre || '-',
                paralelo: infoAcademica?.paralelo || '-'
            };
        });
    }

    // 2. EDITAR ALUMNO (Actualización segura en cascada manual de perfiles)
    async updateAlumno(id: string, dto: UpdateAlumnoDto) {

        // Actualizamos primero la tabla maestra 'usuarios'
        const { error: userError } = await this.supabase
            .from('usuarios')
            .update({
                nombres: dto.nombres,
                apellidos: dto.apellidos
            })
            .eq('id', id);

        if (userError) throw new BadRequestException(userError.message);

        // Si viene información de semestre o paralelo, actualizamos la tabla secundaria 'detalles_estudiantes'
        if (dto.semestre || dto.paralelo) {
            const { error: detailError } = await this.supabase
                .from('detalles_estudiantes')
                .update({
                    semestre: dto.semestre,
                    paralelo: dto.paralelo
                })
                .eq('usuario_id', id);

            if (detailError) throw new BadRequestException(detailError.message);
        }

        return { message: 'Estudiante actualizado con éxito desde el módulo académico' };
    }

    // 3. ELIMINAR ALUMNO (De baja permanente, el ON DELETE CASCADE del SQL limpia el resto)
    async deleteAlumno(id: string) {
        console.log(`=== [BACKEND] ELIMINANDO ESTUDIANTE ID: ${id} ===`);

        const { error } = await this.supabase
            .from('usuarios')
            .delete()
            .eq('id', id);

        if (error) throw new BadRequestException(error.message);
        return { message: 'Estudiante removido del sistema académico correctamente' };
    }
}