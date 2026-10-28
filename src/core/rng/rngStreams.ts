import type { rngStreamNames } from '../constants';

export type RngStreamName = (typeof rngStreamNames)[number];

// The four xoroshiro128+ state words: plain data, so it can live in GameState.
export type RngStreamState = readonly number[];

export type RngStreams = Readonly<Record<RngStreamName, RngStreamState>>;
