import kaplay from "kaplay";
import type { Card } from "./cards";
import { generateDeck, shuffleDeck, dealCard } from "./cards";

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
  sliceX: 14,
  sliceY: 4,
});

k.scene("game", () => {
  let deck: Array<Card> = generateDeck();
  shuffleDeck(deck);

  let hand: Array<Card> = [];
  hand.push(dealCard(deck));
  hand.push(dealCard(deck));

  showHand(hand);

  function showHand(hand: Array<Card>): void {
    for (let i = 0; i < hand.length; i++) {
      k.add([
        k.sprite("cards", { frame: hand[i].frame }),
        k.pos(40 + 64 * i, 40),
      ]);
    }
  }
});

k.go("game");
