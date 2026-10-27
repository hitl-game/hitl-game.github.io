import { configureGlobal } from 'fast-check';

const defaultNumRuns = 100;

configureGlobal({ numRuns: Number(process.env['FC_NUM_RUNS'] ?? defaultNumRuns) });
