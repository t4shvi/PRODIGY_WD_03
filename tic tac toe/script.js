const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const pvpBtn = document.getElementById('pvp-btn');
const pvaiBtn = document.getElementById('pvai-btn');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const closeModalBtn = document.getElementById('close-modal');
const switchModeBtn = document.getElementById('switch-mode-btn');
const setupModal = document.getElementById('setup-modal');
const player1Name = document.getElementById('player1-name');
const player1ShapeSquare = document.getElementById('player1-shape-square');
const player2Setup = document.getElementById('player2-setup');
const player2Name = document.getElementById('player2-name');
const player2ShapeSquare = document.getElementById('player2-shape-square');
const startGameBtn = document.getElementById('start-game-btn');

let gameState = Array(9).fill(null);
let playerNames = ['', ''];
let playerSymbols = ['', '']; // 'heart' or 'star'
let currentPlayer = 1; // 1 or 2
let gameMode = null; // 'pvp' or 'pvai'
let gameActive = false;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

pvpBtn.addEventListener('click', () => showSetup('pvp'));
pvaiBtn.addEventListener('click', () => showSetup('pvai'));
resetBtn.addEventListener('click', resetGame);
closeModalBtn.addEventListener('click', resetGame);
switchModeBtn.addEventListener('click', switchMode);
startGameBtn.addEventListener('click', startActualGame);

player1ShapeSquare.addEventListener('click', () => toggleShape(player1ShapeSquare));
player2ShapeSquare.addEventListener('click', () => toggleShape(player2ShapeSquare));

function toggleShape(square) {
    const isPlayer1 = square.id === 'player1-shape-square';
    const otherSquare = isPlayer1 ? player2ShapeSquare : player1ShapeSquare;
    const newShape = square.getAttribute('data-shape') === 'heart' ? 'star' : 'heart';
    setShapeSquare(square, newShape);
    const otherShape = newShape === 'heart' ? 'star' : 'heart';
    setShapeSquare(otherSquare, otherShape);
}

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

function showSetup(mode) {
    gameMode = mode;
    if (mode === 'pvp') {
        player2Setup.style.display = 'flex';
        player2Name.readOnly = false;
        player2Name.value = 'Player 2';
    } else {
        player2Setup.style.display = 'flex';
        player2Name.readOnly = true;
        player2Name.value = 'Bot';
    }
    const savedNames = localStorage.getItem('ticTacToeNames');
    const savedShapes = localStorage.getItem('ticTacToeShapes');
    if (mode === 'pvp' && savedNames) {
        const names = JSON.parse(savedNames);
        player1Name.value = names[0] || 'Player 1';
        player2Name.value = (names[1] && names[1] !== 'Bot') ? names[1] : 'Player 2';
    } else {
        player1Name.value = 'Player 1';
        if (mode === 'pvp') {
            player2Name.value = 'Player 2';
        }
    }
    if (savedShapes) {
        const shapes = JSON.parse(savedShapes);
        setShapeSquare(player1ShapeSquare, shapes[0] || 'heart');
        setShapeSquare(player2ShapeSquare, shapes[1] || 'star');
    } else {
        setShapeSquare(player1ShapeSquare, 'heart');
        setShapeSquare(player2ShapeSquare, 'star');
    }
    setupModal.style.display = 'block';
}

function setShapeSquare(square, shape) {
    square.setAttribute('data-shape', shape);
    square.textContent = shape === 'heart' ? '♥' : '★';
    square.style.backgroundColor = shape === 'heart' ? '#e89ec8' : '#d9c875';
    square.style.color = shape === 'heart' ? '#910a57' : '#ab8e00';
}

function startActualGame() {
    playerNames[0] = player1Name.value || 'Player 1';
    playerSymbols[0] = player1ShapeSquare.getAttribute('data-shape');
    playerNames[1] = player2Name.value || (gameMode === 'pvp' ? 'Player 2' : 'Bot');
    playerSymbols[1] = player2ShapeSquare.getAttribute('data-shape');
    localStorage.setItem('ticTacToeNames', JSON.stringify(playerNames));
    localStorage.setItem('ticTacToeShapes', JSON.stringify(playerSymbols));

    gameActive = true;
    gameState = Array(9).fill(null);
    currentPlayer = 1;
    status.textContent = `${playerNames[0]}'s turn`;
    board.style.display = 'grid';
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('heart', 'star');
    });
    resetBtn.style.display = 'none';
    modal.style.display = 'none';
    setupModal.style.display = 'none';
    pvpBtn.style.display = 'none';
    pvaiBtn.style.display = 'none';
    switchModeBtn.style.display = 'inline-block';
    switchModeBtn.textContent = gameMode === 'pvp' ? 'Switch to Player vs Bot' : 'Switch to Player vs Player';
}

function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (!gameActive || gameState[index] !== null) return;

    makeMove(index);

    if (gameMode === 'pvai' && currentPlayer === 2 && gameActive) {
        setTimeout(aiMove, 500);
    }
}

function makeMove(index) {
    gameState[index] = playerSymbols[currentPlayer - 1];
    cells[index].textContent = playerSymbols[currentPlayer - 1] === 'heart' ? '♥' : '★';
    cells[index].classList.add(playerSymbols[currentPlayer - 1]);

    if (checkWin()) {
        modalMessage.textContent = `${playerNames[currentPlayer - 1]} wins!`;
        modal.style.display = 'block';
        modalMessage.parentElement.classList.add(playerSymbols[currentPlayer - 1] + '-win');
        gameActive = false;
        return;
    }

    if (checkDraw()) {
        status.textContent = 'It\'s a draw!';
        gameActive = false;
        resetBtn.style.display = 'block';
        return;
    }

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    status.textContent = `${playerNames[currentPlayer - 1]}'s turn`;
}

function checkWin() {
    return winningConditions.some(condition => {
        return condition.every(index => gameState[index] === playerSymbols[currentPlayer - 1]);
    });
}

function checkDraw() {
    return gameState.every(cell => cell !== null);
}

function aiMove() {
    const emptyCells = gameState.map((cell, index) => cell === null ? index : null).filter(index => index !== null);
    if (emptyCells.length === 0) return;

    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    makeMove(randomIndex);
}

function switchMode() {
    const newMode = gameMode === 'pvp' ? 'pvai' : 'pvp';
    board.style.display = 'none';
    showSetup(newMode);
}

function resetGame() {
    gameState = Array(9).fill(null);
    currentPlayer = 1;
    gameActive = true;
    status.textContent = `${playerNames[0]}'s turn`;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('heart', 'star');
    });
    resetBtn.style.display = 'none';
    modal.style.display = 'none';
    modalMessage.parentElement.classList.remove('heart-win', 'star-win');
    switchModeBtn.textContent = gameMode === 'pvp' ? 'Switch to Player vs Bot' : 'Switch to Player vs Player';
}