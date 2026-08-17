import { Controller, Post, Get, Body, Req, UseGuards, HttpException, HttpStatus, Param } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'; // Ajusta la ruta si es diferente

@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  // Unity o Frontend descarga las evaluaciones
  @Get('active')
  async getActiveEvaluations() {
    try {
      return await this.evaluationsService.getActiveEvaluations();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Frontend (Docente/Admin) crea una evaluación
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createEvaluation(@Body() data: any, @Req() req: any) {
    try {
      const userId = req.user.sub; // Supabase JWT payload tiene el ID en 'sub'
      return await this.evaluationsService.createEvaluation(data, userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Unity envía las respuestas de una evaluación
  @Post(':id/submit')
  async submitAnswers(@Param('id') id: string, @Body() data: { answers: any[] }) {
    try {
      return await this.evaluationsService.submitAnswers(id, data.answers);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
