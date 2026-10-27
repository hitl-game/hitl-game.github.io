import type { PDFDocument, PDFStructureElement } from 'pdfkit';

import { documentLayout } from '../layout';
import { pdfFontName } from './pdfFonts';
import { withWordSeparator } from './withWordSeparator';

export const addRunId = (doc: PDFDocument, root: PDFStructureElement, runIdLine: string): void => {
  doc.font(pdfFontName.regular).fontSize(documentLayout.metaSizePt);
  doc.x = documentLayout.marginPt;
  doc.y = documentLayout.footerTopPt;
  root.add(
    doc.struct('P', () => {
      doc.text(withWordSeparator(runIdLine));
    }),
  );
};
