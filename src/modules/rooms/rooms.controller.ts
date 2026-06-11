import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('UCI - Salas de Simulación')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las salas médicas de simulación' })
  async listarSalas() {
    return this.roomsService.obtenerSalas();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Registrar una nueva sala de simulación (Docente/Admin)' })
  async registrarSala(@Body() dto: CreateSalaDto) {
    return this.roomsService.crearSala(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar parámetros de una sala médica por ID' })
  async modificarSala(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalaDto) {
    return this.roomsService.actualizarSala(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una sala médica por ID' })
  async removerSala(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.eliminarSala(id);
  }
}