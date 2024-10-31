import { backend } from 'declarations/backend';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const startButton = document.getElementById('start-button');
const highScoresList = document.getElementById('high-scores');

let board = [];
let currentPiece;
let score = 0;
let level = 1;
let gameInterval;
let gameOver = false;

const tetrominoes = [
    { shape: [[1, 1], [1, 1]], className: 'castle-wall' },
    { shape: [[1, 1, 1, 1]], className: 'tower' },
    { shape: [[1, 1, 1], [0, 1, 0]], className: 'shield' },
    { shape: [[1, 1, 0], [0, 1, 1]], className: 'sword' },
    { shape: [[0, 1, 1], [1, 1, 0]], className: 'sword' },
    { shape: [[1, 1, 1], [1, 0, 0]], className: 'shield' },
    { shape: [[1, 1, 1], [0, 0, 1]], className: 'shield' }
];

function createBoard() {
    gameBoard.innerHTML = ''; // Clear the game board
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        board[y] = [];
        for (let x = 0; x < BOARD_WIDTH; x++) {
            board[y][x] = 0;
            const block = document.createElement('div');
            block.style.width = `${BLOCK_SIZE}px`;
            block.style.height = `${BLOCK_SIZE}px`;
            gameBoard.appendChild(block);
        }
    }
}

function drawBoard() {
    let blocks = gameBoard.getElementsByTagName('div');
    let index = 0;
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                blocks[index].className = `tetromino ${board[y][x]}`;
            } else {
                blocks[index].className = '';
            }
            index++;
        }
    }
}

function createPiece() {
    const piece = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    return {
        shape: piece.shape,
        className: piece.className,
        x: Math.floor(BOARD_WIDTH / 2) - Math.ceil(piece.shape[0].length / 2),
        y: 0
    };
}

function drawPiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                let block = gameBoard.children[(currentPiece.y + y) * BOARD_WIDTH + (currentPiece.x + x)];
                block.className = `tetromino ${currentPiece.className}`;
            }
        });
    });
}

function erasePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                let block = gameBoard.children[(currentPiece.y + y) * BOARD_WIDTH + (currentPiece.x + x)];
                block.className = '';
            }
        });
    });
}

function canMoveTo(newX, newY, newShape) {
    for (let y = 0; y < newShape.length; y++) {
        for (let x = 0; x < newShape[y].length; x++) {
            if (newShape[y][x]) {
                if (newY + y >= BOARD_HEIGHT || newX + x < 0 || newX + x >= BOARD_WIDTH || board[newY + y][newX + x]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function rotatePiece() {
    let newShape = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i]).reverse());
    if (canMoveTo(currentPiece.x, currentPiece.y, newShape)) {
        erasePiece();
        currentPiece.shape = newShape;
        drawPiece();
    }
}

function movePiece(dx, dy) {
    if (canMoveTo(currentPiece.x + dx, currentPiece.y + dy, currentPiece.shape)) {
        erasePiece();
        currentPiece.x += dx;
        currentPiece.y += dy;
        drawPiece();
        return true;
    }
    return false;
}

function dropPiece() {
    if (!movePiece(0, 1)) {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    board[currentPiece.y + y][currentPiece.x + x] = currentPiece.className;
                }
            });
        });
        clearLines();
        currentPiece = createPiece();
        if (!canMoveTo(currentPiece.x, currentPiece.y, currentPiece.shape)) {
            gameOver = true;
            clearInterval(gameInterval);
            alert('Game Over!');
            saveHighScore();
        }
    }
}

function clearLines() {
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(new Array(BOARD_WIDTH).fill(0));
            score += 100;
            if (score % 1000 === 0) {
                level++;
                clearInterval(gameInterval);
                gameInterval = setInterval(update, 1000 - (level * 50));
            }
        }
    }
    scoreDisplay.textContent = `Score: ${score}`;
    levelDisplay.textContent = `Level: ${level}`;
}

function update() {
    dropPiece();
    drawBoard();
}

function startGame() {
    console.log("Starting game..."); // Debug log
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameBoard.innerHTML = '';
    board = [];
    score = 0;
    level = 1;
    gameOver = false;
    createBoard();
    currentPiece = createPiece();
    drawPiece(); // Draw the initial piece
    gameInterval = setInterval(update, 1000);
    scoreDisplay.textContent = 'Score: 0';
    levelDisplay.textContent = 'Level: 1';
    drawBoard();
    console.log("Game started!"); // Debug log
    gameBoard.focus(); // Focus on the game board
}

async function saveHighScore() {
    try {
        await backend.saveHighScore(score);
        loadHighScores();
    } catch (error) {
        console.error('Error saving high score:', error);
    }
}

async function loadHighScores() {
    try {
        const highScores = await backend.getHighScores();
        highScoresList.innerHTML = '';
        highScores.forEach((score, index) => {
            const li = document.createElement('li');
            li.textContent = `#${index + 1}: ${score}`;
            highScoresList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading high scores:', error);
    }
}

document.addEventListener('keydown', (e) => {
    if (!gameOver) {
        switch (e.key) {
            case 'ArrowLeft':
                movePiece(-1, 0);
                break;
            case 'ArrowRight':
                movePiece(1, 0);
                break;
            case 'ArrowDown':
                movePiece(0, 1);
                break;
            case 'ArrowUp':
                rotatePiece();
                break;
        }
    }
});

startButton.addEventListener('click', startGame);

loadHighScores();
