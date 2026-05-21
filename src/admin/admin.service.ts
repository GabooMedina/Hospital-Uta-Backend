import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';

@Injectable()
export class AdminService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string,
        );
    }

    // 1. LISTAR ALUMNOS (Cruce con la tabla detalles_estudiantes)
    async findAllAlumnos() {
        console.log('=== [BACKEND] SOLICITANDO LISTA DE ALUMNOS ACADÉMICOS ===');
        
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
            console.error('❌ Error en query de Supabase:', error.message);
            throw new BadRequestException(error.message);
        }

        return data.map(u => {
            // Guardamos la referencia de la subtabla de forma segura
            const detalles = u.detalles_estudiantes;
            
            // Verificación dinámica: detectamos si es un Arreglo o un Objeto Directo
            const infoAcademica = Array.isArray(detalles) ? detalles[0] : detalles;

            return {
                id: u.id,
                nombre: `${u.nombres} ${u.apellidos}`,
                correo: u.correo,
                estado: u.estado,
                // Extraemos las propiedades de la forma detectada con un respaldo de seguridad
                semestre: infoAcademica?.semestre || '-',
                paralelo: infoAcademica?.paralelo || '-'
            };
        });
    }

   // 2. LISTAR TODOS LOS USUARIOS (Consumido por el fetchUsuariosSystem del front)
    async findAllUsuarios() {
        console.log('=== [BACKEND] SOLICITANDO LISTA GENERAL DE USUARIOS ===');
        
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
            console.error('❌ Error en query de Supabase (General):', error.message);
            throw new BadRequestException(error.message);
        }

        const mappedData = data.map(u => ({
            id: u.id,
            nombre: `${u.nombres} ${u.apellidos}`,
            correo: u.correo,
            rol: u.roles ? (u.roles as any).nombre : 'Estudiante'
        }));

        console.log('🚀 Usuarios mapeados listos para enviar:', mappedData);
        return mappedData;
    }

    // 3. EDITAR ALUMNO (Actualiza ambas tablas mediante consistencia)
    async updateAlumno(id: string, dto: UpdateAlumnoDto) {
        // Actualizamos primero los metadatos del usuario principal
        const { error: userError } = await this.supabase
            .from('usuarios')
            .update({
                nombres: dto.nombres,
                apellidos: dto.apellidos
            })
            .eq('id', id);

        if (userError) throw new BadRequestException(userError.message);

        // Si se enviaron datos académicos, actualizamos la tabla secundaria
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

        return { message: 'Estudiante actualizado con éxito' };
    }

    // 4. ELIMINAR ALUMNO (El ON DELETE CASCADE de tu SQL se encarga de las secundarias automáticamente)
    async deleteAlumno(id: string) {
        const { error } = await this.supabase
            .from('usuarios')
            .delete()
            .eq('id', id);

        if (error) throw new BadRequestException(error.message);
        return { message: 'Estudiante eliminado del sistema correctamente' };
    }

    // 5. TOGGLE BAR DE ROLES (Manejo de flujo según tu modelo relacional)
    async toggleUserRole(id: string, nuevoRol: string) {
        const rolIdTarget = nuevoRol === 'Docente' ? 2 : 3; 

        // 1. Actualizamos el rol en la tabla maestra
        const { error: roleError } = await this.supabase
            .from('usuarios')
            .update({ rol_id: rolIdTarget })
            .eq('id', id);

        if (roleError) throw new BadRequestException(roleError.message);

        // 2. Mantenemos la consistencia relacional de tus tablas específicas
        if (nuevoRol === 'Docente') {
            // Eliminamos de detalles de estudiante e insertamos en detalles de docente
            await this.supabase.from('detalles_estudiantes').delete().eq('usuario_id', id);
            await this.supabase.from('detalles_docentes').upsert({ usuario_id: id });
        } else {
            // Eliminamos de detalles de docente e insertamos valores por defecto en estudiante
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