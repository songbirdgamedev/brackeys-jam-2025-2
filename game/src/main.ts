import { crew } from "@kaplayjs/crew";
import kaplay, { GameObj, AreaComp, TextComp } from "kaplay";
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
  debug: false,
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

// load music
k.loadMusic("music", "music/feels-good-david-renda.mp3");

// load sounds
k.loadSound("open", "sounds/cards-pack-open-2.ogg");
k.loadSound("deal", "sounds/card-place-1.ogg");
k.loadSound("card", "sounds/card-shove-3.ogg");
k.loadSound("flip", "sounds/card-slide-3.ogg");
k.loadSound("chip", "sounds/chip-lay-1.ogg");

k.scene("game", () => {
  // play music
  k.setVolume(0.6);
  const music = k.play("music");
  music.loop = true;
  music.volume = 0.2;
  music.seek(4.0);

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

  function makeButton(posY: number): GameObj<AreaComp> {
    return k.add([
      k.pos(k.width() - 100, posY),
      k.rect(112, 32, { radius: 4 }),
      k.area({ cursor: "pointer" }),
      k.anchor("center"),
      "button",
    ]);
  }

  function addButtonText(button: GameObj, text: string): GameObj<TextComp> {
    return button.add([
      k.text(text, { size: 16 }),
      k.color(0, 0, 0),
      k.anchor("center"),
      "text",
    ]);
  }

  function addText(
    posX: number,
    posY: number,
    text: string
  ): GameObj<TextComp> {
    return k.add([k.pos(posX, posY), k.text(text, { size: 16 }), "text"]);
  }

  function disableButton(button: GameObj): void {
    button.hidden = true;
    button.paused = true;
  }

  function enableButton(button: GameObj): void {
    button.hidden = false;
    button.paused = false;
  }

  // add buttons
  const hit = makeButton(k.height() / 2 + SPRITE_SIZE);
  const stand = makeButton(k.height() / 2 + SPRITE_SIZE * 2);
  const nextRound = makeButton(k.height() / 2 - SPRITE_SIZE * 2);
  const makeBet = makeButton(k.height() / 2 - SPRITE_SIZE);
  const start = makeButton(k.height() / 2);

  // add text to buttons
  addButtonText(hit, "Hit");
  addButtonText(stand, "Stand");
  addButtonText(nextRound, "Next");
  addButtonText(makeBet, "Bet $100");
  addButtonText(start, "Start");

  // reset cursor on hover end
  k.onHoverEnd("button", (): void => k.setCursor("default"));

  // add hit function
  hit.onClick((): void => {
    k.play("card");
    hand.push(dealCard(deck));
    const score: number = showHand(hand);
    if (score === 21) finishRound(Result.Win);
    else if (score > 21) finishRound(Result.Bust);
  });

  // add stand function
  stand.onClick((): void => {
    finishRound(Result.Hold);
  });

  // add next round function
  nextRound.onClick(resetRound);

  // add bet function
  makeBet.onClick((): void => {
    k.play("chip");
    currentMoney -= 100;
    currentBet += 100;

    updateMoney();

    if (currentMoney === 0) {
      disableButton(makeBet);
      k.setCursor("default");
    }
  });

  // add start function
  start.onClick(startRound);

  // add card deck sprite
  k.add([
    k.sprite("cards", { frame: CARD_BACK_FRAME }),
    k.pos(SPRITE_SIZE / 2, SPRITE_SIZE * 2),
  ]);

  // display scores
  const score = addText(SPRITE_SIZE / 2, k.height() - SPRITE_SIZE, "Score: 0");
  const dealerScore = addText(SPRITE_SIZE / 2, SPRITE_SIZE / 2, "Dealer: 0");

  // add messages to display win/lose state
  const message = addText(SPRITE_SIZE / 2, k.height() - SPRITE_SIZE * 1.5, "");
  const dealerMessage = addText(SPRITE_SIZE / 2, SPRITE_SIZE, "");

  // display current money
  const money = addText(SPRITE_SIZE / 2, k.height() - SPRITE_SIZE * 2, "$1000");

  // display bet amount
  const bet = addText(SPRITE_SIZE * 1.5, SPRITE_SIZE * 2.5, "");

  // initialise variables
  let deck: Array<Card>;
  let hand: Array<Card>;
  let dealerHand: Array<Card>;
  let currentMoney: number = 1000;
  let currentBet: number = 0;

  // start game
  resetRound();

  function resetRound(): void {
    // lose if no money
    if (currentMoney === 0) {
      music.stop();
      k.go("lose");
    }

    // play sound
    k.play("open");

    // show and enable bet and start buttons
    enableButton(makeBet);
    enableButton(start);

    // hide and disable unused buttons
    disableButton(nextRound);
    disableButton(hit);
    disableButton(stand);
    k.setCursor("default");

    // reset any messages
    message.text = "";
    dealerMessage.text = "";
    score.text = "Score: 0";
    dealerScore.text = "Dealer: 0";

    // reset hands
    hand = [];
    dealerHand = [];
    k.destroyAll("card");
    k.destroyAll("dealerCard");
  }

  function startRound(): void {
    // play sound
    k.play("deal");

    // hide and disable unused buttons
    disableButton(makeBet);
    disableButton(start);
    k.setCursor("default");

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

    // show and enable gameplay buttons
    enableButton(hit);
    enableButton(stand);

    // show hand and check result
    if (showHand(hand) === 21) {
      finishRound(Result.Blackjack);
    }
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
    //play sound
    k.play("flip");

    // disable buttons
    disableButton(hit);
    disableButton(stand);
    k.setCursor("default");

    const dealerScore: number = showDealerHand(dealerHand);

    if (result === Result.Bust) {
      message.text = "Bust :(";
      resolveBet(0);
      return enableButton(nextRound);
    }

    if (result === Result.Blackjack) {
      message.text = "Blackjack!";
      if (dealerScore === 21) {
        dealerMessage.text = "Tie.";
        resolveBet(1);
      } else {
        resolveBet(3);
      }
      return enableButton(nextRound);
    }

    if (result === Result.Win) {
      message.text = "21!";
    }

    drawDealerCards(dealerScore);
  }

  function drawDealerCards(dealerScore: number): void {
    if (dealerScore > 16) {
      showResult(dealerScore);
      return enableButton(nextRound);
    }

    k.wait(1, () => {
      k.play("flip");
      dealerHand.push(dealCard(deck));
      drawDealerCards(showDealerHand(dealerHand));
    });
  }

  function showResult(dealerScore: number): void {
    const score: number = calculatePoints(hand);
    if (dealerScore > 21 || dealerScore < score) {
      dealerMessage.text = "You win!";
      resolveBet(2);
    } else if (dealerScore === score) {
      dealerMessage.text = "Tie.";
      resolveBet(1);
    } else {
      dealerMessage.text = "You lose.";
      resolveBet(0);
    }
  }

  function updateMoney(): void {
    money.text = `$${currentMoney}`;
    bet.text = currentBet === 0 ? "" : `$${currentBet}`;
  }

  function resolveBet(multiplier: number): void {
    currentMoney += currentBet * multiplier;
    currentBet = 0;
    updateMoney();
  }
});

k.scene("lose", () => {
  k.add([
    k.pos(k.width() / 2, k.height() / 2),
    k.text("You're all out of money.\n\nClick anywhere to play again!", {
      size: 16,
    }),
    k.anchor("center"),
  ]);

  k.onClick((): void => k.go("game"));
});

k.go("game");
