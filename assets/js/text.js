export const LINE_HEIGHT = 6;

const GLYPH_WIDTH = 2;
const WORD_GAP = 2;
const TALL_GLYPH_CHANCE = 0.3;

export function drawWords(surface, rng, x, y, maxWidth, color, glyphHeight = 3) {
  const limit = x + maxWidth;
  let cursor = x;
  while (true) {
    const letterCount = rng.int(2, 7);
    const wordWidth = letterCount * GLYPH_WIDTH;
    if (cursor + wordWidth > limit) break;
    for (let letter = 0; letter < letterCount; letter++) {
      const isTall = glyphHeight < 3 || rng.chance(TALL_GLYPH_CHANCE);
      const top = isTall ? y : y + 1;
      surface.rect(cursor + letter * GLYPH_WIDTH, top, GLYPH_WIDTH, y + glyphHeight - top, color);
    }
    cursor += wordWidth + WORD_GAP;
  }
  return Math.max(0, cursor - WORD_GAP - x);
}

export function drawParagraph(surface, rng, x, y, width, lineCount, color) {
  for (let line = 0; line < lineCount; line++) {
    const isLastLine = line === lineCount - 1;
    const lineWidth = isLastLine ? Math.round(width * (0.3 + rng.next() * 0.5)) : width;
    drawWords(surface, rng, x, y + line * LINE_HEIGHT, lineWidth, color);
  }
}
