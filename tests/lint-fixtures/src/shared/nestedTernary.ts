export const describeSign = (value: number): string =>
  value > 0 ? 'positive' : value < 0 ? 'negative' : 'zero';
