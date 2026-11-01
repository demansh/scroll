import { createFeed } from "./feed.js";
import { paintCanvas } from "./canvas.js";
import { renderTopBar, renderBottomBar, renderStories } from "./chrome.js";
import { hashSeed } from "./rng.js";

const MAX_FEED_CSS_WIDTH = 480;
const TARGET_LOGICAL_WIDTH = 96;
const MIN_PIXEL_SIZE = 2;
const RESIZE_DEBOUNCE_MS = 150;

function measureLayout() {
  const availableWidth = Math.min(document.documentElement.clientWidth, MAX_FEED_CSS_WIDTH);
  const pixelSize = Math.max(MIN_PIXEL_SIZE, Math.round(availableWidth / TARGET_LOGICAL_WIDTH));
  const logicalWidth = Math.floor(availableWidth / pixelSize);
  return { pixelSize, logicalWidth, cssWidth: logicalWidth * pixelSize };
}

function isSameLayout(first, second) {
  return first.pixelSize === second.pixelSize && first.logicalWidth === second.logicalWidth;
}

function requireElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id} in page markup`);
  return element;
}

function showFatalError(error) {
  console.error(error);
  const message = document.createElement("div");
  message.className = "fatal";
  message.textContent = `Something broke: ${error?.message ?? error}`;
  document.body.append(message);
}

function renderChrome(elements, layout, seed) {
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--feed-width", `${layout.cssWidth}px`);
  const topBar = renderTopBar(layout.logicalWidth);
  const bottomBar = renderBottomBar(layout.logicalWidth, seed);
  paintCanvas(elements.topBar, topBar, layout.pixelSize);
  paintCanvas(elements.bottomBar, bottomBar, layout.pixelSize);
  paintCanvas(elements.stories, renderStories(layout.logicalWidth, hashSeed(seed, 0)), layout.pixelSize);
  rootStyle.setProperty("--topbar-height", `${topBar.height * layout.pixelSize}px`);
  rootStyle.setProperty("--bottombar-height", `${bottomBar.height * layout.pixelSize}px`);
}

function boot() {
  const elements = {
    topBar: requireElement("topbar"),
    bottomBar: requireElement("bottombar"),
    stories: requireElement("stories"),
    list: requireElement("feed-list"),
    spacer: requireElement("feed-spacer"),
    sentinel: requireElement("feed-sentinel"),
  };
  const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  let layout = measureLayout();
  renderChrome(elements, layout, seed);
  const feed = createFeed({ ...elements, baseSeed: seed, layout });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const nextLayout = measureLayout();
      if (isSameLayout(layout, nextLayout)) return;
      layout = nextLayout;
      renderChrome(elements, layout, seed);
      feed.relayout(layout);
    }, RESIZE_DEBOUNCE_MS);
  });
}

window.addEventListener("error", (event) => showFatalError(event.error ?? event.message));
window.addEventListener("unhandledrejection", (event) => showFatalError(event.reason));

try {
  boot();
} catch (error) {
  showFatalError(error);
}
