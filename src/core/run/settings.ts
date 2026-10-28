export const gameSpeeds = ['full', 'half', 'quarter'] as const;

export type GameSpeed = (typeof gameSpeeds)[number];

export const timings = ['standard', 'extended', 'relaxed', 'untimed'] as const;

export type Timing = (typeof timings)[number];

// Simulation settings change replay, so every mid-run change is a logged command (DET-09).
export interface Settings {
  readonly timing: Timing;
  readonly gameSpeed: GameSpeed;
}
