import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, GoogleProfile } from '../users/users.service';
import { User } from '../users/user.entity';

export interface AuthResponse {
  access_token: string;
  user: Omit<User, 'google_id'>;
  profile_completed: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(profile: GoogleProfile): Promise<User> {
    return this.usersService.findOrCreateFromGoogle(profile);
  }

  generateToken(user: User): AuthResponse {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      profile_completed: user.profile_completed,
    };

    // Omitir google_id de la respuesta por seguridad
    const { google_id, ...safeUser } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: safeUser,
      profile_completed: user.profile_completed,
    };
  }
}
