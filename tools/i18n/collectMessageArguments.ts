import { IntlMessageFormat } from 'intl-messageformat';

// intl-messageformat does not re-export the parser's TYPE enum, so its stable numeric codes
// are named here; collectMessageArguments.test.ts proves each one against the real parser.
const elementType = {
  literal: 0,
  argument: 1,
  number: 2,
  date: 3,
  time: 4,
  select: 5,
  plural: 6,
  pound: 7,
  tag: 8,
} as const;

interface AstNode {
  readonly type: number;
  readonly value?: string;
  readonly options?: Readonly<Record<string, { readonly value: readonly AstNode[] }>>;
}

// Simple `{name}` arguments take text only, so a number never reaches the screen unformatted.
const tsTypeByElementType: Readonly<Partial<Record<number, string>>> = {
  [elementType.argument]: 'string',
  [elementType.number]: 'number',
  [elementType.plural]: 'number',
  [elementType.date]: 'Date | number',
  [elementType.time]: 'Date | number',
};

export type MessageArguments =
  | { readonly ok: true; readonly argumentTypes: ReadonlyMap<string, string> }
  | { readonly ok: false; readonly problems: readonly string[] };

const toTsType = (node: AstNode): string | undefined =>
  node.type === elementType.select
    ? Object.keys(node.options ?? {})
        .map((option) => JSON.stringify(option))
        .join(' | ')
    : tsTypeByElementType[node.type];

function recordArgument(node: AstNode, argumentTypes: Map<string, string>, problems: string[]) {
  const tsType = toTsType(node);
  if (tsType === undefined || node.value === undefined) return;
  const known = argumentTypes.get(node.value);
  if (known === undefined) argumentTypes.set(node.value, tsType);
  else if (known !== tsType) {
    problems.push(`argument "${node.value}" is used as both ${known} and ${tsType}`);
  }
}

function walk(nodes: readonly AstNode[], argumentTypes: Map<string, string>, problems: string[]) {
  for (const node of nodes) {
    if (node.type === elementType.tag) {
      problems.push('markup tags are not allowed in UI strings');
      continue;
    }
    recordArgument(node, argumentTypes, problems);
    for (const option of Object.values(node.options ?? {})) {
      walk(option.value, argumentTypes, problems);
    }
  }
}

const parseMessage = (message: string): readonly AstNode[] | string => {
  try {
    return new IntlMessageFormat(message, 'en').getAst();
  } catch (error) {
    return `ICU syntax error ${error instanceof Error ? error.message : String(error)}`;
  }
};

export function collectMessageArguments(message: string): MessageArguments {
  const ast = parseMessage(message);
  if (typeof ast === 'string') return { ok: false, problems: [ast] };
  const argumentTypes = new Map<string, string>();
  const problems: string[] = [];
  walk(ast, argumentTypes, problems);
  return problems.length === 0 ? { ok: true, argumentTypes } : { ok: false, problems };
}
