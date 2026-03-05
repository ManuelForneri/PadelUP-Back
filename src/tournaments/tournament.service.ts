import { Injectable, NotFoundException } from '@nestjs/common';
import { Tournament } from './tournament.entity';
import { TournamentRepository } from './tournament.repository';
import { CreateTournamentDto } from './dto/tournament.dto';
import { UpdateTournamentDto } from './dto/updateTournament.dto';

@Injectable()
export class TournamentService {
  constructor(private readonly tournamentRepository: TournamentRepository) {}

  async findAll(): Promise<Tournament[]> {
    return this.tournamentRepository.findAll();
  }

  async findById(id: string): Promise<Tournament> {
    const tournament = await this.tournamentRepository.findById(id);
    if (!tournament) {
      throw new NotFoundException(`Torneo con ID: ${id} no encontrado`);
    }
    return tournament;
  }

  async create(createTournamentDto: CreateTournamentDto): Promise<Tournament> {
    return this.tournamentRepository.create(createTournamentDto);
  }

  async update(
    id: string,
    updateTournamentDto: UpdateTournamentDto,
  ): Promise<Tournament> {
    const updated = await this.tournamentRepository.update(
      id,
      updateTournamentDto as any,
    );
    if (!updated) {
      throw new NotFoundException(`Torneo con ID: ${id} no encontrado`);
    }
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await this.tournamentRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Torneo con ID: ${id} no encontrado`);
    }
    return deleted;
  }
}
