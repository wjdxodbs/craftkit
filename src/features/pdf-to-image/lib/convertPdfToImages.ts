import type { OutputFormat } from "@/shared/config/image-formats";

async function getPdfjsLib() {
  const lib = await import("pdfjs-dist");
  try {
    if (!lib.GlobalWorkerOptions.workerSrc) {
      lib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
    }
  } catch {
    // 브라우저 외 환경(테스트 등)에서 import.meta.url 불가 시 무시
  }
  return lib;
}

export async function getPdfPageCount(data: ArrayBuffer): Promise<number> {
  const pdfjsLib = await getPdfjsLib();
  const pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise;
  const count = pdf.numPages;
  await pdf.destroy();
  return count;
}

export async function renderPdfPageToDataUrl(
  data: ArrayBuffer,
  pageNumber: number,
  scale: number,
): Promise<string> {
  const pdfjsLib = await getPdfjsLib();
  const pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise;
  try {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas context 초기화 실패");

    await page.render({ canvas, viewport }).promise;

    const result = canvas.toDataURL();
    canvas.width = 0;
    canvas.height = 0;
    return result;
  } finally {
    await pdf.destroy();
  }
}

export async function renderAllThumbnails(
  data: ArrayBuffer,
  scale: number,
  onCountKnown: (count: number) => void,
  onPageReady: (pageNumber: number, dataUrl: string) => void,
): Promise<void> {
  const pdfjsLib = await getPdfjsLib();
  const pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise;
  try {
    const count = pdf.numPages;
    onCountKnown(count);

    const CONCURRENCY = 5;

    const renderPage = async (pageNumber: number): Promise<void> => {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas context 초기화 실패");

      await page.render({ canvas, viewport }).promise;
      onPageReady(pageNumber, canvas.toDataURL());
      canvas.width = 0;
      canvas.height = 0;
    };

    for (let i = 0; i < count; i += CONCURRENCY) {
      const batch = Array.from(
        { length: Math.min(CONCURRENCY, count - i) },
        (_, j) => i + j + 1,
      );
      await Promise.all(batch.map(renderPage));
    }
  } finally {
    await pdf.destroy();
  }
}

export async function convertPdfPageToBlob(
  data: ArrayBuffer,
  pageNumber: number,
  outputFormat: OutputFormat,
  quality: number,
  scale = 2,
): Promise<Blob> {
  const pdfjsLib = await getPdfjsLib();
  const pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise;
  try {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas context 초기화 실패");

    await page.render({ canvas, viewport }).promise;

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("canvas.toBlob 실패"));
          resolve(blob);
        },
        outputFormat,
        quality,
      );
    });
  } finally {
    await pdf.destroy();
  }
}
