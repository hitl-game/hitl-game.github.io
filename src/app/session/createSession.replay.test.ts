import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  commandArbitrary,
  gameMsArbitrary,
  makeEconomyTuning,
  makeRunStart,
  makeSessionHarness,
  makeState,
  makeStateWithEvents,
  runStartArbitrary,
  type SessionHarness,
} from '../../../tests/builders';
import {
  convertRealWindowToGameMs,
  fingerprint,
  gameSpeeds,
  pauseReasons,
  REAL_MS_PER_GAME_MS_BY_SPEED,
  replay,
  replayFrom,
  timings,
  type Command,
  type PauseReason,
} from '../../core';

const tuning = makeEconomyTuning();

type LiveAction =
  | { readonly kind: 'passRealMs'; readonly realMs: number }
  | { readonly kind: 'pause' | 'resume'; readonly reason: PauseReason }
  | { readonly kind: 'setVisible'; readonly isVisible: boolean }
  | { readonly kind: 'dispatch'; readonly command: Command }
  | { readonly kind: 'markDeployed' };

const liveActionArbitrary: fc.Arbitrary<LiveAction> = fc.oneof(
  fc.record({
    kind: fc.constant('passRealMs' as const),
    realMs: fc.integer({ min: 0, max: 400_000 }),
  }),
  fc.record({
    kind: fc.constantFrom('pause' as const, 'resume' as const),
    reason: fc.constantFrom(...pauseReasons),
  }),
  fc.record({ kind: fc.constant('setVisible' as const), isVisible: fc.boolean() }),
  fc.record({ kind: fc.constant('dispatch' as const), command: commandArbitrary }),
  fc.record({ kind: fc.constant('markDeployed' as const) }),
);

function applyAction(harness: SessionHarness, action: LiveAction): void {
  const { session } = harness;
  switch (action.kind) {
    case 'passRealMs':
      harness.passRealMs(action.realMs, 20_000);
      return;
    case 'pause':
      session.pause(action.reason);
      return;
    case 'resume':
      session.resume(action.reason);
      return;
    case 'setVisible':
      harness.setVisible(action.isVisible);
      return;
    case 'dispatch':
      session.dispatch(action.command);
      return;
    case 'markDeployed':
      session.markDeployed();
  }
}

// A final accepted command makes the log cover the whole live run, so replay has no tail.
function dispatchClosingCommand(harness: SessionHarness): void {
  const current = harness.session.state.value.settings.timing;
  const timing = timings.find((candidate) => candidate !== current) ?? 'standard';
  expect(harness.session.dispatch({ type: 'changeTiming', timing }).ok).toBe(true);
}

describe('createSession: live play equals replay (DET-01, DET-09)', () => {
  it('replays a live session with pauses, visibility, stops and setting changes', () => {
    fc.assert(
      fc.property(
        runStartArbitrary,
        // A shared time makes same-gameMs stops, the case the replay contract exists for.
        fc.array(fc.oneof(gameMsArbitrary, fc.constant(30_000)), { maxLength: 3 }),
        fc.array(liveActionArbitrary, { maxLength: 24 }),
        (start, decisionTimes, actions) => {
          const pending = decisionTimes.map((gameMs) => ({
            gameMs,
            kind: 'heavyDecisionDue' as const,
          }));
          const initial = makeStateWithEvents(pending, start, tuning);
          const harness = makeSessionHarness({ state: initial, tuning });
          for (const action of actions) applyAction(harness, action);
          dispatchClosingCommand(harness);

          const live = harness.session.state.value;
          const replayed = replayFrom(initial, live.inputLog, tuning);

          expect(fingerprint(replayed.state)).toBe(fingerprint(live));
          harness.session.dispose();
        },
      ),
    );
  });

  it('replays two speed changes at arbitrary game times to the live fingerprint', () => {
    const realGapArbitrary = fc.integer({ min: 0, max: 300_000 });
    fc.assert(
      fc.property(realGapArbitrary, realGapArbitrary, realGapArbitrary, (gapA, gapB, gapC) => {
        const start = makeRunStart();
        const harness = makeSessionHarness({ state: makeState({}, start, tuning), tuning });
        harness.session.markDeployed();
        harness.passRealMs(gapA, 7_000);
        harness.session.dispatch({ type: 'changeGameSpeed', speed: 'quarter' });
        harness.passRealMs(gapB, 7_000);
        harness.session.dispatch({ type: 'changeGameSpeed', speed: 'half' });
        harness.passRealMs(gapC, 7_000);
        dispatchClosingCommand(harness);

        const live = harness.session.state.value;

        expect(live.inputLog).toHaveLength(3);
        expect(fingerprint(replay(start, live.inputLog, tuning).state)).toBe(fingerprint(live));
      }),
    );
  });

  it('leaves the fingerprint unchanged for presentation-only actions', () => {
    const harness = makeSessionHarness();
    harness.session.markDeployed();
    harness.passRealMs(3_000);
    const before = fingerprint(harness.session.state.value);

    harness.session.pause('settings');
    harness.setVisible(false);
    harness.setVisible(true);
    harness.session.resume('settings');

    expect(fingerprint(harness.session.state.value)).toBe(before);
  });
});

describe('createSession: real windows (AC 7)', () => {
  it('lets a window converted at the speed in force run out after exactly its real time', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 600 }),
        fc.constantFrom(...gameSpeeds),
        (windowSeconds, speed) => {
          const windowRealMs = windowSeconds * 1_000;
          const harness = makeSessionHarness();
          harness.session.markDeployed();
          if (speed !== 'full') harness.session.dispatch({ type: 'changeGameSpeed', speed });
          const openedAtGameMs = harness.session.state.value.nowGameMs;
          const windowGameMs = convertRealWindowToGameMs(windowRealMs, speed);

          harness.passRealMs(windowRealMs, 9_000);

          expect(harness.session.state.value.nowGameMs - openedAtGameMs).toBe(windowGameMs);
          expect(windowGameMs * REAL_MS_PER_GAME_MS_BY_SPEED[speed]).toBe(windowRealMs);
        },
      ),
    );
  });
});
