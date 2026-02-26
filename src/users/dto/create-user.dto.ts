import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { CourtSide, DominantHand } from '../user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique identifier of the user (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'First name of the user', example: 'John' })
  @IsString()
  first_name: string;

  @ApiProperty({ description: 'Last name of the user', example: 'Doe' })
  @IsString()
  last_name: string;

  @ApiPropertyOptional({
    description: "UUID of the user's category",
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Preferred court side',
    enum: CourtSide,
    example: CourtSide.DRIVE,
  })
  @IsOptional()
  @IsEnum(CourtSide)
  court_side?: CourtSide;

  @ApiPropertyOptional({
    description: 'Dominant hand of the player',
    enum: DominantHand,
    example: DominantHand.RIGHT,
  })
  @IsOptional()
  @IsEnum(DominantHand)
  dominant_hand?: DominantHand;
}
