export async function compressImage(
    file: File,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      mimeType?: "image/jpeg" | "image/webp";
    }
  ): Promise<File> {
    const {
      maxWidth = 1200,
      maxHeight = 1600,
      quality = 0.82,
      mimeType = "image/jpeg",
    } = options || {};
  
    const dataUrl = await readFileAsDataURL(file);
    const img = await loadImage(dataUrl);
  
    const { width, height } = fitWithinBounds(
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
      maxWidth,
      maxHeight
    );
  
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
  
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not create canvas context.");
    }
  
    ctx.drawImage(img, 0, 0, width, height);
  
    const blob = await canvasToBlob(canvas, mimeType, quality);
  
    const extension = mimeType === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "");
  
    return new File([blob], `${baseName}.${extension}`, {
      type: mimeType,
      lastModified: Date.now(),
    });
  }
  
  function fitWithinBounds(
    width: number,
    height: number,
    maxWidth: number,
    maxHeight: number
  ) {
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio),
    };
  }
  
  function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });
  }
  
  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image."));
      img.src = src;
    });
  }
  
  function canvasToBlob(
    canvas: HTMLCanvasElement,
    mimeType: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to export image."));
            return;
          }
          resolve(blob);
        },
        mimeType,
        quality
      );
    });
  }