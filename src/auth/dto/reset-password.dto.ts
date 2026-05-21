import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener un mínimo de 6 caracteres.' })
  newPassword!: string;
}