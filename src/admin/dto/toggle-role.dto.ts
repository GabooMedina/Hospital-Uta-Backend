import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

export class ToggleRoleDto {
  @ApiProperty({ example: 'Docente', description: 'Roles con acceso: Docente o Estudiante' })
  @IsNotEmpty()
  @IsIn(['Estudiante', 'Docente'], { message: 'El rol debe ser Estudiante o Docente' })
  nuevoRol!: string;
}