import type { PDFDocument } from 'pdfkit';

import { documentLayout } from '../layout';
import { addReceiptTable } from './addReceiptTable';
import { addHeading, addList, addParagraphs, addRunId } from './addStructureBlocks';
import { drawMetisMark, drawPageLabel } from './drawArtifacts';
import { pdfFontName, type PdfFonts } from './pdfFonts';
import { samplePostMortem } from './samplePostMortem';

// PDFKit never emits 'error': a rendering failure throws from the drawing call itself.
const collectPdfBytes = (doc: PDFDocument): Promise<Uint8Array<ArrayBuffer>> =>
  new Promise((resolve) => {
    const chunks: Uint8Array[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const bytes = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.byteLength, 0));
      chunks.reduce((offset, chunk) => {
        bytes.set(chunk, offset);
        return offset + chunk.byteLength;
      }, 0);
      resolve(bytes);
    });
  });

const createTaggedDocument = async (fonts: PdfFonts): Promise<PDFDocument> => {
  const { PDFDocument } = await import('pdfkit');
  const marginPt = documentLayout.marginPt;
  const doc = new PDFDocument({
    size: documentLayout.pageSize,
    margins: { top: marginPt, bottom: marginPt, left: marginPt, right: marginPt },
    font: fonts.regular,
    tagged: true,
    subset: 'PDF/UA',
    pdfVersion: '1.7',
    lang: 'en-US',
    displayTitle: true,
    info: { Title: samplePostMortem.title },
  });
  doc.registerFont(pdfFontName.regular, fonts.regular);
  doc.registerFont(pdfFontName.bold, fonts.bold);
  return doc.fillColor(documentLayout.inkColor);
};

export const buildSamplePdf = async (fonts: PdfFonts): Promise<Uint8Array<ArrayBuffer>> => {
  const doc = await createTaggedDocument(fonts);
  const bytes = collectPdfBytes(doc);
  const root = doc.struct('Document');
  doc.addStructure(root);
  drawMetisMark(doc);
  addHeading(doc, root, samplePostMortem.title);
  addParagraphs(doc, root, samplePostMortem.paragraphs);
  addList(doc, root, samplePostMortem.highlights);
  addReceiptTable(doc, root, samplePostMortem);
  addRunId(doc, root, samplePostMortem.runIdLine);
  drawPageLabel(doc, samplePostMortem.pageLabel);
  root.end();
  doc.end();
  return bytes;
};
