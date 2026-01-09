declare module 'html2pdf.js' {
  type Unit = 'pt' | 'mm' | 'cm' | 'in';
  type Orientation = 'portrait' | 'landscape';

  interface Html2CanvasOptions {
    scale?: number;
    useCORS?: boolean;
    backgroundColor?: string;
    letterRendering?: boolean;
    logging?: boolean;
  }

  interface JsPDFOptions {
    unit?: Unit;
    format?: string | [number, number];
    orientation?: Orientation;
    compress?: boolean;
  }

  interface PageBreakOptions {
    mode?: Array<'avoid-all' | 'css' | 'legacy'>;
  }

  interface Html2PdfOptions {
    filename?: string;
    html2canvas?: Html2CanvasOptions;
    jsPDF?: JsPDFOptions;
    pagebreak?: PageBreakOptions;
  }

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: HTMLElement): Html2PdfInstance;
    save(): Promise<void> | void;
  }

  interface Html2Pdf {
    (options?: Html2PdfOptions): Html2PdfInstance;
  }

  const html2pdf: Html2Pdf;
  export default html2pdf;
}
