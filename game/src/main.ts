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

  const nextRound = k.add([
    k.pos(k.width() - 100, SPRITE_SIZE),
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

  nextRound.add([
    k.text("Next", { size: 24 }),
    k.color(0, 0, 0),
    k.anchor("center"),
    "text",
  ]);

  // add hit function
  hit.onClick(() => {
    hand.push(dealCard(deck));
    const score: number = showHand(hand);
    if (score === 21) finishRound(Result.Win);
    else if (score > 21) finishRound(Result.Bust);
  });

  // add stand function
  stand.onClick(() => {
    finishRound(Result.Hold);
  });

  // add next round function
  nextRound.onClick(startRound);

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

  // display dealer score
  const dealerScore = k.add([
    k.pos(SPRITE_SIZE / 2, SPRITE_SIZE / 2),
    k.text("Dealer: 0", { size: 16 }),
    "text",
  ]);

  // add messages to display win/lose state
  const message = k.add([
    k.pos(SPRITE_SIZE / 2, k.height() - SPRITE_SIZE * 1.5),
    k.text("", { size: 16 }),
    "text",
  ]);

  const dealerMessage = k.add([
    k.pos(SPRITE_SIZE / 2, SPRITE_SIZE),
    k.text("", { size: 16 }),
    "text",
  ]);

  // initialise deck and hand variables
  let deck: Array<Card>;
  let hand: Array<Card>;
  let dealerHand: Array<Card>;

  // start game
  startRound();

  function startRound(): void {
    // hide and disable next round button
    nextRound.hidden = true;
    nextRound.paused = true;

    // hide any messages
    message.text = "";
    dealerMessage.text = "";

    // reset hands
    hand = [];
    dealerHand = [];
    k.destroyAll("card");
    k.destroyAll("dealerCard");

    // create deck
    deck = generateDeck();
    shuffleDeck(deck);

    // deal cards
    hand.push(dealCard(deck));
    hand.push(dealCard(deck));

    dealerHand.push(dealCard(deck));
    dealerHand.push(dealCard(deck));

    // show initial dealer cards
    startDealerHand(dealerHand);

    // enable gameplay buttons
    hit.paused = false;
    stand.paused = false;

    // show hand and check result
    if (showHand(hand) === 21) {
      finishRound(Result.Blackjack);
    }
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

  function startDealerHand(hand: Array<Card>): void {
    makeCard(hand[0].frame, CARD_SPACING * 4, SPRITE_SIZE, "dealerCard");
    makeCard(CARD_BACK_FRAME, CARD_SPACING * 5, SPRITE_SIZE, "holeCard");
    dealerScore.text = `Dealer: ${hand[0].points === 1 ? 11 : hand[0].points}`;
  }

  function showDealerHand(hand: Array<Card>): number {
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

    return checkHand(hand, "Dealer");
  }

  function showHand(hand: Array<Card>): number {
    const cards = k.get("card");

    for (let i = cards.length; i < hand.length; i++) {
      makeCard(
        hand[i].frame,
        CARD_SPACING * (i < 6 ? i + 4 : i - 2),
        k.height() - SPRITE_SIZE * (i < 6 ? 2 : 1),
        "card"
      );
    }

    return checkHand(hand, "Score");
  }

  function checkHand(hand: Array<Card>, label: string): number {
    const scoreToDisplay = calculatePoints(hand);
    showPoints(label, scoreToDisplay);
    return scoreToDisplay;
  }

  function showPoints(label: string, scoreToDisplay: number): void {
    const text = `${label}: ${scoreToDisplay}`;
    if (label === "Score") score.text = text;
    else if (label === "Dealer") dealerScore.text = text;
  }

  function calculatePoints(hand: Array<Card>): number {
    // aces can be worth either 1 or 11 so we need to keep track of them
    let aceCount: number = 0;

    let score: number = hand.reduce((total, card) => {
      if (card.points === 1) aceCount++;
      return total + card.points;
    }, 0);

    let scoreToDisplay: number = score + aceCount * 10;

    while (scoreToDisplay !== score && scoreToDisplay > 21) {
      scoreToDisplay -= 10;
    }

    return scoreToDisplay;
  }

  function finishRound(result: Result): void {
    hit.paused = true;
    stand.paused = true;
    k.setCursor("default");

    const dealerScore: number = showDealerHand(dealerHand);

    if (result === Result.Bust) {
      message.text = "Bust :(";
      // lose bet
      return enableNextButton();
    }

    if (result === Result.Blackjack) {
      message.text = "Blackjack!";
      if (dealerScore === 21) {
        dealerMessage.text = "Tie.";
        // return bet
      } else {
        // payout big
      }
      return enableNextButton();
    }

    if (result === Result.Win) {
      message.text = "21!";
    }

    drawDealerCards(dealerScore);
  }

  function drawDealerCards(dealerScore: number): void {
    if (dealerScore > 16) {
      showResult(dealerScore);
      return enableNextButton();
    }

    k.wait(1, () => {
      dealerHand.push(dealCard(deck));
      drawDealerCards(showDealerHand(dealerHand));
    });
  }

  function showResult(dealerScore: number): void {
    const score: number = calculatePoints(hand);
    if (dealerScore > 21 || dealerScore < score) {
      dealerMessage.text = "You win!";
    } else if (dealerScore === score) {
      dealerMessage.text = "Tie.";
    } else {
      dealerMessage.text = "You lose.";
    }
  }

  function enableNextButton(): void {
    nextRound.hidden = false;
    nextRound.paused = false;
  }
});

k.go("game");
