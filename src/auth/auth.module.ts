import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy, JwtAuthGuard } from './jwt-auth.guard'; 

@Module({
  imports: [PassportModule],
  providers: [AuthService, JwtStrategy, JwtAuthGuard], 
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}