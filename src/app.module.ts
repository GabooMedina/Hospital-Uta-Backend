import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { StudentsModule } from './modules/students/students.module';
<<<<<<< HEAD
import { PatientModule } from './modules/patient/patient.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    AuthModule,
    AdminModule,
    RoomsModule,
    EquipmentModule,
    StudentsModule,
    PatientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
=======
import { EvaluationsModule } from './modules/evaluations/evaluations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    AuthModule,
    AdminModule,
    RoomsModule,
    EquipmentModule,
    StudentsModule,
    EvaluationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
>>>>>>> e63ae891b0f72611d9733cead365f86dbf8dbec2
export class AppModule {}