import { configureGlobal } from 'fast-check';
import { readNumRuns } from './readNumRuns.ts';

configureGlobal({ numRuns: readNumRuns(process.env['FC_NUM_RUNS']) });
