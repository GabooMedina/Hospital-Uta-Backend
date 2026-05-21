import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'gmedina3108@uta.edu.ec' })
  @IsEmail()
  email!: string;
}