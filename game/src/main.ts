import { crew } from "@kaplayjs/crew";
import kaplay from "kaplay";
import type { Card } from "./cards";
import { generateDeck, shuffleDeck, dealCard } from "./cards";

const SCREEN_WIDTH: number = 640;
const SCREEN_HEIGHT: number = 360;
const SPRITE_SIZE: number = 64;

enum Result {
  Bust,
  Hold,
  Win,
  Blackjack,
}

const k = kaplay({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  scale: 2,
  stretch: false,
  letterbox: false,
  debug: true,
  font: "happy",
  crisp: false,
  background: "000000",
  texFilter: "nearest",
  global: false,
  plugins: [crew],
});

k.loadRoot("./"); // A good idea for Itch.io publishing later

// load font
k.loadCrew("font", "happy");

// load cards sprites
k.loadSprite("cards", "sprites/cards.png", {
  sliceX: 14,
  sliceY: 4,
});

k.scene("game", () => {
  // add buttons
  const hit = k.add([
    k.pos(200, 300),
    k.rect(100, 32, { radius: 4 }),
    k.area(),
    k.anchor("center"),
  ]);

  const stand = k.add([
    k.pos(400, 300),
    k.rect(100, 32, { radius: 4 }),
    k.area(),
    k.anchor("center"),
  ]);

  // add text to buttons
  k.add([
    k.pos(hit.pos),
    k.text("Hit", { size: 24 }),
    k.color(0, 0, 0),
    k.anchor("center"),
  ]);

  k.add([
    k.pos(stand.pos),
    k.text("Stand", { size: 24 }),
    k.color(0, 0, 0),
    k.anchor("center"),
  ]);

  // add onClick functions
  hit.onClick(() => {
    hand.push(dealCard(deck));
    showHand(hand);
  });

  // add card deck sprite
  k.add([
    k.sprite("cards", { frame: 27 }),
    k.pos(SPRITE_SIZE, SCREEN_HEIGHT / 2),
    k.anchor("center"),
  ]);

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
        k.pos(40 + SPRITE_SIZE * i, 40),
      ]);
    }
  }

  function checkHand(hand: Array<Card>): Result {
    const [minScore, maxScore] = calculatePoints(hand);
    if (minScore > 21) return Result.Bust;
    if (maxScore === 21 && hand.length === 2) return Result.Blackjack;
    if (minScore === 21 || maxScore === 21) return Result.Win;
    return Result.Hold;
  }

  function calculatePoints(hand: Array<Card>): [number, number] {
    // aces can be worth either 1 or 11 so we need to keep track of them
    let aceCount: number = 0;

    let score: number = hand.reduce((total, card) => {
      if (card.points === 1) aceCount++;
      return total + card.points;
    }, 0);

    // returns minimum and maximum score
    return [score, score + aceCount * 10];
  }
});

k.go("game");
