const board = document.getElementById('board');
const statusDisplay = document.getElementById('status');
const modeSelect = document.getElementById('mode');
let cells = [], currentPlayer = 'X', gameActive = true;

function restartGame() {
  board.innerHTML = '';
  cells = [];
  gameActive = true;
  currentPlayer = 'X';
  statusDisplay.textContent = "Your turn!";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', onCellClick);
    board.appendChild(cell);
    cells.push('');
  }
}

function onCellClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || cells[index]) return;

  cells[index] = currentPlayer;
  e.target.textContent = currentPlayer;

  if (checkWinner()) {
    statusDisplay.textContent = `${currentPlayer} wins!`;
    gameActive = false;
    highlightWinningCells();
    return;
  }

  if (!cells.includes('')) {
    statusDisplay.textContent = "It's a draw!";
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusDisplay.textContent = `${currentPlayer}'s turn`;

  if (modeSelect.value !== 'human' && currentPlayer === 'O') {
    setTimeout(botMove, 500);
  }
}

function botMove() {
  const difficulty = modeSelect.value;
  let index;
  if (difficulty === 'easy') {
    const empty = cells.map((v, i) => v ? null : i).filter(v => v !== null);
    index = empty[Math.floor(Math.random() * empty.length)];
  } else if (difficulty === 'medium') {
    index = findWinningMove('O') || findWinningMove('X') || randomMove();
  } else {
    index = minimax(cells, 'O').index;
  }

  const cell = board.querySelector(`[data-index='${index}']`);
  if (cell) cell.click();
}

function findWinningMove(player) {
  const winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    const values = [cells[a], cells[b], cells[c]];
    if (values.filter(v => v === player).length === 2 && values.includes('')) {
      return pattern[values.indexOf('')];
    }
  }
  return null;
}

function minimax(newBoard, player) {
  const availSpots = newBoard.map((v, i) => v ? null : i).filter(v => v !== null);

  const winCheck = checkMinimaxWinner(newBoard);
  if (winCheck === 'X') return { score: -10 };
  if (winCheck === 'O') return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];
  for (let i of availSpots) {
    const move = { index: i };
    newBoard[i] = player;

    const result = minimax(newBoard, player === 'O' ? 'X' : 'O');
    move.score = result.score;

    newBoard[i] = '';
    moves.push(move);
  }

  const bestMove = moves.reduce((best, move) => {
    if ((player === 'O' && move.score > best.score) || 
        (player === 'X' && move.score < best.score)) {
      return move;
    }
    return best;
  }, moves[0]);

  return bestMove;
}

function checkMinimaxWinner(b) {
  const winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (let [a,b_,c] of winPatterns) {
    if (b[a] && b[a] === b[b_] && b[a] === b[c]) {
      return b[a];
    }
  }
  return null;
}

function checkWinner() {
  const winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return winPatterns.some(([a, b, c]) => {
    return cells[a] && cells[a] === cells[b] && cells[a] === cells[c];
  });
}

function highlightWinningCells() {
  const winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (let [a, b, c] of winPatterns) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      board.querySelector(`[data-index='${a}']`).classList.add('winning');
      board.querySelector(`[data-index='${b}']`).classList.add('winning');
      board.querySelector(`[data-index='${c}']`).classList.add('winning');
    }
  }
}

restartGame();
