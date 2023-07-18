import React, { useEffect, useReducer, useRef } from "react";
import GameTable from "./components/GameTable";
import GameButtons from "./components/GameButtons";
import "./index.css";

const PLAYER = { player: "player", dealer: "dealer" };

const initialState = {
  deckId: null,
  playerHand: [],
  dealerHand: [],
  playerSum: {
    sum: 0,
    aces: 0,
  },
  dealerSum: {
    sum: 0,
    aces: 0,
  },
  winner: false,
  stand: false,
  gameOver: false,
};

function getSum(hand) {
  let sum = 0;
  let aces = 0;
  for (const card of hand) {
    if (card == "ACE") {
      aces += 1;
    } else {
      const num = parseInt(card);
      sum = num ? sum + num : sum + 10;
    }
  }
  if (aces >= 1) {
    if (sum >= 12 - aces) {
      sum = 1 * aces + sum;
    } else {
      sum = aces - 1 + 11 + sum;
    }
  }
  return [sum, aces];
}

function reducer(state, action) {
  const { type, payload } = action;
  switch (type) {
    case "setDeckId": {
      return { ...state, deckId: payload };
    }
    case "setPlayerHand": {
      const playerHand = [...state.playerHand, ...payload];
      const [sum, aces] = getSum(playerHand.map((c) => c.value));
      return { ...state, playerHand, playerSum: { sum, aces } };
    }
    case "setDealerHand": {
      const dealerHand = [...state.dealerHand, ...payload];
      const [sum, aces] = getSum(dealerHand.map((c) => c.value));
      return { ...state, dealerHand, dealerSum: { sum, aces } };
    }
    case "winner": {
      const { playerSum, dealerSum, stand } = state;
      const bust = playerSum.sum > 21;
      let gameOver = bust || dealerSum.sum == 21 || stand;
      if (
        (playerSum.sum == 21 && dealerSum.sum != 21) ||
        dealerSum.sum > 21 ||
        (playerSum.sum < 21 && playerSum.sum > dealerSum.sum)
      ) {
        gameOver = true;
        return { ...state, winner: true, gameOver };
      } else {
        return { ...state, winner: false, gameOver };
      }
    }
    case "stand": {
      return { ...state, stand: true };
    }
    case "restart": {
      return { ...initialState };
    }
    default:
  }
}

export default function BlackJack() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const deckIdFetched = useRef(false);
  const {
    deckId,
    dealerHand,
    dealerSum,
    playerHand,
    playerSum,
    winner,
    stand,
    gameOver,
  } = state;

  async function shuffle(deckCount) {
    const response = await fetch(
      `https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${deckCount}`
    );
    const result = await response.json();
    const { deck_id } = result;
    dispatch({
      type: "setDeckId",
      payload: deck_id,
    });
    return deck_id;
  }

  async function drawCards(count, deck_id, player) {
    const response = await fetch(
      `https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${count}`
    );
    const result = await response.json();
    const { cards } = result;
    if (player == PLAYER.player) {
      dispatch({
        type: "setPlayerHand",
        payload: cards,
      });
    } else {
      dispatch({
        type: "setDealerHand",
        payload: cards,
      });
    }
    return cards;
  }

  function checkForWinner() {
    dispatch({
      type: "winner",
    });
  }

  function startGame() {
    shuffle(1).then((deck) => {
      Promise.all([drawCards(2, deck, "player"), drawCards(2, deck, "dealer")]);
    });
  }

  function dealerPlays() {
    drawCards(1, deckId, "dealer");
  }

  function handleClickHit() {
    drawCards(1, deckId, "player");
  }

  function handleClickStand() {
    dispatch({
      type: "stand",
    });
  }

  function handleClickNew() {
    deckIdFetched.current = false;
    dispatch({
      type: "restart",
    });
  }

  useEffect(() => {
    if (stand) {
      if (dealerSum.sum < 17) {
        dealerPlays();
      } else {
        checkForWinner();
      }
    }
  }, [stand, dealerSum.sum]);

  useEffect(() => {
    if (deckIdFetched.current) return;
    deckIdFetched.current = true;
    startGame();
  }, [gameOver]);

  return (
    <div>
      <h1>BlackJack</h1>
      <GameTable
        dealerHand={dealerHand}
        dealerSum={dealerSum.sum}
        gameOver={gameOver}
        playerHand={playerHand}
        playerSum={playerSum.sum}
        winner={winner}
      />
      <GameButtons
        gameOver={gameOver}
        onClickHit={handleClickHit}
        onClickNew={handleClickNew}
        onClickStand={handleClickStand}
      />
    </div>
  );
}
