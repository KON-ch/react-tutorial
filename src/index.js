import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container)

const cols = 3
const rows = 3

function Square(props) {
  const backgroundColor = props.highLight ? { backgroundColor: 'yellow' } : {}

  return (
    <button className="square" onClick={props.onClick} style={backgroundColor}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare() {
    // [0, 1, 2]
    const rowsArray = Array(rows).fill(null).map((_, i) => i)

    return rowsArray.map((row) => {
      return (
        <div className="board-row" key={row}>
          { this.renderRow(row) }
        </div>
      );
    });
  }

  renderRow(row) {
    // [0, 1, 2] or [3, 4, 6] or [7, 8, 9]
    const colsArray = Array(cols).fill(null).map((_, i) => row * cols + i)

    return colsArray.map((col) => {
      return this.renderCol(col);
    });
  }

  renderCol(col) {
    const highLight = this.props.victoryRoad.includes(col)

    return (
      <Square
        value={this.props.squares[col]}
        onClick={() => this.props.onClick(col)}
        highLight={highLight}
        key={col}
      />
    );
  }

  render() {
    return (
      <div>
        { this.renderSquare() }
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(cols * rows).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      reverseSort: false,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        player: squares[i],
        row: (i / 3 | 0) + 1,
        col: i % 3 + 1,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  toggleSort() {
    this.setState({
      reverseSort: !this.state.reverseSort
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares).winner;
    const victoryRoad = calculateWinner(current.squares).line;

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';

      const player = history[move]['player']
      const col = history[move]['col']
      const row = history[move]['row']

      const postion = move ? `(player: ${player}, col: ${col}, row: ${row})` : ''
      const style = (this.state.stepNumber === move) ? { 'fontWeight': 'bold' } : {}

      return (
        <li key={move} style={style}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
          {postion}
        </li>
      )
    })

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (this.state.stepNumber === rows * cols) {
      status = '????????????'
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X': 'O');
    }

    const sort = this.state.reverseSort ? 'desc' : 'asc'

    return (
      <div className="game">
        <div className="game-board">
          <Board
          squares={current.squares}
          onClick={(i) => this.handleClick(i)}
          victoryRoad={victoryRoad}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.toggleSort()}>{sort}</button>
          <ol reversed={this.state.reverseSort}>
            {this.state.reverseSort ? moves.reverse() : moves}
          </ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return { winner: null, line: []};
}

// ========================================

root.render(<Game />);
