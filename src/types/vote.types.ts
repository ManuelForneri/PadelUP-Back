import { Types } from 'mongoose';

export interface IVoteRequest {
  voterId: Types.ObjectId;  // ID del usuario que está votando
  voteType: 'up' | 'down';  // 'up' para "Está bien", 'down' para "Está pasado"
}

export interface IVoteResponse {
  success: boolean;
  message: string;
  data?: {
    upVotes: number;
    downVotes: number;
    totalVotes: number;
  };
  error?: string;
}
