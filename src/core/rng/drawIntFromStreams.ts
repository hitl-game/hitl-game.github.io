import { drawInt } from './drawInt';
import type { RngStreamName, RngStreams } from './rngStreams';

export interface IntRange {
  readonly min: number;
  readonly max: number;
}

export function drawIntFromStreams(
  streams: RngStreams,
  name: RngStreamName,
  range: IntRange,
): readonly [number, RngStreams] {
  const [value, nextStream] = drawInt(streams[name], range.min, range.max);
  return [value, { ...streams, [name]: nextStream }];
}
