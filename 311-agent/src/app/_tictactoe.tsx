"use client"
import { useState } from 'react';

// Type alias for the value of a square
type SquareValue = "X" | "O" | null;

function calculateWinner(squares: SquareValue[]): SquareValue {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function Square({ value, onSquareClick }: { value: SquareValue, onSquareClick: () => void }) {
  return (
    <button className='square' onClick={onSquareClick}>
      {value}
    </button>
  );
}

export function Board( { xIsNext, squares, onPlay} : { xIsNext:boolean, squares: SquareValue[], onPlay: (nextSquares: SquareValue[]) => void}) {
 


  function handleClick(i: number) {
    if (squares[i] || calculateWinner(squares)) { // Prevent click if square is filled or winner
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div> {/* Example of using winner/status */}
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

export default function Game() {
    const [xIsNext, setXIsNext] = useState<boolean>(true);
    const [history, setHistory] = useState([Array(9).fill(null)])
    const currentSquares = history[history.length - 1];

    function handlePlay(nextSquares : SquareValue[] ) {
        setHistory([...history, nextSquares]);
        setXIsNext(!xIsNext);
    }
    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}/>
            </div>
            <div className="game-info">

            </div>
        </div>
    )
}