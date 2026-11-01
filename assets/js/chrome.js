import { COLOR } from "./palette.js";
import { createRng } from "./rng.js";
import { createSurface } from "./surface.js";
import { drawWords } from "./text.js";
import { drawAvatar, drawStoryRing, STORY_RING_COLORS, SEEN_RING_COLORS } from "./avatar.js";
import { PADDING, STORY_RING_SIZE } from "./post.js";
import { SPRITES } from "./sprites.js";

const STORY_SLOT_WIDTH = 20;

export function renderTopBar(width) {
  const surface = createSurface(width, 15, COLOR.black);
  surface.sprite(SPRITES.logo, PADDING, 4, COLOR.white);
  surface.sprite(SPRITES.heart, width - PADDING - 18, 5, COLOR.white);
  surface.sprite(SPRITES.comment, width - PADDING - 7, 4, COLOR.white);
  surface.rect(width - PADDING - 2, 3, 3, 3, COLOR.red);
  surface.rect(0, 14, width, 1, COLOR.slate);
  return surface;
}

export function renderBottomBar(width, seed) {
  const surface = createSurface(width, 17, COLOR.black);
  surface.rect(0, 0, width, 1, COLOR.slate);
  const icons = [
    { sprite: SPRITES.home, color: COLOR.white },
    { sprite: SPRITES.search, color: COLOR.silver },
    { sprite: SPRITES.create, color: COLOR.silver },
    { sprite: SPRITES.reels, color: COLOR.silver },
  ];
  const slotWidth = width / (icons.length + 1);
  icons.forEach(({ sprite, color }, index) => {
    surface.sprite(sprite, Math.round(slotWidth * index + slotWidth / 2) - 4, 4, color);
  });
  const profileCenter = Math.round(slotWidth * icons.length + slotWidth / 2);
  drawAvatar(surface, createRng(seed), profileCenter - 5, 3, 10);
  return surface;
}

function drawOwnStory(surface, rng, x) {
  drawAvatar(surface, rng, x + 3, 5, 10);
  surface.circle(x + 12, 13, 3, COLOR.black);
  surface.circle(x + 12, 13, 2, COLOR.sky);
  surface.sprite(SPRITES.badge, x + 11, 12, COLOR.white);
}

export function renderStories(width, seed) {
  const surface = createSurface(width, 32, COLOR.black);
  const rng = createRng(seed);
  const storyCount = Math.ceil((width - PADDING) / STORY_SLOT_WIDTH);
  for (let story = 0; story < storyCount; story++) {
    const x = PADDING + story * STORY_SLOT_WIDTH;
    if (story === 0) {
      drawOwnStory(surface, rng, x);
    } else {
      drawStoryRing(surface, x, 2, STORY_RING_SIZE, rng.chance(0.75) ? STORY_RING_COLORS : SEEN_RING_COLORS);
      drawAvatar(surface, rng, x + 3, 5, 10);
    }
    drawWords(surface, rng, x + 1, 22, STORY_RING_SIZE - 2, COLOR.silver, 2);
  }
  surface.rect(0, 31, width, 1, COLOR.slate);
  return surface;
}
