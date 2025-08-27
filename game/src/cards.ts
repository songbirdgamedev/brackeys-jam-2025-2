const suits: Array<string> = ["hearts", "diamonds", "clubs", "spades"];
const values: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export type Card = {
  suit: number;
  value: number;
};

export function generateDeck(): Array<Card> {
  let deck = [];

  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < values.length; j++) {
      deck.push({
        suit: i,
        value: values[j],
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

export function dealCard(deck: Array<Card>) {
  return deck.pop();
}
