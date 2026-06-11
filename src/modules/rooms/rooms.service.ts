import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@Injectable()
export class RoomsService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    );
  }

  // Crear una nueva sala clínica
  async crearSala(dto: CreateSalaDto) {
    const { data, error } = await this.supabase.from('salas').insert([dto]).select();
    if (error) throw new BadRequestException(error.message);
    return data[0];
  }

  // Obtener todas las salas ordenadas por ID
  async obtenerSalas() {
    const { data, error } = await this.supabase.from('salas').select('*').order('id', { ascending: true });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // Actualizar parámetros pedagógicos de la sala
  async actualizarSala(id: number, dto: UpdateSalaDto) {
    const { data, error } = await this.supabase
      .from('salas')
      .update(dto)
      .eq('id', id)
      .select();

    if (error) throw new BadRequestException(error.message);
    if (!data || data.length === 0) throw new NotFoundException('La sala clínica solicitada no existe en la base de datos');
    
    return data[0];
  }

  // ELIMINAR CONTROLADO: Bloquea el borrado si existen dependencias en el catálogo VR
  async eliminarSala(id: number) {
    // 1. Consultar si existen equipos asociados a esta sala específica (Optimizado con conteo exacto)
    const { count, error: countError } = await this.supabase
      .from('equipos_medicos')
      .select('*', { count: 'exact', head: true })
      .eq('sala_id', id);

    if (countError) throw new BadRequestException(countError.message);

    // 2. Control restrictivo para asegurar la integridad referencial de los gemelos digitales
    if (count && count > 0) {
      throw new BadRequestException(
        `No se puede eliminar la sala médica porque contiene ${count} equipos biomédicos vinculados. Elimine los equipos primero.`
      );
    }

    // 3. Si la sala está vacía, se ejecuta la remoción física segura
    const { error } = await this.supabase.from('salas').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);

    return { message: 'Sala médica removida del sistema con éxito.' };
  }
}