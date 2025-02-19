class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        this.scoreElement = document.getElementById('score');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gameOverElement = document.getElementById('gameOver');

        // Load assets
        this.foodImage = new Image();
        this.foodImage.src = 'images/apple.png';
        this.eatSound = new Audio('sounds/eatFood.mp3');
        this.gameOverSound = new Audio('sounds/gameOver.mp3');

        // Set initial canvas size
        this.updateCanvasSize();

        // Add resize event listener
        window.addEventListener('resize', () => this.updateCanvasSize());

        // Game settings
        this.gridSize = Math.floor(Math.min(this.canvas.width, this.canvas.height) / 20);
        this.snake = [];
        this.food = {};
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameLoop = null;
        this.speeds = {
            easy: 150,
            medium: 100,
            hard: 70
        };
        this.currentDifficulty = 'easy';

        // Initialize event listeners
        this.initEventListeners();
    }

    updateCanvasSize() {
        const maxWidth = Math.min(600, window.innerWidth * 0.9);
        const maxHeight = Math.min(400, window.innerHeight * 0.6);
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        this.gridSize = Math.floor(Math.min(maxWidth, maxHeight) / 20);
    }

    initEventListeners() {
        // Control buttons
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.startGame());

        // Difficulty buttons
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDifficulty = btn.dataset.value;
            });
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Touch controls
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0 && this.direction !== 'left') this.nextDirection = 'right';
                else if (deltaX < 0 && this.direction !== 'right') this.nextDirection = 'left';
            } else {
                if (deltaY > 0 && this.direction !== 'up') this.nextDirection = 'down';
                else if (deltaY < 0 && this.direction !== 'down') this.nextDirection = 'up';
            }
        });
    }

    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowUp':
                if (this.direction !== 'down') this.nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (this.direction !== 'up') this.nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (this.direction !== 'right') this.nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (this.direction !== 'left') this.nextDirection = 'right';
                break;
                case 'w':
                    if (this.direction !== 'down') this.nextDirection = 'up';
                    break;
                case 's':
                    if (this.direction !== 'up') this.nextDirection = 'down';
                    break;
                case 'a':
                    if (this.direction !== 'right') this.nextDirection = 'left';
                    break;
                case 'd':
                    if (this.direction !== 'left') this.nextDirection = 'right';
                    break;
        }
    }

    startGame() {
        // Reset game state
        this.snake = [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
            { x: 3, y: 5 }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.gameOverElement.classList.add('hidden');
        
        // Clear existing game loop
        if (this.gameLoop) clearInterval(this.gameLoop);
        
        // Generate initial food
        this.generateFood();
        
        // Start game loop with current difficulty
        const speed = this.speeds[this.currentDifficulty];
        this.gameLoop = setInterval(() => this.update(), speed);
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        this.food = { x, y };
    }

    update() {
        // Update snake direction
        this.direction = this.nextDirection;

        // Calculate new head position
        const head = { ...this.snake[0] };
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check for collisions
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        // Add new head
        this.snake.unshift(head);

        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.eatSound.play();
            this.generateFood();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    
    checkCollision(head) {
        // Wall collision
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            return true;
        }

        // Self collision
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('hidden');
        this.gameOverSound.play();
    }

    draw() {
        // Clear canvas with a dark modern background
        this.ctx.fillStyle = 'rgba(10, 10, 20, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
        // Draw subtle glowing grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
    
        for (let x = 0; x < this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    
        for (let y = 0; y < this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    
        // Draw the snake with rounded square body parts
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const radius = 8; // Rounded corners
    
            // Head & body color settings
            let color1, color2;
            if (index === 0) {
                // Head color
                color1 = '#4FC3F7'; // Light blue
                color2 = '#0288D1'; // Darker blue
            } else {
                // Body gradient (greenish)
                color1 = '#4CAF50'; // Bright green
                color2 = '#2E7D32'; // Dark green
            }
    
            // Create a linear gradient for a modern look
            const gradient = this.ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
    
            this.ctx.fillStyle = gradient;
            this.ctx.shadowColor = index === 0 ? '#4FC3F7' : '#4CAF50';
            this.ctx.shadowBlur = index === 0 ? 20 : 10;
    
            // Draw rounded rectangle
            this.ctx.beginPath();
            this.roundRect(x, y, this.gridSize, this.gridSize, radius);
            this.ctx.fill();
    
            // Reset shadow
            this.ctx.shadowBlur = 0;
    
            // Draw eyes for the head
            if (index === 0) {
                this.ctx.fillStyle = '#FFF'; // White eyes
                const eyeSize = this.gridSize / 6;
                const eyeOffsetX = this.gridSize / 3;
                const eyeOffsetY = this.gridSize / 4;
    
                this.ctx.beginPath();
                this.ctx.arc(x + eyeOffsetX, y + eyeOffsetY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
    
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize - eyeOffsetX, y + eyeOffsetY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    
        // Draw food with a glowing effect
        this.ctx.shadowColor = '#FF5252';
        this.ctx.shadowBlur = 25;
        this.ctx.drawImage(
            this.foodImage,
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize,
            this.gridSize
        );
        this.ctx.shadowBlur = 0;
    }
    
    // Helper function to draw a rounded rectangle
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    
}

// Initialize game when window loads
window.onload = () => {
    new SnakeGame();
};