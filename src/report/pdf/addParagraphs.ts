import type { PDFDocument, PDFStructureElement } from 'pdfkit';

import { documentLayout } from '../layout';
import { pdfFontName } from './pdfFonts';
import { withWordSeparator } from './withWordSeparator';

export const addParagraphs = (
  doc: PDFDocument,
  root: PDFStructureElement,
  paragraphs: readonly string[],
): void => {
  doc.font(pdfFontName.regular).fontSize(documentLayout.bodySizePt);
  paragraphs.forEach((paragraph) => {
    doc.text(withWordSeparator(paragraph), {
      structParent: root,
      lineGap: documentLayout.lineGapPt,
      paragraphGap: documentLayout.paragraphGapPt,
    });
  });
  doc.y += documentLayout.blockGapPt;
};
