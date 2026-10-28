import { createSession, type Session, type SessionOptions } from '../../src/app/session';
import type { VisibilitySource } from '../../src/platform';
import { makeEconomyTuning } from './makeEconomyTuning';
import { makeFakeClockSources, type FakeClockSources } from './makeFakeClockSources';
import { makeState } from './makeState';

export interface SessionHarness {
  readonly session: Session;
  readonly clock: FakeClockSources;
  readonly setVisible: (isVisible: boolean) => void;
  // Lets real time pass in frames of at most frameRealMs, running one frame after each.
  readonly passRealMs: (realMs: number, frameRealMs?: number) => void;
}

const defaultFrameRealMs = 1_000;

interface FakeVisibility {
  readonly source: VisibilitySource;
  readonly setVisible: (isVisible: boolean) => void;
}

function makeFakeVisibility(isInitiallyVisible: boolean): FakeVisibility {
  let isVisible = isInitiallyVisible;
  const listeners = new Set<(isVisible: boolean) => void>();
  const source: VisibilitySource = {
    isDocumentVisible: () => isVisible,
    watchVisibility: (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
  };
  const setVisible = (next: boolean): void => {
    isVisible = next;
    for (const onChange of listeners) onChange(next);
  };
  return { source, setVisible };
}

// A session on fake platform sources only: the core runs for real (mock only at platform/).
export function makeSessionHarness(
  overrides: Partial<SessionOptions> = {},
  isInitiallyVisible = true,
): SessionHarness {
  const clock = makeFakeClockSources();
  const visibility = makeFakeVisibility(isInitiallyVisible);
  const session = createSession({
    state: makeState(),
    tuning: makeEconomyTuning(),
    clockSources: clock.sources,
    visibility: visibility.source,
    ...overrides,
  });
  const passRealMs = (realMs: number, frameRealMs = defaultFrameRealMs): void => {
    let remainingRealMs = realMs;
    do {
      const stepRealMs = Math.min(frameRealMs, remainingRealMs);
      clock.passRealMs(stepRealMs);
      clock.runFrame();
      remainingRealMs -= stepRealMs;
    } while (remainingRealMs > 0);
  };
  return { session, clock, setVisible: visibility.setVisible, passRealMs };
}
