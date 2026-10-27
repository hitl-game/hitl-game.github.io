import type { PDFDocument, PDFStructureElement, TableCell } from 'pdfkit';

import { documentLayout } from '../layout';
import { withWordSeparator } from './addStructureBlocks';
import { drawRule } from './drawArtifacts';
import { pdfFontName } from './pdfFonts';
import type { SamplePostMortem } from './samplePostMortem';

const toHeaderCell = (text: string): TableCell => ({
  text: withWordSeparator(text),
  type: 'TH',
  scope: 'column',
  font: { src: pdfFontName.bold },
});

const toDataCell = (text: string): TableCell => ({ text: withWordSeparator(text), type: 'TD' });

export const addReceiptTable = (
  doc: PDFDocument,
  root: PDFStructureElement,
  receipt: Pick<SamplePostMortem, 'receiptHeader' | 'receiptRows'>,
): void => {
  doc.font(pdfFontName.regular).fontSize(documentLayout.bodySizePt);
  drawRule(doc, doc.y);
  doc.table({
    structParent: root,
    data: [
      receipt.receiptHeader.map(toHeaderCell),
      ...receipt.receiptRows.map((row) => row.map(toDataCell)),
    ],
    defaultStyle: {
      border: 0,
      padding: documentLayout.tableCellPaddingPt,
      textColor: documentLayout.inkColor,
    },
  });
  drawRule(doc, doc.y);
  doc.y += documentLayout.blockGapPt;
};
