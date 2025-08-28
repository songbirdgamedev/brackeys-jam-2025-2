const suits: Array<string> = ["hearts", "diamonds", "clubs", "spades"];
const values: Array<string> = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export type Card = {
  suit: string;
  value: string;
  points: number;
  frame: number;
};

export function generateDeck(): Array<Card> {
  let deck = [];

  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < values.length; j++) {
      deck.push({
        suit: suits[i],
        value: values[j],
        points: j < 10 ? j + 1 : 10,
        frame: j + i * 14,
      });
    }
  }

  return deck;
}

export function shuffleDeck(deck: Array<Card>): void {
  // swap cards 1000 times
  for (let i = 0; i < 1000; i++) {
    const index1 = Math.floor(Math.random() * deck.length);
    const index2 = Math.floor(Math.random() * deck.length);
    [deck[index1], deck[index2]] = [deck[index2], deck[index1]];
  }
}

export function dealCard(deck: Array<Card>): Card {
  return deck.pop();
}
