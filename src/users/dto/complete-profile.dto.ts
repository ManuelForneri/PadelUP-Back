import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { CourtSide, DominantHand } from '../user.entity';

export class CompleteProfileDto {
  @ApiProperty({
    description: 'Posición preferida en la cancha',
    enum: CourtSide,
    example: CourtSide.DRIVE,
  })
  @IsEnum(CourtSide)
  @IsNotEmpty()
  court_side: CourtSide;

  @ApiProperty({
    description: 'Mano dominante',
    enum: DominantHand,
    example: DominantHand.DERECHA,
  })
  @IsEnum(DominantHand)
  @IsNotEmpty()
  dominant_hand: DominantHand;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '1995-08-15',
  })
  @IsDateString()
  @IsNotEmpty()
  birth_date: Date;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto (opcional)',
    example: '+5491112345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
