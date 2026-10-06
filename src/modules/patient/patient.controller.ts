import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  getAll() {
    return this.patientService.getAllPatients();
  }

  @Get('tag/:unity_tag')
  getByTag(@Param('unity_tag') unity_tag: string) {
    return this.patientService.getPatientByTag(unity_tag);
  }

  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.createPatient(createPatientDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: CreatePatientDto) {
    return this.patientService.updatePatient(+id, updatePatientDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.patientService.deletePatient(+id);
  }
}
