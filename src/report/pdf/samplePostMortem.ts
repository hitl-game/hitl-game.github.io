export interface SamplePostMortem {
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly highlights: readonly string[];
  readonly receiptHeader: readonly [string, string];
  readonly receiptRows: readonly (readonly [string, string])[];
  readonly runIdLine: string;
  readonly pageLabel: string;
}

export const samplePostMortem: SamplePostMortem = {
  title: 'Sample post-mortem',
  paragraphs: [
    'This is a sample document. It checks that the browser build of the report renderer writes a tagged PDF that assistive technology can read.',
    'Every block on this page carries a structure tag, every word is followed by a space, and the decorative mark is an artifact.',
  ],
  highlights: [
    'A first sample highlight.',
    'A second sample highlight that is long enough to wrap onto a second line, so the list body spans more than one line.',
    'A third sample highlight.',
  ],
  receiptHeader: ['Item', 'Count'],
  receiptRows: [
    ['Sample row one', '12'],
    ['Sample row two', '7'],
    ['Sample row three', '0'],
  ],
  runIdLine: 'Run ID: SAMPLE-0',
  pageLabel: 'Page 1 of 1',
};
