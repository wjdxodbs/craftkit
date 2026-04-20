import {
  midpoint,
  drawSmoothStroke,
  renderAllStrokes,
  type Stroke,
} from "../lib/smoothStroke";

function createMockCtx() {
  const calls: string[] = [];
  const ctx = {
    clearRect: jest.fn(() => calls.push("clearRect")),
    beginPath: jest.fn(() => calls.push("beginPath")),
    moveTo: jest.fn(() => calls.push("moveTo")),
    lineTo: jest.fn(() => calls.push("lineTo")),
    quadraticCurveTo: jest.fn(() => calls.push("quadraticCurveTo")),
    stroke: jest.fn(() => calls.push("stroke")),
    arc: jest.fn(() => calls.push("arc")),
    fill: jest.fn(() => calls.push("fill")),
    lineCap: "",
    lineJoin: "",
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 0,
  };
  return { ctx, calls };
}

describe("midpoint", () => {
  it("두 점의 중점을 반환한다", () => {
    expect(midpoint({ x: 0, y: 0 }, { x: 10, y: 20 })).toEqual({ x: 5, y: 10 });
  });

  it("음수 좌표도 처리한다", () => {
    expect(midpoint({ x: -4, y: -8 }, { x: 4, y: 8 })).toEqual({ x: 0, y: 0 });
  });
});

describe("drawSmoothStroke", () => {
  it("점이 없으면 아무 동작도 하지 않는다", () => {
    const { ctx, calls } = createMockCtx();
    drawSmoothStroke(ctx as unknown as CanvasRenderingContext2D, {
      points: [],
      thickness: 3,
      color: "#111",
    });
    expect(calls).toEqual([]);
  });

  it("1점 스트로크는 arc + fill로 점을 그린다", () => {
    const { ctx, calls } = createMockCtx();
    drawSmoothStroke(ctx as unknown as CanvasRenderingContext2D, {
      points: [{ x: 10, y: 10 }],
      thickness: 4,
      color: "#111",
    });
    expect(calls).toContain("arc");
    expect(calls).toContain("fill");
    expect(calls).not.toContain("stroke");
  });

  it("3점 이상이면 quadraticCurveTo로 곡선을 그린다", () => {
    const { ctx, calls } = createMockCtx();
    drawSmoothStroke(ctx as unknown as CanvasRenderingContext2D, {
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 0 },
        { x: 30, y: 10 },
      ],
      thickness: 3,
      color: "#111",
    });
    expect(calls[0]).toBe("beginPath");
    expect(calls).toContain("moveTo");
    expect(
      calls.filter((c) => c === "quadraticCurveTo").length,
    ).toBeGreaterThan(0);
    expect(calls).toContain("lineTo");
    expect(calls[calls.length - 1]).toBe("stroke");
  });

  it("strokeStyle과 lineWidth를 스트로크 속성대로 설정한다", () => {
    const { ctx } = createMockCtx();
    drawSmoothStroke(ctx as unknown as CanvasRenderingContext2D, {
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ],
      thickness: 7,
      color: "#ff0000",
    });
    expect(ctx.strokeStyle).toBe("#ff0000");
    expect(ctx.lineWidth).toBe(7);
    expect(ctx.lineCap).toBe("round");
    expect(ctx.lineJoin).toBe("round");
  });
});

describe("renderAllStrokes", () => {
  it("clearRect를 1회 호출한 뒤 스트로크들을 렌더한다", () => {
    const { ctx, calls } = createMockCtx();
    const strokes: Stroke[] = [
      { points: [{ x: 1, y: 1 }], thickness: 2, color: "#111" },
      { points: [{ x: 2, y: 2 }], thickness: 3, color: "#111" },
    ];
    renderAllStrokes(
      ctx as unknown as CanvasRenderingContext2D,
      strokes,
      800,
      400,
    );
    expect(calls[0]).toBe("clearRect");
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 400);
    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
    expect(ctx.arc).toHaveBeenCalledTimes(2);
  });

  it("빈 스트로크 배열이면 clearRect만 호출한다", () => {
    const { ctx } = createMockCtx();
    renderAllStrokes(ctx as unknown as CanvasRenderingContext2D, [], 800, 400);
    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });
});
