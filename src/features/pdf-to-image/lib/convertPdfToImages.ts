import { canvasToBlob } from "@/shared/lib/canvas";
import type { OutputFormat } from "@/shared/config/image-formats";

type PdfDocument = Awaited<ReturnType<PdfjsLib["getDocument"]>["promise"]>;
type PdfjsLib = typeof import("pdfjs-dist");

async function getPdfjsLib(): Promise<PdfjsLib> {
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

/**
 * 지정 페이지를 주어진 scale로 렌더링한 canvas를 반환한다.
 * 호출 측은 사용 후 canvas.width/height = 0으로 해제하지 않아도 된다
 * (짧게 쓰고 버릴 것으로 가정).
 */
async function renderPdfPageToCanvas(
  pdf: PdfDocument,
  pageNumber: number,
  scale: number,
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas context 초기화 실패");

  await page.render({ canvas, viewport }).promise;
  return canvas;
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
    const canvas = await renderPdfPageToCanvas(pdf, pageNumber, scale);
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
      const canvas = await renderPdfPageToCanvas(pdf, pageNumber, scale);
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
    const canvas = await renderPdfPageToCanvas(pdf, pageNumber, scale);
    return await canvasToBlob(canvas, outputFormat, quality);
  } finally {
    await pdf.destroy();
  }
}
