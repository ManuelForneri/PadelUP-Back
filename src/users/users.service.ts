import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }
  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User whit ID: ${id} not found`);
    }
    return user;
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }
  async create(userData: CreateUserDto): Promise<User> {
    return this.usersRepository.create(userData);
  }
  async update(id: string, userData: Partial<User>): Promise<User> {
    const updatedUser = await this.usersRepository.update(id, userData);
    if (!updatedUser) {
      throw new NotFoundException(`User whit ID: ${id} not found`);
    }
    return updatedUser;
  }
  async delete(id: string): Promise<boolean> {
    return this.usersRepository.delete(id);
  }
}
