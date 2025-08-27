const suits: Array<string> = ["hearts", "diamonds", "clubs", "spades"];
const values: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

type Card = {
  suit: string;
  value: number;
};

function generateDeck(): Array<Card> {
  let deck = [];

  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < values.length; j++) {
      deck.push({
        suit: suits[i],
        value: values[j],
      });
    }
  }

  return deck;
}

function shuffleDeck(deck: Array<Card>): void {
  // swap cards 1000 times
  for (let i = 0; i < 1000; i++) {
    const index1 = Math.floor(Math.random() * deck.length);
    const index2 = Math.floor(Math.random() * deck.length);
    [deck[index1], deck[index2]] = [deck[index2], deck[index1]];
  }
}

function dealCard(deck: Array<Card>) {
  return deck.pop();
}
