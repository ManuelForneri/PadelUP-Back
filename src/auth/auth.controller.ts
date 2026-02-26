import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService, AuthResponse } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { GoogleProfile } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Paso 1: Redirige al usuario a la pantalla de login de Google.
   * El guard de Passport maneja la redirección automáticamente.
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Iniciar autenticación con Google' })
  googleAuth() {
    // Passport intercepta y redirige a Google — este body nunca se ejecuta
  }

  /**
   * Paso 2: Google redirige aquí con el código de autorización.
   * Passport valida, llama a GoogleStrategy.validate(), y deja el perfil en req.user.
   * Luego buscamos/creamos el usuario y devolvemos el JWT.
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback de Google OAuth — devuelve JWT' })
  @ApiResponse({
    status: 200,
    description:
      'Autenticación exitosa. Devuelve access_token y datos del usuario.',
  })
  async googleCallback(
    @Req() req: { user: GoogleProfile },
  ): Promise<AuthResponse> {
    const user = await this.authService.validateGoogleUser(req.user);
    return this.authService.generateToken(user);
  }

  /**
   * Ruta protegida: devuelve el usuario autenticado según el JWT.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Datos del usuario autenticado.',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  getMe(@CurrentUser() user: User): User {
    return user;
  }
}
