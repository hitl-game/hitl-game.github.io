import { assertInvariant } from '../shared';
import { formatNumber } from './formatNumber';

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

// m:ss, rounded up so a countdown never shows 0:00 while time remains. Response windows are
// seconds long, so there is no hours form: 75 minutes stay 75:00.
export function formatRealDuration(realMs: number): string {
  assertInvariant(Number.isFinite(realMs), `a real duration must be finite, got ${String(realMs)}`);
  const totalSeconds = Math.ceil(Math.max(realMs, 0) / MS_PER_SECOND);
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${formatNumber('minutes', minutes)}:${formatNumber('seconds', seconds)}`;
}
