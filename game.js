// Canvas and Context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const game = {
    started: false,
    playerScore: 0,
    computerScore: 0
};

const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

// Player (Left Paddle)
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

// Computer (Right Paddle)
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    speed: 5,
    maxSpeed: 8,
    size: ballSize
};

// Keyboard and Mouse Controls
const keys = {};
let mouseY = canvas.height / 2;

// Keyboard events
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;

    // Start game with Space
    if (e.key === ' ') {
        e.preventDefault();
        if (!game.started) {
            startGame();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Mouse movement for paddle control
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Start Game
function startGame() {
    game.started = true;
    resetBall();
    document.getElementById('status').textContent = 'Game Running';
}

// Reset Ball to Center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed * 2;
}

// Update Player Position
function updatePlayer() {
    // Arrow keys control
    if (keys['arrowup'] || keys['w']) {
        player.dy = -player.speed;
    } else if (keys['arrowdown'] || keys['s']) {
        player.dy = player.speed;
    } else {
        player.dy = 0;
    }

    // Mouse control (smoother)
    const centerY = player.y + paddleHeight / 2;
    const difference = mouseY - centerY;

    if (Math.abs(difference) > 5) {
        player.dy = difference > 0 ? player.speed : -player.speed;
    } else {
        player.dy = 0;
    }

    player.y += player.dy;

    // Boundary collision for player
    if (player.y < 0) {
        player.y = 0;
    } else if (player.y + paddleHeight > canvas.height) {
        player.y = canvas.height - paddleHeight;
    }
}

// Update Computer Position (AI)
function updateComputer() {
    const computerCenter = computer.y + paddleHeight / 2;
    const difference = ball.y - computerCenter;

    // AI difficulty: follows ball with some smoothness
    if (Math.abs(difference) > 15) {
        computer.dy = difference > 0 ? computer.speed : -computer.speed;
    } else {
        computer.dy = difference * 0.1;
    }

    computer.y += computer.dy;

    // Boundary collision for computer
    if (computer.y < 0) {
        computer.y = 0;
    } else if (computer.y + paddleHeight > canvas.height) {
        computer.y = canvas.height - paddleHeight;
    }
}

// Update Ball Position
function updateBall() {
    if (!game.started) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.size < 0 ? ball.size : canvas.height - ball.size;
    }

    // Ball collision with paddles
    // Player paddle collision
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + paddleHeight &&
        ball.dx < 0
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;

        // Add spin based on paddle movement
        const collidePoint = ball.y - (player.y + paddleHeight / 2);
        collidePoint / (paddleHeight / 2);
        ball.dy = collidePoint * 5;
        
        // Increase ball speed slightly (up to maxSpeed)
        if (Math.abs(ball.dx) < ball.maxSpeed) {
            ball.dx *= 1.05;
        }
    }

    // Computer paddle collision
    if (
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + paddleHeight &&
        ball.dx > 0
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;

        // Add spin based on paddle movement
        const collidePoint = ball.y - (computer.y + paddleHeight / 2);
        collidePoint / (paddleHeight / 2);
        ball.dy = collidePoint * 5;
        
        // Increase ball speed slightly (up to maxSpeed)
        if (Math.abs(ball.dx) < ball.maxSpeed) {
            ball.dx *= 1.05;
        }
    }

    // Scoring
    if (ball.x - ball.size < 0) {
        game.computerScore++;
        document.getElementById('computerScore').textContent = game.computerScore;
        resetBall();
    } else if (ball.x + ball.size > canvas.width) {
        game.playerScore++;
        document.getElementById('playerScore').textContent = game.playerScore;
        resetBall();
    }
}

// Draw Functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'transparent';
}

function drawBall() {
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowColor = 'transparent';
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Draw paddles and ball
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
}

// Game Loop
function gameLoop() {
    if (game.started) {
        updatePlayer();
        updateComputer();
        updateBall();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
