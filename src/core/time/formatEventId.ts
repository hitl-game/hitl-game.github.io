import { assertInvariant } from '../../shared';
import { ID_SEQUENCE_LIMIT, ID_SEQUENCE_WIDTH } from '../constants';
import type { EventId } from './queuedEvent';

export function formatEventId(sequence: number): EventId {
  assertInvariant(
    Number.isSafeInteger(sequence) && sequence > 0 && sequence < ID_SEQUENCE_LIMIT,
    'an event sequence number fits the zero-padded ID width',
  );
  return `evt-${String(sequence).padStart(ID_SEQUENCE_WIDTH, '0')}` as EventId;
}
