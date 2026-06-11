import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EquipmentService } from './equipment.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('UCI - Catálogo de Equipos Médicos')
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los equipos registrados con sus respectivas salas' })
  async listarEquipos() {
    return this.equipmentService.obtenerTodosLosEquipos();
  }

  @Get('tag/:tag')
  @ApiOperation({ summary: 'Consulta directa desde Unity mediante el Tag del GameObject' })
  async buscarPorTag(@Param('tag') tag: string) {
    return this.equipmentService.obtenerEquipoPorTag(tag);
  }

  // RUTAS ADMINISTRATIVAS PROTEGIDAS
  
@UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo equipo médico en el catálogo (Docente/Admin)' })
  async registrarEquipo(@Body() dto: CreateEquipoDto, @Req() req: any) {
    const usuarioId = req.user?.id || req.user?.sub || req.user?.userId;
    
    return this.equipmentService.crearEquipo(dto, usuarioId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':tag')
  @ApiOperation({ summary: 'Actualizar la información pedagógica de un equipo por su Unity Tag' })
  async editarEquipo(@Param('tag') tag: string, @Body() dto: CreateEquipoDto) {
    return this.equipmentService.actualizarEquipo(tag, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un equipo médico del catálogo por ID' })
  async removerEquipo(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.eliminarEquipo(id);
  }
}