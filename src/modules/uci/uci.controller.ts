import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UciService } from './uci.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Simulación Clínica (Módulos y Equipos)')
@Controller('uci')
export class UciController {
  constructor(private readonly uciService: UciService) {}

  // --- RUTAS DE SALAS ---
  @Get('salas')
  @ApiOperation({ summary: 'Obtener todas las salas médicas de simulación' })
  async listarSalas() {
    return this.uciService.obtenerSalas();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('salas')
  @ApiOperation({ summary: 'Registrar una nueva sala de simulación (Docente/Admin)' })
  async registrarSala(@Body() dto: CreateSalaDto) {
    return this.uciService.crearSala(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('salas/:id')
  @ApiOperation({ summary: 'Eliminar una sala médica por ID' })
  async removerSala(@Param('id', ParseIntPipe) id: number) {
    return this.uciService.eliminarSala(id);
  }

  // --- RUTAS DE EQUIPOS MÉDICOS ---
  @Get('equipos')
  @ApiOperation({ summary: 'Listar todos los equipos registrados con sus respectivas salas' })
  async listarEquipos() {
    return this.uciService.obtenerTodosLosEquipos();
  }

  // 🥽 ENDPOINT EXCLUSIVO PARA EL RAYCAST DE LAS GAFAS VR
  @Get('equipos/tag/:tag')
  @ApiOperation({ summary: 'Consulta directa desde Unity mediante el Tag del GameObject' })
  async buscarPorTag(@Param('tag') tag: string) {
    return this.uciService.obtenerEquipoPorTag(tag);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('equipos')
  @ApiOperation({ summary: 'Registrar o actualizar un equipo médico (Docente/Admin)' })
  async guardarEquipo(@Body() dto: CreateEquipoDto, @Req() req: any) {
    return this.uciService.guardarOActualizarEquipo(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('equipos/:id')
  @ApiOperation({ summary: 'Eliminar un equipo médico del catálogo' })
  async removerEquipo(@Param('id', ParseIntPipe) id: number) {
    return this.uciService.eliminarEquipo(id);
  }
}