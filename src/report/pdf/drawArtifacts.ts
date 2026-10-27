import type { PDFDocument } from 'pdfkit';

import { documentLayout } from '../layout';
import { pdfFontName } from './pdfFonts';

const contentRightPt = (doc: PDFDocument): number => doc.page.width - documentLayout.marginPt;

export const contentWidthPt = (doc: PDFDocument): number =>
  contentRightPt(doc) - documentLayout.marginPt;

export const footerTopPt = (doc: PDFDocument): number =>
  doc.page.height - documentLayout.marginPt - documentLayout.metaSizePt * 2;

export const drawMetisMark = (doc: PDFDocument): void => {
  const radiusPt = documentLayout.markSizePt / 2;
  const centerXPt = contentRightPt(doc) - radiusPt;
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

export const drawRule = (doc: PDFDocument, yPt: number): void => {
  doc.markContent('Artifact', { type: 'Layout' });
  doc
    .lineWidth(documentLayout.ruleWidthPt)
    .strokeColor(documentLayout.ruleColor)
    .moveTo(documentLayout.marginPt, yPt)
    .lineTo(contentRightPt(doc), yPt)
    .stroke();
  doc.endMarkedContent();
};

export const drawPageLabel = (doc: PDFDocument, pageLabel: string): void => {
  doc.markContent('Artifact', { type: 'Pagination' });
  doc
    .font(pdfFontName.regular)
    .fontSize(documentLayout.metaSizePt)
    .fillColor(documentLayout.inkMutedColor);
  doc.x = documentLayout.marginPt;
  doc.y = footerTopPt(doc);
  doc.text(pageLabel, { width: contentWidthPt(doc), align: 'right' });
  doc.endMarkedContent();
  doc.fillColor(documentLayout.inkColor);
};
