import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { CreateTournamentDto } from './dto/tournament.dto';
import { UpdateTournamentDto } from './dto/updateTournament.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { Tournament } from './tournament.entity';

@ApiTags('tournaments')
@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los torneos' })
  @ApiResponse({
    status: 200,
    description: 'Listado de torneos',
    type: [Tournament],
  })
  findAll() {
    return this.tournamentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un torneo por ID' })
  @ApiResponse({
    status: 200,
    description: 'Torneo encontrado',
    type: Tournament,
  })
  findOne(@Param('id') id: string) {
    return this.tournamentService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Crear un nuevo torneo' })
  @ApiResponse({
    status: 201,
    description: 'Torneo creado con éxito',
    type: Tournament,
  })
  create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentService.create(createTournamentDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Actualizar un torneo existente' })
  @ApiResponse({
    status: 200,
    description: 'Torneo actualizado',
    type: Tournament,
  })
  update(
    @Param('id') id: string,
    @Body() updateTournamentDto: UpdateTournamentDto,
  ) {
    return this.tournamentService.update(id, updateTournamentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Eliminar un torneo' })
  @ApiResponse({ status: 200, description: 'Torneo eliminado' })
  remove(@Param('id') id: string) {
    return this.tournamentService.remove(id);
  }
}
