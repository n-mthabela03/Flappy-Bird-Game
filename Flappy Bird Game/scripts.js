// DOM element references
const bird = document.getElementById('bird');
const gameContainer = document.getElementById('gameContainer');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const finalScoreElement = document.getElementById('finalScore');

// Game state variables
let gameRunning = false;
let gameStarted = false;
let birdY = 250;
let birdVelocity = 0;
let score = 0;
let pipes = [];
let gameSpeed = 2;
let lastPipeTime = 0;
let animationId;

// Constants
const gravity = 0.6;
const jumpPower = -12;
const pipeWidth = 60;
const pipeGap = 180;
const gameHeight = 600;
const gameWidth = 400;

// Start the game
function startGame() {
    gameRunning = true;
    gameStarted = true;
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    resetGame();
    gameLoop();
}

// Reset bird and pipes
function resetGame() {
    birdY = 250;
    birdVelocity = 0;
    score = 0;
    pipes = [];
    lastPipeTime = 0;
    updateScore();
    updateBirdPosition();
    document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());
}

// Update bird's position on screen
function updateBirdPosition() {
    bird.style.top = birdY + 'px';
    const rotation = Math.min(Math.max(birdVelocity * 3, -30), 30);
    bird.style.transform = `rotate(${rotation}deg)`;
}

// Update score text
function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

// Create a new pair of pipes
function createPipe() {
    const pipeHeight = Math.random() * (gameHeight - pipeGap - 100) + 50;

    const topPipe = document.createElement('div');
    topPipe.className = 'pipe pipe-top';
    topPipe.style.left = gameWidth + 'px';
    topPipe.style.height = pipeHeight + 'px';
    topPipe.style.width = pipeWidth + 'px';

    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe pipe-bottom';
    bottomPipe.style.left = gameWidth + 'px';
    bottomPipe.style.height = (gameHeight - pipeHeight - pipeGap) + 'px';
    bottomPipe.style.width = pipeWidth + 'px';

    gameContainer.appendChild(topPipe);
    gameContainer.appendChild(bottomPipe);

    pipes.push({ top: topPipe, bottom: bottomPipe, x: gameWidth, passed: false });
}

// Move pipes and check for score
function updatePipes() {
    pipes.forEach((pipe, index) => {
        pipe.x -= gameSpeed;
        pipe.top.style.left = pipe.x + 'px';
        pipe.bottom.style.left = pipe.x + 'px';

        if (!pipe.passed && pipe.x + pipeWidth < 50) {
            pipe.passed = true;
            score++;
            updateScore();
        }

        if (pipe.x + pipeWidth < 0) {
            pipe.top.remove();
            pipe.bottom.remove();
            pipes.splice(index, 1);
        }
    });
}

// Check for collisions with pipes or ground/ceiling
function checkCollisions() {
    const birdRect = { x: 50, y: birdY, width: 40, height: 30 };

    if (birdY <= 0 || birdY + 30 >= gameHeight) return true;

    for (let pipe of pipes) {
        const pipeX = pipe.x;
        const topHeight = parseInt(pipe.top.style.height);
        const bottomHeight = parseInt(pipe.bottom.style.height);

        if (
            birdRect.x < pipeX + pipeWidth &&
            birdRect.x + birdRect.width > pipeX &&
            (birdRect.y < topHeight || birdRect.y + birdRect.height > gameHeight - bottomHeight)
        ) {
            return true;
        }
    }

    return false;
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;

    birdVelocity += gravity;
    birdY += birdVelocity;

    updateBirdPosition();
    updatePipes();

    const currentTime = Date.now();
    if (currentTime - lastPipeTime > 1500) {
        createPipe();
        lastPipeTime = currentTime;
    }

    if (checkCollisions()) {
        gameOver();
        return;
    }

    animationId = requestAnimationFrame(gameLoop);
}

// End game and show score
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
}

// Restart game
function restartGame() {
    startGame();
}

// Bird flap or start
function jump() {
    if (gameRunning) {
        birdVelocity = jumpPower;
    } else if (!gameStarted) {
        startGame();
    }
}

// Event listeners for input
document.addEventListener('keydown', e => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

gameContainer.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') {
        jump();
    }
});

gameContainer.addEventListener('touchstart', e => {
    if (e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        jump();
    }
});

// Prevent scrolling on mobile
document.addEventListener('touchmove', e => {
    e.preventDefault();
}, { passive: false });

// Initial setup
updateBirdPosition();
updateScore();
