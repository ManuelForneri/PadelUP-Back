import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserStatus } from './user.entity';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';

export interface GoogleProfile {
  google_id: string;
  email: string;
  first_name: string;
  last_name: string;
  photo: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID: ${id} no encontrado`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findByGoogleId(google_id: string): Promise<User | null> {
    return this.usersRepository.findByGoogleId(google_id);
  }

  async create(userData: CreateUserDto): Promise<User> {
    return this.usersRepository.create(userData);
  }

  /**
   * Busca un usuario por googleId o email. Si no existe, lo crea con status PENDING.
   * Usado durante el callback de Google OAuth.
   */
  async findOrCreateFromGoogle(profile: GoogleProfile): Promise<User> {
    // Primero intentamos por googleId
    let user = await this.usersRepository.findByGoogleId(profile.google_id);

    if (!user) {
      // Luego intentamos por email (por si la cuenta ya existía de otra forma)
      user = await this.usersRepository.findByEmail(profile.email);
    }

    if (!user) {
      // Crear nuevo usuario
      user = await this.usersRepository.create({
        google_id: profile.google_id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        photo: profile.photo,
      });
    }

    return user;
  }

  /**
   * Completa el perfil del usuario después del OAuth (paso 2 del registro).
   */
  async completeProfile(
    userId: string,
    dto: CompleteProfileDto,
  ): Promise<User> {
    const updated = await this.usersRepository.update(userId, {
      ...dto,
      profile_completed: true,
    });
    if (!updated) {
      throw new NotFoundException(`Usuario con ID: ${userId} no encontrado`);
    }
    return updated;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const updatedUser = await this.usersRepository.update(id, userData);
    if (!updatedUser) {
      throw new NotFoundException(`Usuario con ID: ${id} no encontrado`);
    }
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    return this.usersRepository.delete(id);
  }
}
