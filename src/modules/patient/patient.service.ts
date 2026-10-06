import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    );
  }

  async getAllPatients() {
    const { data, error } = await this.supabase
      .from('patients')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getPatientByTag(tag: string) {
    const { data, error } = await this.supabase
      .from('patients')
      .select('unity_tag, nombre, descripcion')
      .eq('unity_tag', tag)
      .single();

    if (error || !data) {
      throw new NotFoundException('Paciente no registrado');
    }
    return data;
  }

  async createPatient(dto: CreatePatientDto) {
    const { data, error } = await this.supabase
      .from('patients')
      .insert([
        {
          unity_tag: dto.unity_tag,
          nombre: dto.nombre,
          descripcion: dto.descripcion,
        }
      ])
      .select();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException(`El tag de Unity '${dto.unity_tag}' ya está asignado a otro paciente.`);
      }
      throw new BadRequestException(error.message);
    }
    return data[0];
  }

  async updatePatient(id: number, dto: CreatePatientDto) {
    const { data, error } = await this.supabase
      .from('patients')
      .update({
        unity_tag: dto.unity_tag,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
      })
      .eq('id', id)
      .select();

    if (error) throw new BadRequestException(error.message);
    
    if (!data || data.length === 0) {
      throw new NotFoundException(`No se encontró ningún paciente con el id '${id}'.`);
    }
    return data[0];
  }

  async deletePatient(id: number) {
    const { error } = await this.supabase.from('patients').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Paciente eliminado con éxito' };
  }
}
