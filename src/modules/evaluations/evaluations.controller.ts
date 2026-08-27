import { Controller, Post, Get, Body, Req, UseGuards, HttpException, HttpStatus, Param } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  // Unity descarga la evaluación activa
  @Get('active')
  async getActiveEvaluations() {
    try {
      return await this.evaluationsService.getActiveEvaluations();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Frontend (Docente/Admin) lista sus evaluaciones
  @UseGuards(JwtAuthGuard)
  @Get('docente')
  async getEvaluationsByDocente(@Req() req: any) {
    try {
      const userId = req.user.sub;
      return await this.evaluationsService.getEvaluationsByDocente(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Frontend (Docente/Admin) ve los detalles de una evaluación
  @UseGuards(JwtAuthGuard)
  @Get(':id/details')
  async getEvaluationDetails(@Param('id') id: string) {
    try {
      return await this.evaluationsService.getEvaluationDetails(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // Frontend (Docente/Admin) crea una evaluación
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createEvaluation(@Body() data: any, @Req() req: any) {
    try {
      const userId = req.user.sub;
      return await this.evaluationsService.createEvaluation(data, userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Unity envía las respuestas de una evaluación
  // Soportamos tanto /:id/submit (REST) como /submit con id en body (Unity bug)
  @Post(':id/submit')
  async submitAnswersParam(@Param('id') id: string, @Body() data: any) {
    try {
      const userId = data.user_id; // Viene del payload de Unity
      return await this.evaluationsService.submitAnswers(id, userId, data.answers);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('submit')
  async submitAnswersBody(@Body() data: any) {
    try {
      const id = data.evaluation_id;
      const userId = data.user_id;
      return await this.evaluationsService.submitAnswers(id, userId, data.answers);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
