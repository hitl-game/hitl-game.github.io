const a4WidthPt = 595.28;
const a4HeightPt = 841.89;
const marginPt = 56;
const metaSizePt = 9;

export const documentLayout = {
  pageWidthPt: a4WidthPt,
  pageHeightPt: a4HeightPt,
  marginPt,
  contentRightPt: a4WidthPt - marginPt,
  contentWidthPt: a4WidthPt - 2 * marginPt,
  footerTopPt: a4HeightPt - marginPt - 2 * metaSizePt,
  docTitleSizePt: 16.5,
  bodySizePt: 10.5,
  metaSizePt,
  lineGapPt: 3,
  paragraphGapPt: 8,
  blockGapPt: 14,
  ruleWidthPt: 0.75,
  markSizePt: 18,
  tableCellPaddingPt: 4,
  inkColor: '#1A2433',
  inkMutedColor: '#5E6B7E',
  ruleColor: '#E3E8EE',
  markGradientColors: ['#7C3AED', '#C026D3', '#DB2777'],
} as const;
