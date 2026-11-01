import { renderPost } from "./post.js";
import { paintCanvas } from "./canvas.js";
import { hashSeed } from "./rng.js";

const BATCH_SIZE = 6;
const MAX_POSTS_IN_DOM = 200;
const PRUNE_COUNT = 50;
const PRELOAD_MARGIN_PX = 2400;

export function createFeed({ list, spacer, sentinel, baseSeed, layout: initialLayout }) {
  let layout = initialLayout;
  let nextIndex = 0;
  let prunedHeight = 0;
  let isFilling = false;

  const paintPost = (canvas, index) => {
    paintCanvas(canvas, renderPost(hashSeed(baseSeed, index), layout.logicalWidth), layout.pixelSize);
  };

  const createPostElement = (index) => {
    const article = document.createElement("article");
    const canvas = document.createElement("canvas");
    article.dataset.index = String(index);
    article.append(canvas);
    paintPost(canvas, index);
    return article;
  };

  const pruneAboveViewport = () => {
    if (list.childElementCount <= MAX_POSTS_IN_DOM) return;
    let removedHeight = 0;
    for (let removed = 0; removed < PRUNE_COUNT; removed++) {
      const first = list.firstElementChild;
      const bounds = first.getBoundingClientRect();
      if (bounds.bottom > 0) break;
      removedHeight += bounds.height;
      first.remove();
    }
    prunedHeight += removedHeight;
    spacer.style.height = `${prunedHeight}px`;
  };

  const appendBatch = () => {
    const fragment = document.createDocumentFragment();
    for (let count = 0; count < BATCH_SIZE; count++) fragment.append(createPostElement(nextIndex++));
    list.append(fragment);
    pruneAboveViewport();
  };

  const needsMorePosts = () => sentinel.getBoundingClientRect().top < window.innerHeight + PRELOAD_MARGIN_PX;

  const fill = () => {
    if (isFilling) return;
    isFilling = true;
    const step = () => {
      try {
        appendBatch();
      } catch (error) {
        isFilling = false;
        throw error;
      }
      if (needsMorePosts()) requestAnimationFrame(step);
      else isFilling = false;
    };
    requestAnimationFrame(step);
  };

  const relayout = (nextLayout) => {
    const widthRatio = nextLayout.cssWidth / layout.cssWidth;
    layout = nextLayout;
    for (const article of list.children) paintPost(article.firstElementChild, Number(article.dataset.index));
    prunedHeight *= widthRatio;
    spacer.style.height = `${prunedHeight}px`;
    fill();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) fill();
    },
    { rootMargin: `0px 0px ${PRELOAD_MARGIN_PX}px 0px` },
  );
  observer.observe(sentinel);
  fill();

  return { relayout };
}
