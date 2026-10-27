import { unzlibSync } from 'fflate';
import { beforeAll, describe, expect, it } from 'vitest';

import interBoldDataUrl from '../../../assets/fonts/inter-700.woff?inline';
import interRegularDataUrl from '../../../assets/fonts/inter-400.woff?inline';

import { buildSamplePdf } from './buildSamplePdf';

// fontkit writes the 'true' sfnt tag; other tools write 0x00010000.
const trueTypeVersions = new Set([0x00010000, 0x74727565]);
const tableRecordStartByte = 12;
const tableRecordBytes = 16;
const minimumGlyfBytesPerGlyph = 60;

interface TableRecord {
  readonly offsetByte: number;
  readonly bytes: number;
}

const decodeDataUrl = (dataUrl: string): Uint8Array =>
  Uint8Array.from(atob(dataUrl.slice(dataUrl.indexOf(',') + 1)), (char) => char.charCodeAt(0));

const viewOf = (bytes: Uint8Array): DataView =>
  new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

const readStreams = (pdf: Uint8Array): Uint8Array[] => {
  const text = new TextDecoder('latin1').decode(pdf);
  return [...text.matchAll(/stream\n([\s\S]*?)\nendstream/g)].map((match) =>
    pdf.subarray(
      match.index + 'stream\n'.length,
      match.index + match[0].length - '\nendstream'.length,
    ),
  );
};

const inflateOrKeep = (stream: Uint8Array): Uint8Array => {
  try {
    return unzlibSync(stream);
  } catch {
    return stream;
  }
};

const isTrueTypeFont = (stream: Uint8Array): boolean =>
  stream.byteLength > 4 && trueTypeVersions.has(viewOf(stream).getUint32(0));

const readTableRecords = (font: Uint8Array): Map<string, TableRecord> => {
  const view = viewOf(font);
  return new Map(
    Array.from({ length: view.getUint16(4) }, (_, index) => {
      const recordByte = tableRecordStartByte + index * tableRecordBytes;
      const tag = new TextDecoder('latin1').decode(font.subarray(recordByte, recordByte + 4));
      const record = {
        offsetByte: view.getUint32(recordByte + 8),
        bytes: view.getUint32(recordByte + 12),
      };
      return [tag, record];
    }),
  );
};

const readGlyfBytesPerGlyph = (font: Uint8Array): number => {
  const tables = readTableRecords(font);
  const glyfBytes = tables.get('glyf')?.bytes ?? 0;
  const glyphCount = viewOf(font).getUint16((tables.get('maxp')?.offsetByte ?? 0) + 4);
  return glyfBytes / glyphCount;
};

describe('buildSamplePdf', () => {
  let pdfBytes = new Uint8Array();
  let pdf = '';

  beforeAll(async () => {
    pdfBytes = await buildSamplePdf({
      regular: decodeDataUrl(interRegularDataUrl),
      bold: decodeDataUrl(interBoldDataUrl),
    });
    pdf = new TextDecoder('latin1').decode(pdfBytes);
  });

  it('writes a PDF 1.7 marked as tagged and as PDF/UA, with a language and a displayed title', () => {
    expect(pdf.startsWith('%PDF-1.7')).toBe(true);
    expect(pdf).toContain('/MarkInfo');
    expect(pdf).toContain('/Marked true');
    expect(pdf).toContain('/StructTreeRoot');
    expect(pdf).toContain('/Lang (en-US)');
    expect(pdf).toContain('/DisplayDocTitle true');
    expect(pdf).toContain('<pdfuaid:part>1</pdfuaid:part>');
  });

  it('tags the heading, paragraphs, list and table in the structure tree', () => {
    for (const tag of [
      'Document',
      'H1',
      'P',
      'L',
      'LI',
      'Lbl',
      'LBody',
      'Table',
      'TR',
      'TH',
      'TD',
    ]) {
      expect(pdf).toContain(`/S /${tag}\n`);
    }
  });

  it('embeds only subsetted Inter and never a standard PDF font', () => {
    expect(pdf).toMatch(/\/BaseFont \/[A-Z]{6}\+Inter-Regular/);
    expect(pdf).toMatch(/\/BaseFont \/[A-Z]{6}\+Inter-Bold/);
    expect(pdf).not.toMatch(/\/BaseFont \/(Helvetica|Times|Courier)/);
  });

  // veraPDF accepts subsets whose glyphs are empty (fontkit's WOFF2 path), so outlines are checked here.
  it('embeds font subsets that keep their glyph outlines', () => {
    const fonts = readStreams(pdfBytes).map(inflateOrKeep).filter(isTrueTypeFont);

    expect(fonts).toHaveLength(2);
    for (const font of fonts) {
      expect(readGlyfBytesPerGlyph(font)).toBeGreaterThan(minimumGlyfBytesPerGlyph);
    }
  });
});
