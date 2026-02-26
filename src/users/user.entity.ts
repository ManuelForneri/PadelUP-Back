import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  PLAYER = 'PLAYER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
}

export enum UserCategory {
  PRIMERA = 'PRIMERA',
  SEGUNDA = 'SEGUNDA',
  TERCERA = 'TERCERA',
  CUARTA = 'CUARTA',
  QUINTA = 'QUINTA',
  SEXTA = 'SEXTA',
  SEPTIMA = 'SEPTIMA',
  OCTAVA = 'OCTAVA',
}

export enum CourtSide {
  DRIVE = 'DRIVE',
  REVES = 'REVES',
  AMBOS = 'AMBOS',
}

export enum DominantHand {
  DERECHA = 'DERECHA',
  IZQUIERDA = 'IZQUIERDA',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ unique: true })
  google_id: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PLAYER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'enum', enum: UserCategory, nullable: true })
  category: UserCategory;

  @Column({ type: 'enum', enum: CourtSide, nullable: true })
  court_side: CourtSide;

  @Column({ type: 'enum', enum: DominantHand, nullable: true })
  dominant_hand: DominantHand;

  @Column({ type: 'date', nullable: true })
  birth_date: Date;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: 0 })
  points: number;

  @Column({ default: false })
  profile_completed: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
