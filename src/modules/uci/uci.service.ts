import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateSalaDto } from './dto/create-sala.dto';
import { CreateEquipoDto } from './dto/create-equipo.dto';

@Injectable()
export class UciService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    );
  }

  // ==========================================
  // 🏢 LÓGICA DEL CRUD DE SALAS / MÓDULOS
  // ==========================================

  async crearSala(dto: CreateSalaDto) {
    const { data, error } = await this.supabase.from('salas').insert([dto]).select();
    if (error) throw new BadRequestException(error.message);
    return data[0];
  }

  async obtenerSalas() {
    const { data, error } = await this.supabase.from('salas').select('*').order('id', { ascending: true });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async eliminarSala(id: number) {
    const { error } = await this.supabase.from('salas').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Sala y sus equipos asociados eliminados con éxito' };
  }

  // ==========================================
  // 🎛️ LÓGICA DEL CRUD DE EQUIPOS MÉDICOS
  // ==========================================

  async obtenerTodosLosEquipos() {
    // Hace un JOIN relacional con la tabla salas para mostrar el nombre de la sala en React
    const { data, error } = await this.supabase
      .from('equipos_medicos')
      .select('*, salas ( nombre )');
    
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // 🚀 ENDPOINT CLAVE PARA LAS GAFAS VR (Unity consumirá este)
  async obtenerEquipoPorTag(tag: string) {
    const { data, error } = await this.supabase
      .from('equipos_medicos')
      .select('nombre, descripcion')
      .eq('unity_tag', tag)
      .single();

    if (error || !data) throw new NotFoundException('El equipo médico no se encuentra catalogado en el hospital virtual');
    return data;
  }

  async guardarOActualizarEquipo(dto: CreateEquipoDto, usuarioId: string) {
    const { data, error } = await this.supabase
      .from('equipos_medicos')
      .upsert({
        sala_id: dto.sala_id,
        unity_tag: dto.unity_tag,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        creado_por: usuarioId,
      }, { onConflict: 'unity_tag' })
      .select();

    if (error) throw new BadRequestException(error.message);
    return data[0];
  }

  async eliminarEquipo(id: number) {
    const { error } = await this.supabase.from('equipos_medicos').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Equipo médico removido del catálogo' };
  }
}