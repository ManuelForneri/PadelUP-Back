import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

export enum CourtSide {
  DRIVE = 'DRIVE',
  BACKHAND = 'BACKHAND',
}

export enum DominantHand {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
}

export enum UserRole {
  PLAYER = 'PLAYER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  @Column({ type: 'enum', enum: CourtSide, nullable: true })
  court_side: CourtSide;

  @Column({ type: 'enum', enum: DominantHand, nullable: true })
  dominant_hand: DominantHand;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PLAYER })
  role: UserRole;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
