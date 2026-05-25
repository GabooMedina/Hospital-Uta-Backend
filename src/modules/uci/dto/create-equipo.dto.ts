import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateEquipoDto {
  @IsNumber()
  @IsNotEmpty()
  sala_id!: number; // ID de la sala a la que pertenece

  @IsString()
  @IsNotEmpty()
  unity_tag!: string; // Match exacto con GameObject.name en Unity

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;
}