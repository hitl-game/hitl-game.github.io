import { browserClockSources, type ClockSources } from './clockSources';

export interface GameClockOptions {
  readonly onFrame: () => void;
  readonly sources?: ClockSources | undefined;
}

export interface GameClock {
  // Starts the frame loop, or re-anchors it when already running: game time continues from
  // fromGameMs at the given rate, so a restart or a speed change never jumps.
  readonly start: (fromGameMs: number, realMsPerGameMs: number) => void;
  readonly stop: () => void;
  readonly readGameMs: () => number;
}

export function createGameClock(options: GameClockOptions): GameClock {
  const { onFrame, sources = browserClockSources } = options;
  let anchorRealMs = 0;
  let anchorGameMs = 0;
  let realMsPerGameMs = 1;
  let isRunning = false;
  let pendingFrameId: number | null = null;

  // Anchored, not a sum of frame deltas: flooring each frame would drift, and a clock that
  // moved back simply counts as zero elapsed time.
  const readGameMs = (): number => {
    if (!isRunning) return anchorGameMs;
    const elapsedRealMs = Math.max(0, sources.readNowRealMs() - anchorRealMs);
    return anchorGameMs + Math.floor(elapsedRealMs / realMsPerGameMs);
  };

  // onFrame may stop or re-anchor the clock, so the next frame is requested only afterwards.
  const requestNextFrame = (): void => {
    if (isRunning && pendingFrameId === null) pendingFrameId = sources.requestFrame(runFrame);
  };

  function runFrame(): void {
    pendingFrameId = null;
    if (!isRunning) return;
    try {
      onFrame();
    } finally {
      // A throwing frame must not leave a running clock with no frame requested.
      requestNextFrame();
    }
  }

  const start = (fromGameMs: number, nextRealMsPerGameMs: number): void => {
    anchorRealMs = sources.readNowRealMs();
    anchorGameMs = fromGameMs;
    realMsPerGameMs = nextRealMsPerGameMs;
    isRunning = true;
    requestNextFrame();
  };

  const stop = (): void => {
    anchorGameMs = readGameMs();
    isRunning = false;
    if (pendingFrameId !== null) sources.cancelFrame(pendingFrameId);
    pendingFrameId = null;
  };

  return { start, stop, readGameMs };
}
