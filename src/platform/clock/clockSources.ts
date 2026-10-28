export interface ClockSources {
  readonly readNowRealMs: () => number;
  readonly requestFrame: (onFrame: () => void) => number;
  readonly cancelFrame: (frameId: number) => void;
}

export const browserClockSources: ClockSources = {
  readNowRealMs: () => performance.now(),
  requestFrame: (onFrame) => requestAnimationFrame(onFrame),
  cancelFrame: (frameId) => {
    cancelAnimationFrame(frameId);
  },
};
