export type GameSpeed = 'full' | 'half' | 'quarter';

export type Timing = 'standard' | 'extended' | 'relaxed' | 'untimed';

// Simulation settings change replay, so every mid-run change is a logged command (DET-09).
export interface Settings {
  readonly timing: Timing;
  readonly gameSpeed: GameSpeed;
}
