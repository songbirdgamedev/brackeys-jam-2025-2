import kaplay from "kaplay";
import type { Card } from "./cards";
import { generateDeck, shuffleDeck, dealCard } from "./cards";

const SPRITE_WIDTH = 14;
const SPRITE_HEIGHT = 4;

const k = kaplay({
  width: 640,
  height: 480,
  scale: 2,
  stretch: false,
  letterbox: false,
  debug: true,
  crisp: false,
  background: "000000",
  texFilter: "nearest",
  global: false,
});

k.loadRoot("./"); // A good idea for Itch.io publishing later

// load cards sprites
k.loadSprite("cards", "sprites/cards.png", {
  sliceX: SPRITE_WIDTH,
  sliceY: SPRITE_HEIGHT,
});

k.scene("game", () => {
  let deck: Array<Card> = generateDeck();
  shuffleDeck(deck);

  let card: Card = dealCard(deck);
  let frame: number = card.value + card.suit * SPRITE_WIDTH;

  k.add([k.sprite("cards", { frame: frame }), k.pos(80, 40)]);
});

k.go("game");
