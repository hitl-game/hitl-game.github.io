import type { PDFDocument, PDFStructureElement } from 'pdfkit';

import { documentLayout } from '../layout';
import { pdfFontName } from './pdfFonts';
import { withWordSeparator } from './withWordSeparator';

export const addHeading = (doc: PDFDocument, root: PDFStructureElement, title: string): void => {
  doc.font(pdfFontName.bold).fontSize(documentLayout.docTitleSizePt);
  root.add(
    doc.struct('H1', () => {
      doc.text(withWordSeparator(title), {
        width:
          documentLayout.contentWidthPt - documentLayout.markSizePt - documentLayout.blockGapPt,
      });
    }),
  );
  doc.y += documentLayout.blockGapPt;
};
