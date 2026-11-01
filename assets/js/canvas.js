export function paintCanvas(canvas, surface, pixelSize) {
  canvas.width = surface.width;
  canvas.height = surface.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is not supported in this browser");
  const pixels = new Uint8ClampedArray(surface.data.buffer);
  context.putImageData(new ImageData(pixels, surface.width, surface.height), 0, 0);
  canvas.style.width = `${surface.width * pixelSize}px`;
  canvas.style.height = `${surface.height * pixelSize}px`;
}
