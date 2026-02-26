import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from './user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ─── Rutas públicas ───────────────────────────────────────────────

  // ─── Rutas protegidas (cualquier usuario autenticado) ─────────────

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Completar perfil del usuario (paso 2 del registro)',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil completado exitosamente.',
    type: User,
  })
  async completeProfile(
    @CurrentUser() currentUser: User,
    @Body() dto: CompleteProfileDto,
  ): Promise<User> {
    return this.usersService.completeProfile(currentUser.id, dto);
  }

  // ─── Rutas de Admin ───────────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Listado de usuarios.',
    type: [User],
  })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Obtener un usuario por id' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado.', type: User })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      '[ADMIN] Actualizar un usuario (asignar categoría, cambiar rol, etc.)',
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado.', type: User })
  async update(
    @Param('id') id: string,
    @Body() userData: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, userData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Eliminar un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado.',
    schema: { type: 'boolean' },
  })
  async remove(@Param('id') id: string): Promise<boolean> {
    return this.usersService.delete(id);
  }
}
