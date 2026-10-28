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
  const intervalCount = documentLayout.markGradientColors.length - 1;
  documentLayout.markGradientColors.forEach((color, index) => {
    gradient.stop(index / intervalCount, color);
  });
  doc.markContent('Artifact');
  // The fill colour is set before the path: ISO 32000-1 allows only path operators inside a path object.
  doc.fillColor(gradient).circle(centerXPt, centerYPt, radiusPt).fill();
  doc.endMarkedContent();
  doc.fillColor(documentLayout.inkColor);
};
