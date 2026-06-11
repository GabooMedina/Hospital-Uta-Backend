import { Controller, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'; // Ajusta la ruta a tu Guard oficial

@ApiTags('Gestión de Estudiantes (Docentes / Clínicos)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // 🔒 Protegido: Requiere login válido, ideal para Docentes
@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) {}

    @Get()
    @ApiOperation({ summary: 'Listar todos los estudiantes asignados a simulaciones' })
    async listarAlumnos() {
        return this.studentsService.findAllAlumnos();
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar la ficha académica y nombres del estudiante' })
    async editarAlumno(@Param('id') id: string, @Body() updateAlumnoDto: UpdateAlumnoDto) {
        return this.studentsService.updateAlumno(id, updateAlumnoDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Dar de baja permanente a un estudiante del hospital virtual' })
    async eliminarAlumno(@Param('id') id: string) {
        return this.studentsService.deleteAlumno(id);
    }
}