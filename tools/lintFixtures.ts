import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ESLint } from 'eslint';
import stylelint from 'stylelint';

// A list asserts which rules fire; a record also asserts how many times each fires.
type Expectation = readonly string[] | Readonly<Record<string, number>>;
type RuleIdsByFixture = ReadonlyMap<string, readonly string[]>;

const fixturesDir = path.join(import.meta.dirname, '..', 'tests', 'lint-fixtures');
const eslintErrorSeverity = 2;

const toFixturePath = (filePath: string): string =>
  path.relative(fixturesDir, filePath).split(path.sep).join('/');

const describeRuleSet = (ruleIds: readonly string[]): string =>
  [...new Set(ruleIds)].sort().join(', ') || 'no errors';

function describeRuleCounts(ruleIds: readonly string[]): string {
  const counts = new Map<string, number>();
  for (const ruleId of ruleIds) counts.set(ruleId, (counts.get(ruleId) ?? 0) + 1);
  return describeCountRecord(Object.fromEntries(counts));
}

const describeCountRecord = (counts: Readonly<Record<string, number>>): string =>
  Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ruleId, count]) => `${ruleId} x${String(count)}`)
    .join(', ') || 'no errors';

// Array.isArray does not narrow readonly arrays.
const isRuleSet = (expectation: Expectation): expectation is readonly string[] =>
  Array.isArray(expectation);

function compareFixture(expectation: Expectation, actualRuleIds: readonly string[]): string[] {
  const [want, got] = isRuleSet(expectation)
    ? [describeRuleSet(expectation), describeRuleSet(actualRuleIds)]
    : [describeCountRecord(expectation), describeRuleCounts(actualRuleIds)];
  return want === got ? [] : [`expected [${want}], got [${got}]`];
}

async function lintScriptFixtures(): Promise<RuleIdsByFixture> {
  // ignore: false, because the normal lint run ignores the fixture tree on purpose.
  const eslint = new ESLint({ ignore: false });
  const results = await eslint.lintFiles([path.join(fixturesDir, 'src')]);
  return new Map(
    results.map((result) => [
      toFixturePath(result.filePath),
      result.messages
        .filter((message) => message.severity === eslintErrorSeverity)
        .map((message) => message.ruleId ?? (message.fatal ? 'parse-error' : 'eslint-directive')),
    ]),
  );
}

async function lintStyleFixtures(): Promise<RuleIdsByFixture> {
  const { results } = await stylelint.lint({
    files: path.join(fixturesDir, 'css', '**', '*.css'),
    cwd: path.join(import.meta.dirname, '..'),
  });
  return new Map(
    results.map((result) => [
      toFixturePath(result.source ?? ''),
      result.warnings
        .filter((warning) => warning.severity === 'error')
        .map((warning) => warning.rule),
    ]),
  );
}

async function readExpected(): Promise<ReadonlyMap<string, Expectation>> {
  const manifest = JSON.parse(
    await readFile(path.join(fixturesDir, 'expected.json'), 'utf8'),
  ) as Record<string, Expectation>;
  return new Map(Object.entries(manifest));
}

function findMismatches(
  expected: ReadonlyMap<string, Expectation>,
  actual: RuleIdsByFixture,
): string[] {
  const fixtures = [...new Set([...expected.keys(), ...actual.keys()])].sort();
  return fixtures.flatMap((fixture) => {
    const expectation = expected.get(fixture);
    const actualRuleIds = actual.get(fixture);
    if (expectation === undefined) return [`${fixture}: not listed in expected.json`];
    if (actualRuleIds === undefined) return [`${fixture}: listed in expected.json but not found`];
    return compareFixture(expectation, actualRuleIds).map((problem) => `${fixture}: ${problem}`);
  });
}

const [expected, scriptResults, styleResults] = await Promise.all([
  readExpected(),
  lintScriptFixtures(),
  lintStyleFixtures(),
]);
const mismatches = findMismatches(expected, new Map([...scriptResults, ...styleResults]));

if (mismatches.length > 0) {
  process.stderr.write(`Lint fixtures failed:\n${mismatches.map((m) => `  ${m}`).join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Lint fixtures: all ${String(expected.size)} fixtures report as expected.\n`,
  );
}
