import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEquipoDto {
  @ApiProperty({ example: 1, description: 'ID de la sala médica a la que pertenece el equipo' })
  @IsNumber({}, { message: 'El id de la sala debe ser un número válido' })
  @IsNotEmpty({ message: 'El id de la sala es obligatorio' })
  sala_id!: number;

  @ApiProperty({ example: 'MonitorUCI', description: 'Match exacto con el GameObject.name configurado en la jerarquía de Unity' })
  @IsString()
  @IsNotEmpty({ message: 'El tag de vinculación con Unity es obligatorio' })
  unity_tag!: string;

  @ApiProperty({ example: 'Monitor de Signos Vitales', description: 'Nombre clínico legible para los estudiantes' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre clínico del equipo es obligatorio' })
  nombre!: string;

  @ApiProperty({ example: 'Pantalla multiparámetro para monitoreo continuo de ECG, SpO2 y TA.', description: 'Guía pedagógica que flotará en el Canvas VR' })
  @IsString()
  @IsNotEmpty({ message: 'La descripción pedagógica es obligatoria' })
  descripcion!: string;
}