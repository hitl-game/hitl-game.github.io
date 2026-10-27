import type { PDFDocument } from 'pdfkit';

import { documentLayout } from '../layout';

export const drawMetisMark = (doc: PDFDocument): void => {
  const radiusPt = documentLayout.markSizePt / 2;
  const centerXPt = documentLayout.contentRightPt - radiusPt;
  const centerYPt = documentLayout.marginPt + radiusPt;
  const gradient = doc.linearGradient(
    centerXPt - radiusPt,
    centerYPt - radiusPt,
    centerXPt + radiusPt,
    centerYPt + radiusPt,
  );
  const stopCount = documentLayout.markGradientColors.length - 1;
  documentLayout.markGradientColors.forEach((color, index) => {
    gradient.stop(index / stopCount, color);
  });
  doc.markContent('Artifact');
  doc.circle(centerXPt, centerYPt, radiusPt).fillColor(gradient).fill();
  doc.endMarkedContent();
  doc.fillColor(documentLayout.inkColor);
};
