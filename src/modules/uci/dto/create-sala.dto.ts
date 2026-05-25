import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSalaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}