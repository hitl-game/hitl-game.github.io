import type { Command } from './command';

export interface InputLogEntry {
  readonly atGameMs: number;
  readonly command: Command;
}
