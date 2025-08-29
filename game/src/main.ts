import { crew } from "@kaplayjs/crew";
import kaplay from "kaplay";
import type { Card } from "./cards";
import { generateDeck, shuffleDeck, dealCard } from "./cards";

const SPRITE_SIZE: number = 64;
const CARD_BACK_FRAME: number = 27;
const CARD_SPACING: number = 48;

enum Result {
  Bust,
  Hold,
  Win,
  Blackjack,
}

const k = kaplay({
  width: 640,
  height: 360,
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
    k.pos(k.width() - 100, k.height() - SPRITE_SIZE * 2),
    k.rect(100, 32, { radius: 4 }),
    k.area(),
    k.anchor("center"),
  ]);

  const stand = k.add([
    k.pos(k.width() - 100, k.height() - SPRITE_SIZE),
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

  // add hit function
  hit.onClick(() => {
    hand.push(dealCard(deck));
    const result: Result = showHand(hand);

    if (result === Result.Bust) {
      // lose
    } else if (result === Result.Win) {
      // win
    }
  });

  // add stand function
  stand.onClick(() => {
    showDealerHand(dealerHand);
  });

  // add card deck sprite
  k.add([
    k.sprite("cards", { frame: CARD_BACK_FRAME }),
    k.pos(SPRITE_SIZE, k.height() / 2),
    k.anchor("center"),
  ]);

  // display score
  const score = k.add([
    k.pos(SPRITE_SIZE / 2, k.height() - SPRITE_SIZE),
    k.text("Score: 0", { size: 16 }),
  ]);

  let deck: Array<Card> = generateDeck();
  shuffleDeck(deck);

  let hand: Array<Card> = [];
  hand.push(dealCard(deck));
  hand.push(dealCard(deck));

  let dealerHand: Array<Card> = [];
  dealerHand.push(dealCard(deck));
  dealerHand.push(dealCard(deck));

  startDealerHand(dealerHand);

  const result: Result = showHand(hand);
  if (result === Result.Blackjack) {
    // win
  }

  function startDealerHand(hand: Array<Card>): void {
    k.add([
      k.sprite("cards", { frame: hand[0].frame }),
      k.pos(CARD_SPACING * 4, SPRITE_SIZE),
      k.anchor("center"),
    ]);

    k.add([
      k.sprite("cards", { frame: CARD_BACK_FRAME }),
      k.pos(CARD_SPACING * 5, SPRITE_SIZE),
      k.anchor("center"),
    ]);
  }

  function showDealerHand(hand: Array<Card>): void {
    for (let i = 0; i < hand.length; i++) {
      k.add([
        k.sprite("cards", { frame: hand[i].frame }),
        k.pos(
          CARD_SPACING * (i < 6 ? i + 4 : i - 2),
          SPRITE_SIZE * (i < 6 ? 1 : 2)
        ),
        k.anchor("center"),
      ]);
    }
  }

  function showHand(hand: Array<Card>): Result {
    for (let i = 0; i < hand.length; i++) {
      k.add([
        k.sprite("cards", { frame: hand[i].frame }),
        k.pos(
          CARD_SPACING * (i < 6 ? i + 4 : i - 2),
          k.height() - SPRITE_SIZE * (i < 6 ? 2 : 1)
        ),
        k.anchor("center"),
      ]);
    }
    return checkHand(hand);
  }

  function checkHand(hand: Array<Card>): Result {
    const [minScore, maxScore] = calculatePoints(hand);
    score.text = `Score: ${maxScore}`;
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
