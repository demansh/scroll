const HEX = Object.freeze({
  black: "#1a1c2c",
  purple: "#5d275d",
  red: "#b13e53",
  orange: "#ef7d57",
  yellow: "#ffcd75",
  lime: "#a7f070",
  green: "#38b764",
  teal: "#257179",
  navy: "#29366f",
  blue: "#3b5dc9",
  sky: "#41a6f6",
  cyan: "#73eff7",
  white: "#f4f4f4",
  silver: "#94b0c2",
  gray: "#566c86",
  slate: "#333c57",
});

function hexToAbgr(hex) {
  const value = parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return ((255 << 24) | (blue << 16) | (green << 8) | red) >>> 0;
}

export const COLOR = Object.freeze(
  Object.fromEntries(Object.entries(HEX).map(([name, hex]) => [name, hexToAbgr(hex)])),
);
