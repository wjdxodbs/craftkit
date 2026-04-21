export function loadImageFromFile(
  file: File,
  callbacks: {
    onLoad: (img: HTMLImageElement, dataUrl: string, file: File) => void;
    onError?: () => void;
  },
): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string;
    const img = new Image();
    img.onload = () => callbacks.onLoad(img, dataUrl, file);
    img.onerror = () => callbacks.onError?.();
    img.src = dataUrl;
  };
  reader.onerror = () => callbacks.onError?.();
  reader.readAsDataURL(file);
}
