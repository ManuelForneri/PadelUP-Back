import { Controller, Get, Req, Res, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
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
   * Acepta ?redirect_uri=<deep_link> para que el callback sepa dónde redirigir.
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
   * Luego buscamos/creamos el usuario y redirigimos al deep link con el JWT.
   *
   * Si no hay state (llamada desde Swagger/browser), devuelve JSON como fallback.
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback de Google OAuth — redirige con JWT' })
  @ApiResponse({
    status: 302,
    description: 'Redirige al deep link del app con access_token.',
  })
  async googleCallback(
    @Req() req: { user: GoogleProfile },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Res() res: any,
    @Query('state') state?: string,
  ): Promise<void> {
    const user = await this.authService.validateGoogleUser(req.user);
    const authResponse = this.authService.generateToken(user);

    // Si hay state, es el redirect_uri del app codificado en base64
    if (state) {
      try {
        const redirectUri = Buffer.from(state, 'base64').toString('utf-8');
        const params = new URLSearchParams({
          token: authResponse.access_token,
          profile_completed: String(authResponse.profile_completed),
        });
        return res.redirect(`${redirectUri}?${params.toString()}`);
      } catch {
        // state inválido → fallback a JSON
      }
    }

    // Fallback para testing desde Swagger o browser
    res.json(authResponse);
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
