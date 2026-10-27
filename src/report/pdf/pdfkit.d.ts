// PDFKit 0.20 ships no type declarations; this covers only the API the report renderer uses.
declare module 'pdfkit' {
  type StructureChild = PDFStructureElement | (() => void);

  export interface PDFStructureElement {
    add(child: StructureChild): PDFStructureElement;
    end(): void;
  }

  interface TextOptions {
    width?: number;
    lineGap?: number;
    paragraphGap?: number;
    align?: 'right';
    structParent?: PDFStructureElement;
  }

  export interface TableCell {
    text: string;
    type?: 'TH' | 'TD';
    scope?: 'column';
    font?: { src: string };
  }

  interface TableOptions {
    data: readonly (readonly TableCell[])[];
    structParent: PDFStructureElement;
    defaultStyle?: { border?: number; padding?: number; textColor?: string };
  }

  interface ArtifactOptions {
    type?: 'Pagination' | 'Layout';
  }

  interface DocumentOptions {
    size: readonly [widthPt: number, heightPt: number];
    margins: { top: number; bottom: number; left: number; right: number };
    font: null;
    tagged: true;
    subset: 'PDF/UA';
    pdfVersion: '1.7';
    lang: string;
    displayTitle: true;
    info: { Title: string };
  }

  interface LinearGradient {
    stop(position: number, color: string): LinearGradient;
  }

  export class PDFDocument {
    constructor(options: DocumentOptions);
    x: number;
    y: number;
    registerFont(name: string, source: Uint8Array): this;
    font(name: string): this;
    fontSize(sizePt: number): this;
    fillColor(color: string | LinearGradient): this;
    strokeColor(color: string): this;
    lineWidth(widthPt: number): this;
    moveTo(xPt: number, yPt: number): this;
    lineTo(xPt: number, yPt: number): this;
    circle(centerXPt: number, centerYPt: number, radiusPt: number): this;
    stroke(): this;
    fill(): this;
    linearGradient(x1Pt: number, y1Pt: number, x2Pt: number, y2Pt: number): LinearGradient;
    text(text: string, options?: TextOptions): this;
    list(items: readonly string[], options?: TextOptions): this;
    // The renderer never uses the returned PDFTable; its data is drawn in the constructor.
    table(options: TableOptions): object;
    struct(type: string, children?: StructureChild): PDFStructureElement;
    addStructure(element: PDFStructureElement): this;
    markContent(tag: 'Artifact', options?: ArtifactOptions): this;
    endMarkedContent(): this;
    on(event: 'data', listener: (chunk: Uint8Array) => void): this;
    on(event: 'end', listener: () => void): this;
    end(): void;
  }
}
