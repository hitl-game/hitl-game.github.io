import { describe, expect, it } from 'vitest';

import { parseUiCatalog } from './parseUiCatalog.ts';

describe('parseUiCatalog', () => {
  it('accepts a flat object of ICU strings', () => {
    expect(parseUiCatalog('{ "time.day": "Day {day, number}" }')).toEqual({
      ok: true,
      catalog: { 'time.day': 'Day {day, number}' },
    });
  });

  it.each([
    ['not json', /^invalid JSON: /],
    ['["time.day"]', /^the catalog must be a flat JSON object$/],
    ['{ "time.day": { "short": "D" } }', /^time\.day: value must be a string$/],
    ['{ "time.day": 3 }', /^time\.day: value must be a string$/],
    ['{ "Time.day": "Day" }', /^Time\.day: key must look like area\.camelCase$/],
    ['{ "time day": "Day" }', /^time day: key must look like area\.camelCase$/],
    ['{ "day": "Day" }', /^day: key must look like area\.camelCase$/],
    ['{ "time.day": "Day {day" }', /^time\.day: ICU syntax error /],
  ])('rejects %s', (text, problem) => {
    const parsed = parseUiCatalog(text);
    expect(parsed.ok).toBe(false);
    expect(parsed.ok ? [] : parsed.problems).toEqual([expect.stringMatching(problem)]);
  });

  it('rejects a duplicate key instead of keeping the last one', () => {
    expect(
      parseUiCatalog('{ "time.day": "Day", "inbox.title": "time.day", "time.day": "D" }'),
    ).toEqual({ ok: false, problems: ['time.day: duplicate key'] });
  });

  it('does not mistake escaped quotes for keys', () => {
    expect(parseUiCatalog('{ "help.quote": "Say \\"hi\\"", "help.other": "hi" }').ok).toBe(true);
  });
});
