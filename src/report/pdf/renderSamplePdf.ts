import { buildSamplePdf } from './buildSamplePdf';
import { loadPdfFonts } from './pdfFonts';

export const renderSamplePdf = async (): Promise<Uint8Array<ArrayBuffer>> =>
  buildSamplePdf(await loadPdfFonts());
