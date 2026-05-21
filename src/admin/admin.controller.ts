import { Controller, Get, Put, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { ToggleRoleDto } from './dto/toggle-role.dto';

// CORRECCIÓN: Importamos el Guard oficial exportado de tu archivo
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 

@ApiTags('Administración (Exclusivo ADMIN)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('alumnos')
    @ApiOperation({ summary: 'Listar todos los estudiantes registrados' })
    async listarAlumnos() {
        return this.adminService.findAllAlumnos();
    }

    @Get('usuarios')
    @ApiOperation({ summary: 'Listar todos los usuarios para la vista de configuración' })
    async listarUsuarios() {
        return this.adminService.findAllUsuarios();
    }

    @Put('alumnos/:id')
    @ApiOperation({ summary: 'Editar metadatos de un estudiante' })
    async editarAlumno(@Param('id') id: string, @Body() updateAlumnoDto: UpdateAlumnoDto) {
        return this.adminService.updateAlumno(id, updateAlumnoDto);
    }

    @Delete('alumnos/:id')
    @ApiOperation({ summary: 'Eliminar o dar de baja a un estudiante' })
    async eliminarAlumno(@Param('id') id: string) {
        return this.adminService.deleteAlumno(id);
    }

    @Patch('usuarios/:id/toggle-role')
    @ApiOperation({ summary: 'Cambiar rol de usuario (Estudiante <=> Docente) mediante Toggle Bar' })
    async toggleRol(@Param('id') id: string, @Body() toggleRoleDto: ToggleRoleDto) {
        return this.adminService.toggleUserRole(id, toggleRoleDto.nuevoRol);
    }
}