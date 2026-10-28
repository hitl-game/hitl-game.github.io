import type { DomainEvent } from '../time';
import type { GameState } from './gameState';

export interface CoreStep {
  readonly state: GameState;
  readonly events: readonly DomainEvent[];
}
