import { COLOR } from "./palette.js";
import { SPRITES } from "./sprites.js";

const SKY_GRADIENTS = Object.freeze({
  day: [COLOR.blue, COLOR.sky, COLOR.cyan],
  sunset: [COLOR.purple, COLOR.red, COLOR.orange, COLOR.yellow],
  dusk: [COLOR.navy, COLOR.purple, COLOR.red],
  night: [COLOR.black, COLOR.navy, COLOR.purple],
});

const DARK_SKIES = new Set(["dusk", "night"]);

const RIDGE_COLORS = Object.freeze({
  day: [COLOR.silver, COLOR.teal, COLOR.green],
  sunset: [COLOR.purple, COLOR.slate, COLOR.black],
  dusk: [COLOR.purple, COLOR.slate, COLOR.black],
  night: [COLOR.slate, COLOR.navy, COLOR.black],
});

const CAT_BACKDROPS = [
  [COLOR.sky, COLOR.cyan],
  [COLOR.purple, COLOR.red],
  [COLOR.teal, COLOR.green],
  [COLOR.yellow, COLOR.orange],
  [COLOR.navy, COLOR.blue],
];

const CAT_FURS = [COLOR.orange, COLOR.silver, COLOR.gray, COLOR.white, COLOR.yellow, COLOR.slate];

const ABSTRACT_RAMPS = [
  [COLOR.purple, COLOR.red, COLOR.orange, COLOR.yellow],
  [COLOR.navy, COLOR.blue, COLOR.sky, COLOR.cyan],
  [COLOR.teal, COLOR.green, COLOR.lime, COLOR.yellow],
  [COLOR.black, COLOR.slate, COLOR.gray, COLOR.silver],
];

function drawStars(surface, rng, maxY) {
  const starCount = Math.round((surface.width * maxY) / 45);
  for (let star = 0; star < starCount; star++) {
    const color = rng.chance(0.25) ? COLOR.white : COLOR.silver;
    surface.pixel(rng.int(0, surface.width - 1), rng.int(0, maxY - 1), color);
  }
}

function drawCelestial(surface, rng, skyName, maxY) {
  const radius = Math.max(3, Math.round((surface.width * rng.int(6, 10)) / 100));
  const x = rng.int(radius + 2, surface.width - radius - 3);
  const y = rng.int(radius + 2, Math.max(radius + 2, maxY - radius));
  if (DARK_SKIES.has(skyName)) {
    drawStars(surface, rng, maxY);
    surface.circle(x, y, radius, COLOR.white);
    const craterRadius = Math.max(1, Math.floor(radius / 3));
    surface.circle(x - craterRadius, y + Math.floor(radius / 4), craterRadius, COLOR.silver);
    return;
  }
  if (skyName === "sunset") surface.circle(x, y, radius + 2, COLOR.orange);
  surface.circle(x, y, radius, COLOR.yellow);
}

function createRidge(rng, width, lowest, highest, steepness) {
  const tops = new Array(width);
  let level = rng.int(highest, lowest);
  let slope = (rng.next() * 2 - 1) * steepness;
  for (let x = 0; x < width; x++) {
    if (rng.chance(0.12)) slope = (rng.next() * 2 - 1) * steepness;
    level += slope;
    if (level < highest) {
      level = highest;
      slope = rng.next() * steepness;
    }
    if (level > lowest) {
      level = lowest;
      slope = -rng.next() * steepness;
    }
    tops[x] = Math.round(level);
  }
  return tops;
}

function fillRidge(surface, tops, color) {
  tops.forEach((top, x) => surface.rect(x, top, 1, surface.height - top, color));
}

function drawTrees(surface, rng, tops, color) {
  for (let x = rng.int(0, 4); x < surface.width; x += rng.int(3, 7)) {
    const size = rng.int(2, 4);
    const top = tops[x] - size * 2;
    for (let tier = 0; tier < size; tier++) {
      surface.rect(x - tier, top + tier * 2, 1 + tier * 2, 2, color);
    }
  }
}

function drawMountains(surface, rng) {
  const { width, height } = surface;
  const skyName = rng.pick(Object.keys(SKY_GRADIENTS));
  surface.gradient(0, 0, width, height, SKY_GRADIENTS[skyName]);
  drawCelestial(surface, rng, skyName, Math.round(height * 0.45));
  const [farColor, middleColor, nearColor] = RIDGE_COLORS[skyName];

  const farTops = createRidge(rng, width, Math.round(height * 0.62), Math.round(height * 0.22), 1.6);
  fillRidge(surface, farTops, farColor);
  if (skyName === "day") {
    farTops.forEach((top, x) => {
      if (top < height * 0.4) surface.rect(x, top, 1, 2, COLOR.white);
    });
  }

  fillRidge(surface, createRidge(rng, width, Math.round(height * 0.8), Math.round(height * 0.5), 1.1), middleColor);

  const nearTops = createRidge(rng, width, Math.round(height * 0.95), Math.round(height * 0.72), 0.8);
  fillRidge(surface, nearTops, nearColor);
  if (skyName === "day") drawTrees(surface, rng, nearTops, COLOR.teal);
}

function drawSkyline(surface, rng, color, heightRange, windowColor, litChance) {
  const [minHeight, maxHeight] = heightRange;
  let x = -rng.int(0, 4);
  while (x < surface.width) {
    const buildingWidth = rng.int(8, 16);
    const top = surface.height - rng.int(minHeight, maxHeight);
    surface.rect(x, top, buildingWidth, surface.height - top, color);
    if (rng.chance(0.25)) {
      const antennaHeight = rng.int(3, 6);
      surface.rect(x + Math.floor(buildingWidth / 2), top - antennaHeight, 1, antennaHeight, color);
    }
    for (let windowY = top + 2; windowY < surface.height - 1; windowY += 3) {
      for (let windowX = x + 2; windowX < x + buildingWidth - 2; windowX += 2) {
        if (rng.chance(litChance)) surface.pixel(windowX, windowY, windowColor);
      }
    }
    x += buildingWidth + rng.int(0, 2);
  }
}

function drawCity(surface, rng) {
  const { width, height } = surface;
  const skyName = rng.pick(["sunset", "dusk", "night", "night"]);
  surface.gradient(0, 0, width, height, SKY_GRADIENTS[skyName]);
  drawCelestial(surface, rng, skyName, Math.round(height * 0.4));
  const backColor = skyName === "sunset" ? COLOR.purple : COLOR.slate;
  drawSkyline(surface, rng, backColor, [Math.round(height * 0.35), Math.round(height * 0.75)], COLOR.orange, 0.12);
  drawSkyline(surface, rng, COLOR.black, [Math.round(height * 0.15), Math.round(height * 0.55)], COLOR.yellow, 0.35);
}

function drawSea(surface, rng) {
  const { width, height } = surface;
  const skyName = rng.pick(["day", "sunset", "sunset", "dusk"]);
  const isDark = DARK_SKIES.has(skyName);
  const horizon = Math.round((height * rng.int(45, 60)) / 100);
  surface.gradient(0, 0, width, horizon, SKY_GRADIENTS[skyName]);
  if (isDark) drawStars(surface, rng, horizon);

  const radius = Math.max(4, Math.round(width * 0.1));
  const sunX = rng.int(radius + 2, width - radius - 3);
  surface.circle(sunX, horizon - Math.floor(radius * 0.6), radius, isDark ? COLOR.white : COLOR.yellow);

  const waterColors = skyName === "day" ? [COLOR.sky, COLOR.blue, COLOR.navy] : [COLOR.purple, COLOR.navy, COLOR.black];
  surface.gradient(0, horizon, width, height - horizon, waterColors);

  const glintColor = isDark ? COLOR.silver : skyName === "day" ? COLOR.white : COLOR.yellow;
  for (let y = horizon + 1; y < height; y += 2) {
    if (!rng.chance(0.8)) continue;
    const depth = (y - horizon) / (height - horizon);
    const span = Math.round(radius * (1.4 + depth));
    const segment = rng.int(1, Math.max(2, Math.round(span * (1 - depth * 0.6))));
    surface.rect(sunX + rng.int(-span, span) - Math.floor(segment / 2), y, segment, 1, glintColor);
  }

  const waveColor = skyName === "day" ? COLOR.cyan : COLOR.slate;
  const waveCount = Math.round((width * (height - horizon)) / 50);
  for (let wave = 0; wave < waveCount; wave++) {
    surface.rect(rng.int(0, width), rng.int(horizon + 2, height - 1), rng.int(2, 4), 1, waveColor);
  }

  if (rng.chance(0.6)) surface.sprite(SPRITES.boat, rng.int(2, width - 11), horizon - 3, COLOR.black);
  if (!isDark) {
    const birdCount = rng.int(0, 3);
    for (let bird = 0; bird < birdCount; bird++) {
      surface.sprite(SPRITES.bird, rng.int(2, width - 7), rng.int(3, Math.max(3, horizon - 10)), COLOR.black);
    }
  }
}

function drawBackdropPattern(surface, rng, [baseColor, accentColor]) {
  surface.rect(0, 0, surface.width, surface.height, baseColor);
  const pattern = rng.pick(["checker", "stripes", "dots"]);
  const cell = rng.int(3, 6);
  for (let y = 0; y < surface.height; y++) {
    for (let x = 0; x < surface.width; x++) {
      const isAccent =
        pattern === "checker"
          ? (Math.floor(x / cell) + Math.floor(y / cell)) % 2 === 0
          : pattern === "stripes"
            ? Math.floor((x + y) / cell) % 2 === 0
            : x % (cell * 2) < 2 && (y + (Math.floor(x / (cell * 2)) % 2) * cell) % (cell * 2) < 2;
      if (isAccent) surface.pixel(x, y, accentColor);
    }
  }
}

function drawCat(surface, rng) {
  drawBackdropPattern(surface, rng, rng.pick(CAT_BACKDROPS));
  const fur = rng.pick(CAT_FURS);
  const colors = {
    o: COLOR.black,
    b: fur,
    w: fur === COLOR.white ? COLOR.silver : COLOR.white,
    k: COLOR.black,
    p: COLOR.red,
  };
  const spriteColumns = SPRITES.cat[0].length;
  const spriteRows = SPRITES.cat.length;
  const scale = Math.max(1, Math.floor((Math.min(surface.width, surface.height) * 0.7) / spriteColumns));
  const x = Math.floor((surface.width - spriteColumns * scale) / 2);
  const y = Math.floor((surface.height - spriteRows * scale) / 2);
  surface.dither(x + scale * 3, y + (spriteRows + 1) * scale, (spriteColumns - 6) * scale, scale, COLOR.black, 8);
  surface.sprite(SPRITES.cat, x, y, colors, scale);
}

function drawConcentric(surface, rng, ramp) {
  const step = rng.int(3, 6);
  const limit = Math.min(surface.width, surface.height) / 2;
  for (let ring = 0; ring * step < limit; ring++) {
    const inset = ring * step;
    surface.rect(inset, inset, surface.width - inset * 2, surface.height - inset * 2, ramp[ring % ramp.length]);
  }
}

function drawSunburst(surface, rng, ramp) {
  const centerX = surface.width / 2;
  const centerY = surface.height / 2;
  const rayCount = rng.int(8, 16);
  const twist = rng.next() * 0.08;
  for (let y = 0; y < surface.height; y++) {
    for (let x = 0; x < surface.width; x++) {
      const angle = Math.atan2(y - centerY, x - centerX) + Math.hypot(x - centerX, y - centerY) * twist;
      const band = Math.floor((angle / (Math.PI * 2) + 1) * rayCount) % 2;
      surface.pixel(x, y, band ? ramp[0] : ramp[1]);
    }
  }
  const radius = Math.round(Math.min(surface.width, surface.height) / 6);
  surface.circle(Math.round(centerX), Math.round(centerY), radius, ramp[3]);
  surface.circle(Math.round(centerX), Math.round(centerY), Math.max(1, radius - 2), ramp[2]);
}

function drawWaves(surface, rng, ramp) {
  const bandHeight = rng.int(4, 8);
  const amplitude = rng.int(2, 6);
  const frequency = 0.08 + rng.next() * 0.15;
  const phase = rng.next() * Math.PI * 2;
  for (let x = 0; x < surface.width; x++) {
    const offset = Math.sin(x * frequency + phase) * amplitude + amplitude;
    for (let y = 0; y < surface.height; y++) {
      const band = Math.floor((y + offset) / bandHeight);
      surface.pixel(x, y, ramp[band % ramp.length]);
    }
  }
}

function drawAbstract(surface, rng) {
  const ramp = rng.pick(ABSTRACT_RAMPS);
  const variant = rng.pick([drawConcentric, drawSunburst, drawWaves]);
  variant(surface, rng, ramp);
}

const SCENES = [
  [drawMountains, 3],
  [drawCity, 2],
  [drawSea, 2],
  [drawCat, 2],
  [drawAbstract, 1],
];

export function drawRandomScene(surface, rng) {
  rng.weighted(SCENES)(surface, rng);
}
