import path from 'node:path';

const excludedDirs = ['_bmad-output/', 'tests/lint-fixtures/'];

const isIncluded = (file) => {
  const relativePath = path.relative(process.cwd(), file).split(path.sep).join('/');
  return !excludedDirs.some((dir) => relativePath.startsWith(dir));
};

const runOnIncluded = (commands) => (files) => {
  const included = files.filter(isIncluded).map((file) => JSON.stringify(file));
  return included.length === 0 ? [] : commands.map((command) => `${command} ${included.join(' ')}`);
};

export default {
  '*.{ts,tsx,js}': runOnIncluded(['eslint --max-warnings=0 --no-warn-ignored', 'prettier --write']),
  '*.css': runOnIncluded(['stylelint', 'prettier --write']),
  '*.{json,md,yml,yaml}': runOnIncluded(['prettier --write']),
};
