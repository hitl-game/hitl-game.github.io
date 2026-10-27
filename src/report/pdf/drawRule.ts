import type { PDFDocument } from 'pdfkit';

import { documentLayout } from '../layout';

export const drawRule = (doc: PDFDocument, yPt: number): void => {
  doc.markContent('Artifact', { type: 'Layout' });
  doc
    .lineWidth(documentLayout.ruleWidthPt)
    .strokeColor(documentLayout.ruleColor)
    .moveTo(documentLayout.marginPt, yPt)
    .lineTo(documentLayout.contentRightPt, yPt)
    .stroke();
  doc.endMarkedContent();
};
