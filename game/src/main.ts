import kaplay from "kaplay";

const k = kaplay({
  width: 640,
  height: 480,
  scale: 2,
  stretch: false,
  letterbox: false,
  debug: true,
  crisp: false,
  texFilter: "nearest",
  global: false,
});

k.loadRoot("./"); // A good idea for Itch.io publishing later

// load cards sprites
k.loadSprite("cards", "sprites/cards.png", {
  sliceX: 14,
  sliceY: 4,
});
