export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export interface LevelConfig {
  name: string;
  description: string;
  bpm: number;
  spawnInterval: number; // in ms
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  theme: Theme;
}

export interface TileData {
  id: string;
  lane: number; // 0, 1, 2, 3
  spawnTime: number; // timestamp
  played: boolean;
  missed: boolean;
  color: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
}

export enum GameState {
  MENU,
  LOADING,
  PLAYING,
  GAME_OVER
}

export interface GameScore {
  score: number;
  combo: number;
  maxCombo: number;
  perfects: number;
  goods: number;
  misses: number;
}
