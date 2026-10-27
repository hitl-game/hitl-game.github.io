import interBoldUrl from '../../../assets/fonts/inter-700.woff?url';
import interRegularUrl from '../../../assets/fonts/inter-400.woff?url';

export interface PdfFonts {
  readonly regular: Uint8Array;
  readonly bold: Uint8Array;
}

export const pdfFontName = { regular: 'inter-400', bold: 'inter-700' } as const;

const fetchFontBytes = async (url: string): Promise<Uint8Array> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Font request failed with status ${String(response.status)}: ${url}`);
  }
  return new Uint8Array(await response.arrayBuffer());
};

export const loadPdfFonts = async (): Promise<PdfFonts> => {
  const [regular, bold] = await Promise.all([
    fetchFontBytes(interRegularUrl),
    fetchFontBytes(interBoldUrl),
  ]);
  return { regular, bold };
};
