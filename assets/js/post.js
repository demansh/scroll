import { COLOR } from "./palette.js";
import { createRng, hashSeed } from "./rng.js";
import { createSurface } from "./surface.js";
import { drawWords, drawParagraph, LINE_HEIGHT } from "./text.js";
import { drawAvatar, drawStoryRing } from "./avatar.js";
import { drawRandomScene } from "./scenes.js";
import { SPRITES } from "./sprites.js";

export const PADDING = 4;
export const STORY_RING_SIZE = 16;

const POST_KINDS = [
  ["photo", 45],
  ["text", 18],
  ["video", 15],
  ["carousel", 12],
  ["ad", 10],
];

const MEDIA_ASPECTS = Object.freeze({
  photo: [1, 1.25, 0.75],
  video: [0.5625, 1.25],
  carousel: [1, 1.25],
  ad: [1, 0.75],
});

function planPost(seed, width) {
  const rng = createRng(seed);
  const kind = rng.weighted(POST_KINDS);
  const isTextOnly = kind === "text";
  return {
    kind,
    width,
    hasStoryRing: kind !== "ad" && rng.chance(0.3),
    isVerified: rng.chance(0.15),
    isLiked: rng.chance(0.2),
    isSaved: rng.chance(0.08),
    nameWidth: rng.int(16, 34),
    textLines: isTextOnly ? rng.int(2, 7) : 0,
    mediaHeight: isTextOnly ? 0 : Math.round(width * rng.pick(MEDIA_ASPECTS[kind])),
    captionLines: isTextOnly ? 0 : rng.int(1, 3),
    carouselCount: rng.int(2, 6),
    hasCommentsHint: rng.chance(0.7),
  };
}

function headerBlock(plan) {
  return {
    height: 20,
    draw(surface, rng, y) {
      if (plan.hasStoryRing) drawStoryRing(surface, PADDING, y + 2, STORY_RING_SIZE);
      drawAvatar(surface, rng, PADDING + 3, y + 5, 10);
      const nameX = PADDING + STORY_RING_SIZE + 4;
      const nameWidth = drawWords(surface, rng, nameX, y + 6, plan.nameWidth, COLOR.white);
      if (plan.isVerified) surface.sprite(SPRITES.badge, nameX + nameWidth + 2, y + 6, COLOR.sky);
      const subtitleColor = plan.kind === "ad" ? COLOR.orange : COLOR.gray;
      drawWords(surface, rng, nameX, y + 12, rng.int(10, 24), subtitleColor, 2);
      surface.sprite(SPRITES.kebab, plan.width - PADDING - 5, y + 10, COLOR.silver);
    },
  };
}

function textBlock(plan) {
  return {
    height: plan.textLines * LINE_HEIGHT + 2,
    draw(surface, rng, y) {
      drawParagraph(surface, rng, PADDING, y, plan.width - PADDING * 2, plan.textLines, COLOR.white);
    },
  };
}

function drawVideoOverlay(surface, rng, plan, y) {
  const centerX = Math.floor(plan.width / 2);
  const centerY = y + Math.floor(plan.mediaHeight / 2);
  surface.circle(centerX, centerY, 8, COLOR.black);
  surface.sprite(SPRITES.play, centerX - 1, centerY - 3, COLOR.white);
  const barY = y + plan.mediaHeight - 2;
  surface.rect(0, barY, plan.width, 2, COLOR.slate);
  surface.rect(0, barY, Math.round(plan.width * rng.next() * 0.8), 2, COLOR.red);
  const pillX = plan.width - PADDING - 14;
  surface.rect(pillX, barY - 9, 14, 6, COLOR.black);
  drawWords(surface, rng, pillX + 2, barY - 7, 10, COLOR.white, 2);
}

function drawCarouselOverlay(surface, rng, plan, y) {
  const pillX = plan.width - PADDING - 14;
  surface.rect(pillX, y + PADDING, 14, 7, COLOR.black);
  drawWords(surface, rng, pillX + 2, y + PADDING + 2, 10, COLOR.white);
}

function mediaBlock(plan) {
  return {
    height: plan.mediaHeight,
    draw(surface, rng, y) {
      const media = createSurface(plan.width, plan.mediaHeight, COLOR.black);
      drawRandomScene(media, rng);
      surface.blit(media, 0, y);
      if (plan.kind === "video") drawVideoOverlay(surface, rng, plan, y);
      if (plan.kind === "carousel") drawCarouselOverlay(surface, rng, plan, y);
    },
  };
}

function callToActionBlock(plan) {
  return {
    height: 12,
    draw(surface, rng, y) {
      surface.rect(0, y, plan.width, 11, COLOR.blue);
      drawWords(surface, rng, PADDING, y + 4, rng.int(18, 30), COLOR.white);
      surface.sprite(SPRITES.chevron, plan.width - PADDING - 3, y + 3, COLOR.white);
    },
  };
}

function drawCarouselDots(surface, plan, y) {
  const dotsWidth = plan.carouselCount * 4 - 2;
  const startX = Math.floor((plan.width - dotsWidth) / 2);
  for (let dot = 0; dot < plan.carouselCount; dot++) {
    surface.rect(startX + dot * 4, y, 2, 2, dot === 0 ? COLOR.sky : COLOR.gray);
  }
}

function actionsBlock(plan) {
  return {
    height: 13,
    draw(surface, rng, y) {
      const iconY = y + 4;
      const heart = plan.isLiked ? SPRITES.heartFilled : SPRITES.heart;
      surface.sprite(heart, PADDING, iconY, plan.isLiked ? COLOR.red : COLOR.white);
      surface.sprite(SPRITES.comment, PADDING + 11, iconY, COLOR.white);
      surface.sprite(SPRITES.share, PADDING + 22, iconY, COLOR.white);
      const bookmark = plan.isSaved ? SPRITES.bookmarkFilled : SPRITES.bookmark;
      surface.sprite(bookmark, plan.width - PADDING - 5, iconY, COLOR.white);
      if (plan.kind === "carousel") drawCarouselDots(surface, plan, iconY + 2);
    },
  };
}

function singleLineBlock(widthRange, color, glyphHeight = 3) {
  return {
    height: LINE_HEIGHT,
    draw(surface, rng, y) {
      drawWords(surface, rng, PADDING, y, rng.int(...widthRange), color, glyphHeight);
    },
  };
}

function captionBlock(plan) {
  return {
    height: plan.captionLines * LINE_HEIGHT,
    draw(surface, rng, y) {
      const contentWidth = plan.width - PADDING * 2;
      const authorWidth = drawWords(surface, rng, PADDING, y, rng.int(8, 16), COLOR.white);
      const firstLineX = PADDING + authorWidth + 2;
      const isSingleLine = plan.captionLines === 1;
      const firstLineWidth = isSingleLine ? Math.round(contentWidth * 0.6) : contentWidth - authorWidth - 2;
      drawWords(surface, rng, firstLineX, y, firstLineWidth, COLOR.silver);
      if (plan.captionLines > 1) {
        drawParagraph(surface, rng, PADDING, y + LINE_HEIGHT, contentWidth, plan.captionLines - 1, COLOR.silver);
      }
    },
  };
}

function dividerBlock(plan) {
  return {
    height: 4,
    draw(surface, rng, y) {
      surface.rect(0, y + 3, plan.width, 1, COLOR.slate);
    },
  };
}

function buildBlocks(plan) {
  const blocks = [headerBlock(plan)];
  if (plan.textLines) blocks.push(textBlock(plan));
  if (plan.mediaHeight) blocks.push(mediaBlock(plan));
  if (plan.kind === "ad") blocks.push(callToActionBlock(plan));
  blocks.push(actionsBlock(plan), singleLineBlock([14, 28], COLOR.white));
  if (plan.captionLines) blocks.push(captionBlock(plan));
  if (plan.hasCommentsHint) blocks.push(singleLineBlock([24, 44], COLOR.gray));
  blocks.push(singleLineBlock([10, 18], COLOR.gray, 2), dividerBlock(plan));
  return blocks;
}

export function renderPost(seed, width) {
  const plan = planPost(seed, width);
  const blocks = buildBlocks(plan);
  const height = blocks.reduce((sum, block) => sum + block.height, 0);
  const surface = createSurface(width, height, COLOR.black);
  const rng = createRng(hashSeed(seed, 1));
  let y = 0;
  for (const block of blocks) {
    block.draw(surface, rng, y);
    y += block.height;
  }
  return surface;
}
