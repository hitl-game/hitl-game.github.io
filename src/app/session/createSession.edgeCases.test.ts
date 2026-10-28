import { describe, expect, it } from 'vitest';

import {
  makeEconomyTuning,
  makeSessionHarness,
  makeStateWithEvents,
} from '../../../tests/builders';
import { assertStateIsValid, fingerprint, GAME_DAY_MS, replayFrom } from '../../core';

const tuning = makeEconomyTuning();

describe('createSession: blocking stop', () => {
  it('stops the clock at a heavy decision and makes no advance until a command is logged', () => {
    const initial = makeStateWithEvents([
      { gameMs: 500, kind: 'heavyDecisionDue' },
      { gameMs: 500, kind: 'heavyDecisionDue' },
    ]);
    const { session, clock, passRealMs } = makeSessionHarness({ state: initial });
    session.markDeployed();

    passRealMs(2_000);
    const stopped = session.state.value;
    expect(stopped.nowGameMs).toBe(500);
    expect(session.isClockRunning.value).toBe(false);
    expect(clock.pendingFrameCount()).toBe(0);
    clock.passRealMs(5_000);
    clock.runFrame();
    expect(session.state.value).toBe(stopped);

    session.dispatch({ type: 'changeGameSpeed', speed: 'half' });

    // A zero-length advance before logging would have opened the second decision.
    const queuedDecisions = session.state.value.queue.filter(
      (event) => event.kind === 'heavyDecisionDue',
    );
    expect(queuedDecisions).toHaveLength(1);
    expect(session.state.value.inputLog).toEqual([
      { atGameMs: 500, command: { type: 'changeGameSpeed', speed: 'half' } },
    ]);
    expect(session.isClockRunning.value).toBe(true);
    const replayed = replayFrom(initial, session.state.value.inputLog, tuning);
    expect(fingerprint(replayed.state)).toBe(fingerprint(session.state.value));
  });

  it('opens the second decision at the same game ms on the next frame after the command', () => {
    const initial = makeStateWithEvents([
      { gameMs: 500, kind: 'heavyDecisionDue' },
      { gameMs: 500, kind: 'heavyDecisionDue' },
    ]);
    const { session, passRealMs } = makeSessionHarness({ state: initial });
    session.markDeployed();
    passRealMs(1_000);
    session.dispatch({ type: 'changeTiming', timing: 'relaxed' });

    passRealMs(1_000);

    expect(session.state.value.nowGameMs).toBe(500);
    expect(session.isClockRunning.value).toBe(false);
    expect(session.state.value.queue.some((event) => event.kind === 'heavyDecisionDue')).toBe(
      false,
    );
  });

  it('replays back-to-back commands after a stop with a second decision at the same game ms', () => {
    const initial = makeStateWithEvents([
      { gameMs: 500, kind: 'heavyDecisionDue' },
      { gameMs: 500, kind: 'heavyDecisionDue' },
    ]);
    const { session, passRealMs } = makeSessionHarness({ state: initial });
    session.markDeployed();
    passRealMs(1_000);

    session.dispatch({ type: 'changeTiming', timing: 'relaxed' });
    session.dispatch({ type: 'changeTiming', timing: 'extended' });

    const live = session.state.value;
    expect(live.queue.some((event) => event.kind === 'heavyDecisionDue')).toBe(false);
    expect(fingerprint(replayFrom(initial, live.inputLog, tuning).state)).toBe(fingerprint(live));
  });

  it('keeps a rejected command after a stop from clearing the stop', () => {
    const initial = makeStateWithEvents([{ gameMs: 500, kind: 'heavyDecisionDue' }]);
    const { session, passRealMs } = makeSessionHarness({ state: initial });
    session.markDeployed();
    passRealMs(1_000);

    const result = session.dispatch({ type: 'changeGameSpeed', speed: 'full' });

    expect(result).toEqual({ ok: false, error: 'settingUnchanged' });
    expect(session.isClockRunning.value).toBe(false);
  });
});

describe('createSession: edge cases', () => {
  it('writes no new state for a frame with zero real delta', () => {
    const { session, clock, passRealMs } = makeSessionHarness();
    session.markDeployed();
    passRealMs(1_000);
    const before = session.state.value;

    clock.runFrame();

    expect(session.state.value).toBe(before);
  });

  it('catches up a long visible gap in one frame with a valid state', () => {
    const { session, clock } = makeSessionHarness();
    session.markDeployed();

    clock.passRealMs(14 * GAME_DAY_MS);
    clock.runFrame();

    expect(session.state.value.nowGameMs).toBe(14 * GAME_DAY_MS);
    expect(session.state.value.cashCents).toBe(1_240_000 - 14 * 40_000);
    expect(() => {
      assertStateIsValid(session.state.value);
    }).not.toThrow();
  });

  it('applies a command at the clock time when it lands between frames', () => {
    const { session, clock } = makeSessionHarness();
    session.markDeployed();
    clock.passRealMs(1_234);

    session.dispatch({ type: 'changeTiming', timing: 'extended' });
    const afterCommand = session.state.value;
    clock.runFrame();

    expect(afterCommand.inputLog[0]?.atGameMs).toBe(1_234);
    expect(session.state.value).toBe(afterCommand);
  });

  it('changes speed exactly on a day boundary without a jump', () => {
    const { session, passRealMs } = makeSessionHarness();
    session.markDeployed();
    passRealMs(GAME_DAY_MS);

    session.dispatch({ type: 'changeGameSpeed', speed: 'quarter' });
    passRealMs(4_000);

    expect(session.state.value.inputLog[0]?.atGameMs).toBe(GAME_DAY_MS);
    expect(session.state.value.nowGameMs).toBe(GAME_DAY_MS + 1_000);
  });

  it('logs a speed change before Deploy at game time 0, never -0', () => {
    const { session } = makeSessionHarness();

    session.dispatch({ type: 'changeGameSpeed', speed: 'quarter' });

    const atGameMs = session.state.value.inputLog[0]?.atGameMs;
    expect(Object.is(atGameMs, 0)).toBe(true);
    expect(session.isClockRunning.value).toBe(false);
  });

  it('does nothing after dispose, even for a late frame or a visibility change', () => {
    const { session, clock, setVisible } = makeSessionHarness();
    session.markDeployed();
    const lateFrame = clock.lastRequestedFrame();
    const before = session.state.value;

    session.dispose();
    clock.passRealMs(10_000);
    lateFrame?.();
    setVisible(false);
    setVisible(true);

    expect(clock.pendingFrameCount()).toBe(0);
    expect(session.state.value).toBe(before);
  });
});
