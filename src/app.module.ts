import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { UciModule } from './modules/uci/uci.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que el .env esté disponible en todo el proyecto
    }),
    AuthModule,
    AdminModule,
    UciModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}