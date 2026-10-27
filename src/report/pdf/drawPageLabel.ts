import type { PDFDocument } from 'pdfkit';

import { documentLayout } from '../layout';
import { pdfFontName } from './pdfFonts';

export const drawPageLabel = (doc: PDFDocument, pageLabel: string): void => {
  doc.markContent('Artifact', { type: 'Pagination' });
  doc
    .font(pdfFontName.regular)
    .fontSize(documentLayout.metaSizePt)
    .fillColor(documentLayout.inkMutedColor);
  doc.x = documentLayout.marginPt;
  doc.y = documentLayout.footerTopPt;
  doc.text(pageLabel, { width: documentLayout.contentWidthPt, align: 'right' });
  doc.endMarkedContent();
  doc.fillColor(documentLayout.inkColor);
};
