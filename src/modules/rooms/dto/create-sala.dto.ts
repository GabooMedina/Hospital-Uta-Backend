import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSalaDto {
  @ApiProperty({ example: 'Unidad de Cuidados Intensivos (UCI)', description: 'Nombre clínico de la sala de simulación' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la sala es obligatorio' })
  nombre!: string;

  @ApiProperty({ example: 'Área equipada para el entrenamiento en atención de pacientes críticos y soporte vital.', description: 'Descripción o guía pedagógica de la sala', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;
}