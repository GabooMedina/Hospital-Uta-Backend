import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAlumnoDto {
  @ApiProperty({ example: 'Gabriel Leonardo' })
  @IsNotEmpty({ message: 'El nombre no puede ir vacío' })
  nombres!: string;

  @ApiProperty({ example: 'Medina Vasco' })
  @IsNotEmpty({ message: 'El apellido no puede ir vacío' })
  apellidos!: string;

  @ApiProperty({ example: '8vo' })
  @IsString()
  @IsOptional()
  semestre?: string;

  @ApiProperty({ example: 'A' })
  @IsString()
  @IsOptional()
  paralelo?: string;
}