import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateEquipoDto } from './dto/create-equipo.dto';

@Injectable()
export class EquipmentService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    );
  }

  // 1. LEER TODO
  async obtenerTodosLosEquipos() {
    const { data, error } = await this.supabase
      .from('equipos_medicos')
      .select('*, salas ( nombre )')
      .order('id', { ascending: true });
    
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // 2. LEER POR TAG (Gafas VR)
  async obtenerEquipoPorTag(tag: string) {
    const { data, error } = await this.supabase
      .from('equipos_medicos')
      .select('nombre, descripcion')
      .eq('unity_tag', tag)
      .single();

    if (error || !data) {
      throw new NotFoundException('El equipo médico no se encuentra catalogado en el hospital virtual');
    }
    return data;
  }

  // 3. CREAR EXCLUSIVAMENTE (POST)
  async crearEquipo(dto: CreateEquipoDto, usuarioId: string) {
    const { data, error } = await this.supabase
      .from('equipos_medicos')
      .insert([
        {
          sala_id: dto.sala_id,
          unity_tag: dto.unity_tag,
          nombre: dto.nombre,
          descripcion: dto.descripcion,
          creado_por: usuarioId,
        }
      ])
      .select();

    if (error) {
      // Mantenemos el control elegante si se intenta duplicar una clave única en producción
      if (error.code === '23505') {
        throw new BadRequestException(`El tag de Unity '${dto.unity_tag}' ya está asignado a otro equipo.`);
      }
      throw new BadRequestException(error.message);
    }
    return data[0];
  }

  // 4. ACTUALIZAR EXCLUSIVAMENTE (PUT)
  async actualizarEquipo(tag: string, dto: CreateEquipoDto) {
    const { data, error } = await this.supabase
      .from('equipos_medicos')
      .update({
        sala_id: dto.sala_id,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        updated_at: new Date()
      })
      .eq('unity_tag', tag)
      .select();

    if (error) throw new BadRequestException(error.message);
    
    if (!data || data.length === 0) {
      throw new NotFoundException(`No se encontró ningún equipo registrado con el tag '${tag}' para actualizar.`);
    }
    return data[0];
  }

  // 5. ELIMINAR
  async eliminarEquipo(id: number) {
    const { error } = await this.supabase.from('equipos_medicos').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Equipo médico removido del catálogo con éxito' };
  }
}