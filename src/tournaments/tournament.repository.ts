import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from './tournament.entity';
import { CreateTournamentDto } from './dto/tournament.dto';

@Injectable()
export class TournamentRepository {
  constructor(
    @InjectRepository(Tournament)
    private tournamentRepository: Repository<Tournament>,
  ) {}

  findAll(): Promise<Tournament[]> {
    return this.tournamentRepository.find({ order: { created_at: 'DESC' } });
  }

  findById(id: string): Promise<Tournament | null> {
    return this.tournamentRepository.findOneBy({ id });
  }

  create(tournamentData: CreateTournamentDto): Promise<Tournament> {
    const tournament = this.tournamentRepository.create(
      tournamentData as import('typeorm').DeepPartial<Tournament>,
    );
    return this.tournamentRepository.save(tournament);
  }

  async update(
    id: string,
    tournamentData: Partial<Tournament>,
  ): Promise<Tournament | null> {
    await this.tournamentRepository.update(id, tournamentData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tournamentRepository.delete(id);
    return result.affected !== 0;
  }
}
