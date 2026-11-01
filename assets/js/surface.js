const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const GRADIENT_STEPS = 4;

export function createSurface(width, height, background = 0) {
  const data = new Uint32Array(width * height);
  if (background) data.fill(background);

  const pixel = (x, y, color) => {
    const column = Math.floor(x);
    const row = Math.floor(y);
    if (column < 0 || row < 0 || column >= width || row >= height) return;
    data[row * width + column] = color;
  };

  const rect = (x, y, w, h, color) => {
    const left = Math.max(0, Math.floor(x));
    const top = Math.max(0, Math.floor(y));
    const right = Math.min(width, Math.floor(x + w));
    const bottom = Math.min(height, Math.floor(y + h));
    for (let row = top; row < bottom; row++) {
      data.fill(color, row * width + left, row * width + right);
    }
  };

  const sprite = (rows, x, y, colors, scale = 1) => {
    const palette = typeof colors === "number" ? { "#": colors } : colors;
    rows.forEach((row, rowIndex) => {
      for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
        const color = palette[row[columnIndex]];
        if (color === undefined) continue;
        rect(x + columnIndex * scale, y + rowIndex * scale, scale, scale, color);
      }
    });
  };

  const circle = (centerX, centerY, radius, color) => {
    for (let offsetY = -radius; offsetY <= radius; offsetY++) {
      const halfWidth = Math.floor(Math.sqrt(radius * (radius + 1) - offsetY * offsetY));
      rect(centerX - halfWidth, centerY + offsetY, halfWidth * 2 + 1, 1, color);
    }
  };

  const gradient = (x, y, w, h, colors) => {
    if (colors.length === 1 || h <= 1) {
      rect(x, y, w, h, colors[0]);
      return;
    }
    for (let row = 0; row < h; row++) {
      const position = (row / (h - 1)) * (colors.length - 1);
      const index = Math.min(Math.floor(position), colors.length - 2);
      const blend = Math.floor((position - index) * (GRADIENT_STEPS + 1)) / GRADIENT_STEPS;
      const upper = colors[index];
      const lower = colors[index + 1];
      for (let column = 0; column < w; column++) {
        const threshold = (BAYER_4X4[(y + row) & 3][(x + column) & 3] + 0.5) / 16;
        pixel(x + column, y + row, blend > threshold ? lower : upper);
      }
    }
  };

  const dither = (x, y, w, h, color, level) => {
    for (let row = y; row < y + h; row++) {
      for (let column = x; column < x + w; column++) {
        if (BAYER_4X4[row & 3][column & 3] < level) pixel(column, row, color);
      }
    }
  };

  const blit = (source, x, y) => {
    const startColumn = Math.max(0, -x);
    const endColumn = Math.min(source.width, width - x);
    if (endColumn <= startColumn) return;
    for (let row = 0; row < source.height; row++) {
      const targetRow = y + row;
      if (targetRow < 0 || targetRow >= height) continue;
      const sourceOffset = row * source.width;
      data.set(
        source.data.subarray(sourceOffset + startColumn, sourceOffset + endColumn),
        targetRow * width + x + startColumn,
      );
    }
  };

  return { width, height, data, pixel, rect, sprite, circle, gradient, dither, blit };
}
