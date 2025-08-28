import kaplay from "kaplay";
import type { Card } from "./cards";
import { generateDeck, shuffleDeck, dealCard } from "./cards";

enum Result {
  Bust,
  Hold,
  Win,
  Blackjack,
}

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
