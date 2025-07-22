declare module "html2pdf.js" {
  // Options for html2pdf.js
  export interface Html2PdfOptions {
    margin?: number | [number, number, number, number]; // Margins (in cm or px)
    filename?: string; // File name for the PDF
    image?: {
      type?: "jpeg" | "png"; // Image format
      quality?: number; // Image quality (0.0 to 1.0)
    };
    html2canvas?: {
      scale?: number; // Canvas scaling factor
      logging?: boolean; // Enable console logging
      dpi?: number; // DPI for canvas
      letterRendering?: boolean; // Use letter rendering
      useCORS?: boolean;
    };
    jsPDF?: {
      unit?: "pt" | "mm" | "cm" | "in";
      format?: string | number[]; // Paper format or custom dimensions
      orientation?: "portrait" | "landscape";
    };
    pagebreak?: {
      mode?: string | string[]; // Pagebreak mode (e.g., "avoid-all")
    };
  }

  export interface Html2Pdf {
    set(opt: Html2PdfOptions): Html2Pdf;
    from(element: HTMLElement | string): Html2Pdf;
    toPdf(): Promise<void>;
    save(filename?: string): Promise<void>;
    output(type: string, options?: any): string | ArrayBuffer;
  }

  const html2pdf: {
    (): Html2Pdf;
    default: {
      (): Html2Pdf;
    };
  };

  export default html2pdf;
}
