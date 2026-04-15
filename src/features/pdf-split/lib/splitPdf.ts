import { PDFDocument } from "pdf-lib";

export async function splitPdf(
  data: ArrayBuffer,
  pageNumbers: number[],
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(data);
  const newDoc = await PDFDocument.create();
  const copied = await newDoc.copyPages(
    srcDoc,
    pageNumbers.map((n) => n - 1),
  );
  copied.forEach((page) => newDoc.addPage(page));
  return newDoc.save();
}
