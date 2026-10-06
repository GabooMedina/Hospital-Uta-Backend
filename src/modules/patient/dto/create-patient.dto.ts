import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  unity_tag: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;
}
