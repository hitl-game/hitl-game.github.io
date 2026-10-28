import type { PDFDocument, PDFStructureElement } from 'pdfkit';

import { documentLayout } from '../layout';
import { pdfFontName } from './pdfFonts';
import { withWordSeparator } from './withWordSeparator';

export const addList = (
  doc: PDFDocument,
  root: PDFStructureElement,
  items: readonly string[],
): void => {
  const list = doc.struct('L');
  root.add(list);
  doc.font(pdfFontName.regular).fontSize(documentLayout.bodySizePt);
  doc.list(items.map(withWordSeparator), {
    structParent: list,
    lineGap: documentLayout.lineGapPt,
    paragraphGap: documentLayout.paragraphGapPt / 2,
  });
  list.end();
  doc.y += documentLayout.blockGapPt;
};
