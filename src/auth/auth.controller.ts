import { Controller, Post, Body,Headers, UnauthorizedException} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Iniciar sesión en la plataforma' })
    @ApiResponse({ status: 200, description: 'Login exitoso' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('signup')
    @ApiOperation({ summary: 'Registrar un nuevo usuario (Estudiante/Docente)' })
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Error en el registro (Datos inválidos)' })
    async signUp(@Body() signUpDto: SignUpDto) {
        return this.authService.signUp(signUpDto);
    }
    @Post('forgot-password')
    @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }

@Post('reset-password')
    @ApiOperation({ summary: 'Establecer nueva contraseña' })
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
        @Headers('authorization') authHeader: string,
        @Headers('x-refresh-token') refreshToken: string
    ) {
        if (!authHeader || !authHeader.startsWith('Bearer ') || !refreshToken) {
            throw new UnauthorizedException('Componentes de autenticación incompletos');
        }

        const accessToken = authHeader.replace('Bearer ', '').trim();

        return this.authService.updatePassword(resetPasswordDto.newPassword, accessToken, refreshToken);
    }

    @UseGuards(JwtAuthGuard) 
    @Post('logout')
    @ApiOperation({ summary: 'Cerrar sesión en la plataforma e invalidar token' })
    @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
    async logout() {
        return { 
            statusCode: 200, 
            message: 'Sesión cerrada correctamente en el servidor' 
        };
    }
}