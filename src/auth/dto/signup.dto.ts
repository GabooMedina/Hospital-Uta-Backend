import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({ 
    example: 'gmedina3108@uta.edu.ec', 
    description: 'Correo institucional del estudiante o docente' 
  })
  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  email!: string;

  @ApiProperty({ 
    example: 'Password123!', 
    description: 'Contraseña de mínimo 6 caracteres' 
  })
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña es demasiado corta' })
  password!: string;

  @ApiProperty({ example: 'Gabriel Leonardo' })
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  nombres!: string;

  @ApiProperty({ example: 'Medina Vasco' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  apellidos!: string;

  @ApiProperty({ 
    example: 3, 
    description: '1: ADMIN, 2: DOCENTE, 3: ESTUDIANTE' 
  })
  @IsNumber({}, { message: 'El rol_id debe ser un número válido' })
  rol_id!: number;
}