# SCROLL — guide for agents

Static Jekyll site (GitHub Pages, `baseurl: /scroll`): a mobile-first pixel-art doomscrolling feed.
Idea backlog: `~/ai/doomscroll-game/mechanics-brainstorm.md`.

## Hard rules
- Vanilla JS ES modules only. No npm, no bundler, no CDNs, no libraries.
- GitHub Pages runs Jekyll 3.x: no custom plugins, no Jekyll 4-only features.
- All URLs in templates go through `| relative_url`. JS imports are relative paths.
- Everything is pixel art: draw into a low-res `createSurface` buffer (16-color palette in `palette.js`),
  paint it to a canvas at logical size and upscale with `image-rendering: pixelated`.
- No real text in posts: "text" is drawn by `drawWords` / `drawParagraph` as glyph-shaped pixel bars.

## Code style
- No comments or docstrings in code. Descriptive names, small functions, `const` by default.
- Fail visibly: errors go to `console.error` and the `.fatal` overlay.

## Verify
- `bundle exec jekyll build`, serve `_site` under `/scroll/`; main testing is on a real phone via GitHub Pages.
