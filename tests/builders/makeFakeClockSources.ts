import type { ClockSources } from '../../src/platform';

// A manual stand-in for performance.now and requestAnimationFrame: time moves only when the
// test says so, and frames run only when the test runs them.
export interface FakeClockSources {
  readonly sources: ClockSources;
  readonly passRealMs: (realMs: number) => void;
  readonly runFrame: () => void;
  readonly pendingFrameCount: () => number;
  readonly lastRequestedFrame: () => (() => void) | null;
}

export function makeFakeClockSources(startRealMs = 1_000): FakeClockSources {
  let nowRealMs = startRealMs;
  let nextFrameId = 1;
  let lastFrame: (() => void) | null = null;
  const pending = new Map<number, () => void>();

  const sources: ClockSources = {
    readNowRealMs: () => nowRealMs,
    requestFrame: (onFrame) => {
      const frameId = nextFrameId;
      nextFrameId += 1;
      pending.set(frameId, onFrame);
      lastFrame = onFrame;
      return frameId;
    },
    cancelFrame: (frameId) => {
      pending.delete(frameId);
    },
  };

  const runFrame = (): void => {
    const due = [...pending.values()];
    pending.clear();
    for (const onFrame of due) onFrame();
  };

  return {
    sources,
    passRealMs: (realMs) => {
      nowRealMs += realMs;
    },
    runFrame,
    pendingFrameCount: () => pending.size,
    lastRequestedFrame: () => lastFrame,
  };
}
