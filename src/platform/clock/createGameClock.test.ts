import { describe, expect, it } from 'vitest';

import { makeFakeClockSources, type FakeClockSources } from '../../../tests/builders';
import { createGameClock, type GameClock } from './createGameClock';

function makeClock(): { clock: GameClock; fake: FakeClockSources; frames: () => number } {
  const fake = makeFakeClockSources();
  let frameCount = 0;
  const clock = createGameClock({
    onFrame: () => {
      frameCount += 1;
    },
    sources: fake.sources,
  });
  return { clock, fake, frames: () => frameCount };
}

describe('createGameClock', () => {
  it.each([
    [1, 60_000],
    [2, 30_000],
    [4, 15_000],
  ])('turns 60,000 real ms into game ms at divisor %i', (divisor, expectedGameMs) => {
    const { clock, fake } = makeClock();
    clock.start(0, divisor);

    fake.passRealMs(60_000);

    expect(clock.readGameMs()).toBe(expectedGameMs);
  });

  it('floors sub-millisecond real time once, without drift across frames', () => {
    const { clock, fake } = makeClock();
    clock.start(100, 4);

    for (let frame = 0; frame < 60; frame += 1) fake.passRealMs(16.7);

    expect(clock.readGameMs()).toBe(100 + Math.floor(1002 / 4));
  });

  it('counts a real clock that moved back as zero and never decreases', () => {
    const { clock, fake } = makeClock();
    clock.start(500, 1);
    fake.passRealMs(200);
    expect(clock.readGameMs()).toBe(700);

    fake.passRealMs(-5_000);

    expect(clock.readGameMs()).toBe(500);
    expect(Number.isSafeInteger(clock.readGameMs())).toBe(true);
  });

  it('continues from the current game ms when re-anchored at a new speed', () => {
    const { clock, fake } = makeClock();
    clock.start(0, 1);
    fake.passRealMs(10_000);

    clock.start(clock.readGameMs(), 4);
    fake.passRealMs(4_000);

    expect(clock.readGameMs()).toBe(11_000);
  });

  it('adds nothing for the real time between stop and start', () => {
    const { clock, fake } = makeClock();
    clock.start(0, 1);
    fake.passRealMs(1_000);
    clock.stop();

    fake.passRealMs(3_600_000);
    expect(clock.readGameMs()).toBe(1_000);
    clock.start(clock.readGameMs(), 1);
    fake.passRealMs(1);

    expect(clock.readGameMs()).toBe(1_001);
  });

  it('calls onFrame once per frame and keeps exactly one frame requested while running', () => {
    const { clock, fake, frames } = makeClock();
    clock.start(0, 1);
    clock.start(0, 2);
    expect(fake.pendingFrameCount()).toBe(1);

    fake.runFrame();
    fake.runFrame();

    expect(frames()).toBe(2);
    expect(fake.pendingFrameCount()).toBe(1);
  });

  it('cancels the pending frame on stop and ignores a late frame callback', () => {
    const { clock, fake, frames } = makeClock();
    clock.start(0, 1);
    const late = fake.lastRequestedFrame();
    clock.stop();

    expect(fake.pendingFrameCount()).toBe(0);
    late?.();
    expect(frames()).toBe(0);
    expect(fake.pendingFrameCount()).toBe(0);
  });

  it('requests no further frame when onFrame stops the clock', () => {
    const fake = makeFakeClockSources();
    const clock: GameClock = createGameClock({
      onFrame: () => {
        clock.stop();
      },
      sources: fake.sources,
    });
    clock.start(0, 1);

    fake.runFrame();

    expect(fake.pendingFrameCount()).toBe(0);
  });

  it('keeps requesting frames when onFrame throws', () => {
    const fake = makeFakeClockSources();
    const clock = createGameClock({
      onFrame: () => {
        throw new Error('frame failed');
      },
      sources: fake.sources,
    });
    clock.start(0, 1);

    expect(() => {
      fake.runFrame();
    }).toThrow('frame failed');

    expect(fake.pendingFrameCount()).toBe(1);
  });
});
