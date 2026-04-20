import { trimToContent } from "../lib/trimToContent";

function makeCanvas(
  w: number,
  h: number,
  opaquePixels: Array<{ x: number; y: number }>,
): HTMLCanvasElement {
  const data = new Uint8ClampedArray(w * h * 4);
  for (const { x, y } of opaquePixels) {
    const idx = (y * w + x) * 4;
    data[idx] = 0;
    data[idx + 1] = 0;
    data[idx + 2] = 0;
    data[idx + 3] = 255;
  }

  const drawImage = jest.fn();

  const sourceCtx = {
    getImageData: jest.fn(() => ({ data, width: w, height: h })),
  };
  const outCtx = { drawImage };

  let getCtxCallCount = 0;
  const canvas = {
    width: w,
    height: h,
    getContext: jest.fn(() => {
      getCtxCallCount++;
      return getCtxCallCount === 1 ? sourceCtx : outCtx;
    }),
  } as unknown as HTMLCanvasElement;

  const realCreate = document.createElement.bind(document);
  jest
    .spyOn(document, "createElement")
    .mockImplementationOnce((tag: string) => {
      if (tag !== "canvas") return realCreate(tag);
      const out = {
        width: 0,
        height: 0,
        getContext: () => outCtx,
      } as unknown as HTMLCanvasElement;
      return out;
    });

  (canvas as HTMLCanvasElement & { _drawImage?: jest.Mock })._drawImage =
    drawImage;
  return canvas;
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("trimToContent", () => {
  it("모두 투명하면 null을 반환한다", () => {
    const canvas = makeCanvas(10, 10, []);
    expect(trimToContent(canvas, 8)).toBeNull();
  });

  it("크기가 0인 캔버스는 null을 반환한다", () => {
    const canvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(),
    } as unknown as HTMLCanvasElement;
    expect(trimToContent(canvas, 8)).toBeNull();
  });

  it("한 픽셀만 opaque면 (1 + padding*2) × (1 + padding*2) 캔버스를 반환한다", () => {
    const canvas = makeCanvas(10, 10, [{ x: 4, y: 4 }]);
    const result = trimToContent(canvas, 2);
    expect(result).not.toBeNull();
    expect(result!.width).toBe(5);
    expect(result!.height).toBe(5);
  });

  it("padding=0이면 content 크기 그대로 반환한다", () => {
    const canvas = makeCanvas(10, 10, [
      { x: 2, y: 2 },
      { x: 4, y: 4 },
    ]);
    const result = trimToContent(canvas, 0);
    expect(result).not.toBeNull();
    expect(result!.width).toBe(3);
    expect(result!.height).toBe(3);
  });

  it("음수 padding은 0으로 처리한다", () => {
    const canvas = makeCanvas(10, 10, [{ x: 5, y: 5 }]);
    const result = trimToContent(canvas, -5);
    expect(result).not.toBeNull();
    expect(result!.width).toBe(1);
    expect(result!.height).toBe(1);
  });

  it("엣지 픽셀 (0, 0)과 (w-1, h-1)이 opaque면 전체 영역 bbox", () => {
    const canvas = makeCanvas(10, 10, [
      { x: 0, y: 0 },
      { x: 9, y: 9 },
    ]);
    const result = trimToContent(canvas, 0);
    expect(result).not.toBeNull();
    expect(result!.width).toBe(10);
    expect(result!.height).toBe(10);
  });

  it("분리된 두 픽셀을 감싸는 bbox를 반환한다", () => {
    const canvas = makeCanvas(20, 20, [
      { x: 3, y: 5 },
      { x: 15, y: 12 },
    ]);
    const result = trimToContent(canvas, 0);
    expect(result).not.toBeNull();
    expect(result!.width).toBe(15 - 3 + 1);
    expect(result!.height).toBe(12 - 5 + 1);
  });
});
