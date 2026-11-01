import { COLOR } from "./palette.js";

const IDENTICON_CELLS = 5;
const AVATAR_FOREGROUNDS = [COLOR.yellow, COLOR.orange, COLOR.lime, COLOR.cyan, COLOR.sky, COLOR.red, COLOR.white];
const AVATAR_BACKGROUNDS = [COLOR.slate, COLOR.navy, COLOR.purple, COLOR.teal];
const RING_THICKNESS = 1.4;

export const STORY_RING_COLORS = [COLOR.yellow, COLOR.orange, COLOR.red, COLOR.purple];
export const SEEN_RING_COLORS = [COLOR.gray];

function distanceSquaredFromCenter(column, row, size) {
  const center = (size - 1) / 2;
  return (column - center) ** 2 + (row - center) ** 2;
}

function createIdenticon(rng) {
  return Array.from({ length: IDENTICON_CELLS }, () => {
    const left = [rng.chance(0.5), rng.chance(0.5), rng.chance(0.5)];
    return [left[0], left[1], left[2], left[1], left[0]];
  });
}

export function drawAvatar(surface, rng, x, y, size) {
  const cells = createIdenticon(rng);
  const foreground = rng.pick(AVATAR_FOREGROUNDS);
  const background = rng.pick(AVATAR_BACKGROUNDS);
  const cellSize = size / IDENTICON_CELLS;
  const radiusSquared = (size / 2) ** 2;
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      if (distanceSquaredFromCenter(column, row, size) > radiusSquared) continue;
      const isFilled = cells[Math.floor(row / cellSize)][Math.floor(column / cellSize)];
      surface.pixel(x + column, y + row, isFilled ? foreground : background);
    }
  }
}

export function drawStoryRing(surface, x, y, size, colors = STORY_RING_COLORS) {
  const outerSquared = (size / 2) ** 2;
  const innerSquared = (size / 2 - RING_THICKNESS) ** 2;
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      const distanceSquared = distanceSquaredFromCenter(column, row, size);
      if (distanceSquared > outerSquared || distanceSquared <= innerSquared) continue;
      const diagonal = (column + (size - 1 - row)) / (2 * (size - 1));
      const colorIndex = Math.min(colors.length - 1, Math.floor(diagonal * colors.length));
      surface.pixel(x + column, y + row, colors[colorIndex]);
    }
  }
}
