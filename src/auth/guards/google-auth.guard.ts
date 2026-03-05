import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  /**
   * Captura el redirect_uri enviado por el app móvil y lo codifica
   * en el campo "state" del flujo OAuth. Google lo devuelve intacto
   * en el callback, permitiendo redirigir al deep link correcto.
   */
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const redirectUri = request.query?.redirect_uri as string | undefined;

    return {
      state: redirectUri
        ? Buffer.from(redirectUri).toString('base64')
        : undefined,
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }
}
