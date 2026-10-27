import type { PDFDocument, PDFStructureElement } from 'pdfkit';

import { documentLayout } from '../layout';
import { contentWidthPt, footerTopPt } from './drawArtifacts';
import { pdfFontName } from './pdfFonts';

// PDF/UA needs the space between words inside the marked content, including at the end of a block.
export const withWordSeparator = (text: string): string => `${text} `;

export const addHeading = (doc: PDFDocument, root: PDFStructureElement, title: string): void => {
  doc.font(pdfFontName.bold).fontSize(documentLayout.docTitleSizePt);
  root.add(
    doc.struct('H1', () => {
      doc.text(withWordSeparator(title), {
        width: contentWidthPt(doc) - documentLayout.markSizePt - documentLayout.blockGapPt,
      });
    }),
  );
  doc.y += documentLayout.blockGapPt;
};

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

export const addRunId = (doc: PDFDocument, root: PDFStructureElement, runIdLine: string): void => {
  doc.font(pdfFontName.regular).fontSize(documentLayout.metaSizePt);
  doc.x = documentLayout.marginPt;
  doc.y = footerTopPt(doc);
  root.add(
    doc.struct('P', () => {
      doc.text(withWordSeparator(runIdLine));
    }),
  );
};
