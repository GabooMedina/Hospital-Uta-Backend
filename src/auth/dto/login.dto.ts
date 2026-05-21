import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'gmedina3108@uta.edu.ec' })
  @IsEmail({}, { message: 'Debe ser un correo institucional válido' })
  email!: string;

  @ApiProperty({ example: '********' })
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}