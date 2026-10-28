import { describe, expect, it } from 'vitest';

import { makeSessionHarness } from '../../../tests/builders';
import { GAME_DAY_MS, gameSpeeds, pauseReasons, REAL_MS_PER_GAME_MS_BY_SPEED } from '../../core';

const startingCashCents = 1_240_000;
const garageBurnCents = 40_000;
const oneHourRealMs = 3_600_000;

describe('createSession: one real minute is one game day (CLK-01)', () => {
  it('advances exactly one game day in 60 real seconds at 1×', () => {
    const { session, passRealMs } = makeSessionHarness();
    session.markDeployed();

    passRealMs(60_000, 16);

    expect(session.state.value.nowGameMs).toBe(GAME_DAY_MS);
    expect(session.state.value.cashCents).toBe(startingCashCents - garageBurnCents);
  });

  it.each([
    ['half', 120_000],
    ['quarter', 240_000],
  ] as const)('logs a change to %s and then takes %i real ms per game day', (speed, dayRealMs) => {
    const { session, passRealMs } = makeSessionHarness();
    session.markDeployed();

    expect(session.dispatch({ type: 'changeGameSpeed', speed })).toEqual({
      ok: true,
      value: undefined,
    });
    const oneGameMsRealMs = REAL_MS_PER_GAME_MS_BY_SPEED[speed];
    passRealMs(dayRealMs - oneGameMsRealMs);
    expect(session.state.value.nowGameMs).toBe(GAME_DAY_MS - 1);
    passRealMs(oneGameMsRealMs);

    expect(session.state.value.inputLog).toEqual([
      { atGameMs: 0, command: { type: 'changeGameSpeed', speed } },
    ]);
    expect(session.state.value.nowGameMs).toBe(GAME_DAY_MS);
  });

  it('settles the same cash per game day at every speed', () => {
    const cashChanges = gameSpeeds.map((speed) => {
      const { session, passRealMs } = makeSessionHarness();
      session.markDeployed();
      if (speed !== 'full') session.dispatch({ type: 'changeGameSpeed', speed });
      passRealMs(GAME_DAY_MS * REAL_MS_PER_GAME_MS_BY_SPEED[speed]);
      return session.state.value.cashCents - startingCashCents;
    });

    expect(cashChanges).toEqual([-garageBurnCents, -garageBurnCents, -garageBurnCents]);
  });

  it('returns settingUnchanged and logs nothing when the speed is already in force', () => {
    const { session } = makeSessionHarness();

    expect(session.dispatch({ type: 'changeGameSpeed', speed: 'full' })).toEqual({
      ok: false,
      error: 'settingUnchanged',
    });
    expect(session.state.value.inputLog).toEqual([]);
  });
});

describe('createSession: pause reasons freeze time (CLK-02)', () => {
  it.each(pauseReasons)('adds no game time while %s is active', (reason) => {
    const { session, passRealMs } = makeSessionHarness();
    session.markDeployed();
    passRealMs(5_000);

    session.pause(reason);
    passRealMs(oneHourRealMs, 60_000);

    expect(session.isClockRunning.value).toBe(false);
    expect(session.state.value.nowGameMs).toBe(5_000);
  });

  it('resumes without a catch-up jump when the last reason is removed', () => {
    const { session, passRealMs } = makeSessionHarness();
    session.markDeployed();
    passRealMs(5_000);
    session.pause('settings');
    passRealMs(oneHourRealMs, 60_000);

    session.resume('settings');
    passRealMs(1_000);

    expect(session.state.value.nowGameMs).toBe(6_000);
  });

  it('stays paused while another reason is still active', () => {
    const { session, passRealMs } = makeSessionHarness();
    session.markDeployed();
    session.pause('settings');
    session.pause('backlog');

    session.resume('settings');
    passRealMs(10_000);

    expect(session.pauseReasons.value).toEqual(new Set(['backlog']));
    expect(session.state.value.nowGameMs).toBe(0);
  });

  it('treats reasons as a set: pausing twice needs one resume', () => {
    const { session, passRealMs } = makeSessionHarness();
    session.markDeployed();
    session.pause('heavyDecision');
    const pausedOnce = session.pauseReasons.value;
    session.pause('heavyDecision');
    expect(session.pauseReasons.value).toBe(pausedOnce);

    session.resume('heavyDecision');
    passRealMs(1_000);

    expect(session.isClockRunning.value).toBe(true);
    expect(session.state.value.nowGameMs).toBe(1_000);
  });
});

describe('createSession: awaiting Deploy (CLK-03)', () => {
  it('adds no game time while Deploy is pending', () => {
    const { session, clock, passRealMs } = makeSessionHarness();

    passRealMs(oneHourRealMs, 60_000);

    expect(session.isAwaitingDeploy.value).toBe(true);
    expect(session.isClockRunning.value).toBe(false);
    expect(clock.pendingFrameCount()).toBe(0);
    expect(session.state.value.nowGameMs).toBe(0);
  });

  it('runs from game time 0 once deployed, not from the real time spent waiting', () => {
    const { session, passRealMs } = makeSessionHarness();
    passRealMs(oneHourRealMs, 60_000);

    session.markDeployed();
    passRealMs(1_000);

    expect(session.state.value.nowGameMs).toBe(1_000);
  });

  it('starts running at once for a session created after its Deploy', () => {
    const { session, passRealMs } = makeSessionHarness({ isAwaitingDeploy: false });

    passRealMs(2_000);

    expect(session.state.value.nowGameMs).toBe(2_000);
  });

  it('adds zero for a real clock moved back and never moves game time back', () => {
    const { session, clock, passRealMs } = makeSessionHarness();
    session.markDeployed();
    passRealMs(10_000);

    clock.passRealMs(-30_000);
    clock.runFrame();
    expect(session.state.value.nowGameMs).toBe(10_000);
    clock.passRealMs(30_000);
    clock.runFrame();
    expect(session.state.value.nowGameMs).toBe(10_000);
    passRealMs(1_000);

    expect(session.state.value.nowGameMs).toBe(11_000);
  });
});

describe('createSession: hidden tab', () => {
  it('cancels the pending frame and requests none while hidden', () => {
    const { session, clock, setVisible } = makeSessionHarness();
    session.markDeployed();
    expect(clock.pendingFrameCount()).toBe(1);

    setVisible(false);

    expect(session.isClockRunning.value).toBe(false);
    expect(clock.pendingFrameCount()).toBe(0);
  });

  it('leaves the hidden period out of game time once visible again', () => {
    const { session, clock, setVisible, passRealMs } = makeSessionHarness();
    session.markDeployed();
    passRealMs(3_000);
    setVisible(false);
    clock.passRealMs(oneHourRealMs);

    setVisible(true);
    passRealMs(1_000);

    expect(session.state.value.nowGameMs).toBe(4_000);
  });

  it('does not run a session created in a hidden tab until it becomes visible', () => {
    const hidden = makeSessionHarness({ isAwaitingDeploy: false }, false);
    expect(hidden.clock.pendingFrameCount()).toBe(0);
    hidden.passRealMs(5_000);
    expect(hidden.session.state.value.nowGameMs).toBe(0);

    hidden.setVisible(true);
    hidden.passRealMs(1_000);

    expect(hidden.session.state.value.nowGameMs).toBe(1_000);
  });
});
