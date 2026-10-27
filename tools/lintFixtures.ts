import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ESLint } from 'eslint';
import stylelint from 'stylelint';

type RuleIdsByFixture = ReadonlyMap<string, readonly string[]>;

const fixturesDir = path.join(import.meta.dirname, '..', 'tests', 'lint-fixtures');
const eslintErrorSeverity = 2;

const toFixturePath = (filePath: string): string =>
  path.relative(fixturesDir, filePath).split(path.sep).join('/');

const toSortedUnique = (ruleIds: readonly string[]): readonly string[] =>
  [...new Set(ruleIds)].sort();

async function lintScriptFixtures(): Promise<RuleIdsByFixture> {
  // ignore: false, because the normal lint run ignores the fixture tree on purpose.
  const eslint = new ESLint({ ignore: false });
  const results = await eslint.lintFiles([path.join(fixturesDir, 'src')]);
  return new Map(
    results.map((result) => [
      toFixturePath(result.filePath),
      toSortedUnique(
        result.messages
          .filter((message) => message.severity === eslintErrorSeverity)
          .map((message) => message.ruleId ?? (message.fatal ? 'parse-error' : 'eslint-directive')),
      ),
    ]),
  );
}

async function lintStyleFixtures(): Promise<RuleIdsByFixture> {
  const { results } = await stylelint.lint({
    files: path.join(fixturesDir, 'css', '*.css'),
    cwd: path.join(import.meta.dirname, '..'),
  });
  return new Map(
    results.map((result) => [
      toFixturePath(result.source ?? ''),
      toSortedUnique(
        result.warnings
          .filter((warning) => warning.severity === 'error')
          .map((warning) => warning.rule),
      ),
    ]),
  );
}

async function readExpected(): Promise<RuleIdsByFixture> {
  const manifest = JSON.parse(
    await readFile(path.join(fixturesDir, 'expected.json'), 'utf8'),
  ) as Record<string, string[]>;
  return new Map(
    Object.entries(manifest).map(([fixture, ruleIds]) => [fixture, toSortedUnique(ruleIds)]),
  );
}

function findMismatches(expected: RuleIdsByFixture, actual: RuleIdsByFixture): string[] {
  const fixtures = [...new Set([...expected.keys(), ...actual.keys()])].sort();
  return fixtures.flatMap((fixture) => {
    const expectedRuleIds = expected.get(fixture);
    const actualRuleIds = actual.get(fixture);
    if (expectedRuleIds === undefined) return [`${fixture}: not listed in expected.json`];
    if (actualRuleIds === undefined) return [`${fixture}: listed in expected.json but not found`];
    const want = expectedRuleIds.join(', ') || 'no errors';
    const got = actualRuleIds.join(', ') || 'no errors';
    return want === got ? [] : [`${fixture}: expected [${want}], got [${got}]`];
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
