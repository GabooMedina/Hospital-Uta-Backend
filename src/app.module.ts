import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { StudentsModule } from './modules/students/students.module';
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
export class AppModule {}