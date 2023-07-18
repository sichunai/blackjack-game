import React from "react";
import "./styles.css";

export default function TableArea(props) {
  const { dealerHand, dealerSum, gameOver, playerHand, playerSum, winner } =
    props;
  return (
    <div className="game-container">
      <div id="dealerHand">
        <h2> Dealer's Hand: {dealerSum}</h2>
        {dealerHand.map((card, index) => {
          return <img src={card.image} key={index} />;
        })}
      </div>
      <h2 id="winMessage" className="winner-message">
        {gameOver && winner && "Player wins"}
        {gameOver && !winner && "Dealer wins"}
      </h2>
      <div id="playerHand">
        <h2> Player's Hand: {playerSum}</h2>
        <div className="bust-message"> {playerSum > 21 && "Bust"}</div>
        {playerHand.map((card, index) => {
          return <img src={card.image} key={index} />;
        })}
      </div>
    </div>
  );
}
