import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsPhoneNumber,
} from 'class-validator';
import {
  CourtSide,
  DominantHand,
  UserCategory,
  UserRole,
  UserStatus,
} from '../user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'Email del usuario', example: 'juan@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Nombre', example: 'Juan' })
  @IsString()
  first_name: string;

  @ApiProperty({ description: 'Apellido', example: 'Pérez' })
  @IsString()
  last_name: string;

  @ApiPropertyOptional({ description: 'URL de la foto de perfil' })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ description: 'Google ID del usuario' })
  @IsString()
  google_id: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.PLAYER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus, default: UserStatus.PENDING })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ enum: UserCategory })
  @IsOptional()
  @IsEnum(UserCategory)
  category?: UserCategory;
}
