import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ToggleRoleDto } from './dto/toggle-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 

@ApiTags('Administración (Exclusivo ADMIN)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('usuarios')
    @ApiOperation({ summary: 'Listar todos los usuarios globales para el control de rangos' })
    async listarUsuarios() {
        return this.adminService.findAllUsuarios();
    }

    @Patch('usuarios/:id/toggle-role')
    @ApiOperation({ summary: 'Cambiar rol de usuario (Estudiante <=> Docente) mediante el Toggle Slider' })
    async toggleRol(@Param('id') id: string, @Body() toggleRoleDto: ToggleRoleDto) {
        return this.adminService.toggleUserRole(id, toggleRoleDto.nuevoRol);
    }
}