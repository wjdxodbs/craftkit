import { canvasToPngBlob } from "../lib/canvasToPngBlob";

HTMLCanvasElement.prototype.toBlob = jest.fn(function (
  callback: BlobCallback,
  type?: string,
) {
  callback(new Blob(["test"], { type: type ?? "image/png" }));
});

describe("canvasToPngBlob", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("image/png 타입의 Blob을 반환한다", async () => {
    const canvas = document.createElement("canvas");
    const blob = await canvasToPngBlob(canvas);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("image/png");
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      "image/png",
    );
  });

  it("toBlob이 null을 반환하면 reject한다", async () => {
    (HTMLCanvasElement.prototype.toBlob as jest.Mock).mockImplementationOnce(
      (callback: BlobCallback) => callback(null),
    );
    const canvas = document.createElement("canvas");
    await expect(canvasToPngBlob(canvas)).rejects.toThrow("canvas.toBlob 실패");
  });
});
