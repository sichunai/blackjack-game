import React from "react";
import "./styles.css";

export default function ButtonArea(props) {
  const { gameOver, onClickHit, onClickNew, onClickStand } = props;
  return (
    <div id="gameActions" className="game-buttons-container">
      {!gameOver ? (
        <div>
          <button onClick={() => onClickHit()}>Hit</button>
          <button onClick={() => onClickStand()}>Stand</button>
        </div>
      ) : (
        <button onClick={() => onClickNew()}>New game</button>
      )}
    </div>
  );
}
