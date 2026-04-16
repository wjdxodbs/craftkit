export const labelCls = "text-[11px] font-medium text-[#888]";

export const segBtn = (active: boolean): string =>
  `cursor-pointer rounded-[10px] px-3 py-1.5 text-xs font-medium transition-colors ${
    active
      ? "border border-[#a78bfa40] bg-[#a78bfa10] text-[#a78bfa]"
      : "border border-[#ffffff15] text-[#999] hover:border-[#ffffff25] hover:text-[#bbb]"
  }`;
