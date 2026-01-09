
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'Mixed';

export interface Word {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  level: string;
}

export interface GameState {
  score: number;
  level: JLPTLevel;
  activeBoard: (Word | null)[];
  wordPool: Word[];
  isGameOver: boolean;
  status: 'idle' | 'loading' | 'playing' | 'error';
  timeLeft: number;
}
