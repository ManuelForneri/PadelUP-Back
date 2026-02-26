import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import {
  CourtSide,
  DominantHand,
  UserCategory,
  UserRole,
  UserStatus,
} from '../user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ enum: UserCategory })
  @IsOptional()
  @IsEnum(UserCategory)
  category?: UserCategory;

  @ApiPropertyOptional({ enum: CourtSide })
  @IsOptional()
  @IsEnum(CourtSide)
  court_side?: CourtSide;

  @ApiPropertyOptional({ enum: DominantHand })
  @IsOptional()
  @IsEnum(DominantHand)
  dominant_hand?: DominantHand;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento',
    example: '1995-08-15',
  })
  @IsOptional()
  @IsDateString()
  birth_date?: Date;

  @ApiPropertyOptional({
    description: 'Teléfono (opcional)',
    example: '+5491112345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
