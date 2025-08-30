import { crew } from "@kaplayjs/crew";
import kaplay, { GameObj } from "kaplay";
import type { Card } from "./cards";
import { generateDeck, shuffleDeck, dealCard } from "./cards";

const SPRITE_SIZE: number = 64;
const CARD_BACK_FRAME: number = 27;
const CARD_SPACING: number = 48;

enum Result {
  Bust,
  Hold,
  Win,
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
    k.area({ cursor: "pointer" }),
    k.anchor("center"),
    "button",
  ]);

  const stand = k.add([
    k.pos(k.width() - 100, k.height() - SPRITE_SIZE),
    k.rect(100, 32, { radius: 4 }),
    k.area({ cursor: "pointer" }),
    k.anchor("center"),
    "button",
  ]);

  // reset cursor on hover end
  k.onHoverEnd("button", () => k.setCursor("default"));

  // add text to buttons
  hit.add([
    k.text("Hit", { size: 24 }),
    k.color(0, 0, 0),
    k.anchor("center"),
    "text",
  ]);

  stand.add([
    k.text("Stand", { size: 24 }),
    k.color(0, 0, 0),
    k.anchor("center"),
    "text",
  ]);

  // add hit function
  hit.onClick(() => {
    hand.push(dealCard(deck));
    const result: Result = showHand(hand);

    if (result === Result.Hold) return;

    hit.paused = true;
    stand.paused = true;
    k.setCursor("default");

    message.text = result === Result.Win ? "Win!" : "Bust :(";
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
    "text",
  ]);

  // add message to display win/lose state
  const message = k.add([
    k.pos(SPRITE_SIZE / 2, k.height() - SPRITE_SIZE * 2),
    k.text("", { size: 16 }),
    "text",
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
  if (result === Result.Win) {
    message.text = "Blackjack!";
    hit.paused = true;
    stand.paused = true;
    // reveal dealer card (do they also draw more?)
    // if dealer also has blackjack, tie
  }

  function startDealerHand(hand: Array<Card>): void {
    makeCard(hand[0].frame, CARD_SPACING * 4, SPRITE_SIZE, "dealerCard");
    makeCard(CARD_BACK_FRAME, CARD_SPACING * 5, SPRITE_SIZE, "holeCard");
  }

  function showDealerHand(hand: Array<Card>): void {
    const [holeCard] = k.get("holeCard");

    if (holeCard) {
      holeCard.frame = hand[1].frame;
      holeCard.untag("holeCard");
      holeCard.tag("dealerCard");
    }

    const cards = k.get("dealerCard");

    for (let i = cards.length; i < hand.length; i++) {
      makeCard(
        hand[i].frame,
        CARD_SPACING * (i < 6 ? i + 4 : i - 2),
        SPRITE_SIZE * (i < 6 ? 1 : 2),
        "dealerCard"
      );
    }
  }

  function showHand(hand: Array<Card>): Result {
    const cards = k.get("card");

    for (let i = cards.length; i < hand.length; i++) {
      makeCard(
        hand[i].frame,
        CARD_SPACING * (i < 6 ? i + 4 : i - 2),
        k.height() - SPRITE_SIZE * (i < 6 ? 2 : 1),
        "card"
      );
    }

    return checkHand(hand);
  }

  function makeCard(
    frame: number,
    posX: number,
    posY: number,
    tag: string
  ): GameObj {
    return k.add([
      k.sprite("cards", { frame: frame }),
      k.pos(posX, posY),
      k.anchor("center"),
      tag,
    ]);
  }

  function checkHand(hand: Array<Card>): Result {
    const [minScore, maxScore] = calculatePoints(hand);
    score.text = `Score: ${maxScore > 21 ? minScore : maxScore}`;
    if (minScore > 21) return Result.Bust;
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
