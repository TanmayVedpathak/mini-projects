import { useState } from "react";
import Square from "./Square";
import type { Player, SquareValue } from "../type";

function getRandomPlayer(): Player {
  return Math.random() < 0.5 ? "X" : "O";
}

function calculateWinner(squares: SquareValue[]) {
  const winningPattern = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < winningPattern.length; i++) {
    const [a, b, c] = winningPattern[i];

    if (squares[a] && squares[a] === squares[b] && squares[b] === squares[c]) {
      return squares[a];
    }
  }

  return null;
}

const Board = () => {
  const [squares, setSquares] = useState<SquareValue[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(() => getRandomPlayer());

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every(Boolean);
  const gameOver = Boolean(winner) || isDraw;

  const handleClick = (index: number) => {
    if (squares[index] || gameOver) return;

    const newArr: SquareValue[] = [...squares];
    newArr[index] = currentPlayer;

    setSquares(newArr);
    setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
  };

  const handleReset = () => {
    setSquares(Array(9).fill(null));
    setCurrentPlayer(() => getRandomPlayer());
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {winner ? <h1>{winner} won</h1> : isDraw ? <h1>Game draw</h1> : <h1>Hey {currentPlayer}, its your turn</h1>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 80px)",
          gridTemplateRows: "repeat(3, 80px)",
          gap: "10px",
        }}
      >
        {squares.map((ele, index) => (
          <Square key={index} value={ele} winner={gameOver ? winner || "Both" : null} onClick={() => handleClick(index)} />
        ))}
      </div>

      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default Board;
