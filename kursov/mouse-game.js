let currentScore2, targetTimeElement, elapsedTimeElement, startGameBtn2, restartGameBtn2;
let timer2, result2, resultTitle2, resultMessage2, nextRoundBtn2, restartRoundBtn2, gameCanvas;
let levelSelect2;

let canvas, ctx;
let gameState2 = 'idle';
let targetTime = 0;
let elapsedTime = 0;
let gameStartTime = 0;
let animationId = null;
let totalScore2 = 0;
let currentLevel2 = 1;
let pathPoints = [];
let mousePosition = { x: 50, y: 200 };
let isMouseOnPath = false;
let gameCompleted = false;
let completedLevels2 = new Set();
let currentMouseDifficulty = 'easy';

let timeOnPath = 0;
let timeOffPath = 0;
let maxOffPathTime = 2;
let isMouseOffPathTooLong = false;
const MIN_PATH_PERCENT = 0.85;

const mouseDifficulties = {
    easy: { 
        deviation: 1000,
        name: 'Легкая',
        className: 'easy-difficulty',
        pointsMultiplier: 1 
    },
    medium: { 
        deviation: 700,
        name: 'Средняя', 
        className: 'medium-difficulty',
        pointsMultiplier: 2 
    },
    hard: { 
        deviation: 300,
        name: 'Сложная',
        className: 'hard-difficulty', 
        pointsMultiplier: 3 
    }
};

const mouseLevels = {
    1: {
        name: 'Уровень 1 - Базовый',
        description: 'Проведите мышку по тропинке до норки',
        obstacles: [],
        targetTimeRange: { min: 3, max: 7 },
        basePoints: 100
    },
    2: {
        name: 'Уровень 2 - Движущиеся препятствия',
        description: 'Остерегайтесь одного движущегося препятствия',
        obstacles: ['moving'],
        movingCount: 1,
        targetTimeRange: { min: 4, max: 8 },
        basePoints: 200
    },
    3: {
        name: 'Уровень 3 - Больше движущихся препятствий', 
        description: 'Избегайте двух движущихся препятствий',
        obstacles: ['moving'],
        movingCount: 2,
        targetTimeRange: { min: 5, max: 9 },
        basePoints: 300
    },
    4: {
        name: 'Уровень 4 - Много движущихся препятствий',
        description: 'Остерегайтесь трех движущихся препятствий',
        obstacles: ['moving'],
        movingCount: 3,
        targetTimeRange: { min: 6, max: 10 },
        basePoints: 400
    }
};

let movingObstacles = [];

function initMouseGame() {
    currentScore2 = document.getElementById('currentScore2');
    targetTimeElement = document.getElementById('targetTime');
    elapsedTimeElement = document.getElementById('elapsedTime');
    startGameBtn2 = document.getElementById('startGameBtn2');
    restartGameBtn2 = document.getElementById('restartGameBtn2');
    timer2 = document.getElementById('timer2');
    result2 = document.getElementById('result2');
    resultTitle2 = document.getElementById('resultTitle2');
    resultMessage2 = document.getElementById('resultMessage2');
    nextRoundBtn2 = document.getElementById('nextRoundBtn2');
    restartRoundBtn2 = document.getElementById('restartRoundBtn2');
    gameCanvas = document.getElementById('gameCanvas');

    createLevelSelector();
    createDifficultySelector();

    if (gameCanvas) {
        canvas = gameCanvas;
        ctx = canvas.getContext('2d');
        
        generateRandomPath();
        generateObstacles();
        drawGame();
    }

    setupMouseEventListeners();
    updateGameInterface();
}

function createLevelSelector() {
    const levelInfoContainer = document.querySelector('.level-info-2');
    if (!levelInfoContainer) return;

    const levelSelectItem = document.createElement('div');
    levelSelectItem.className = 'level-info-item';
    levelSelectItem.innerHTML = 'Уровень: <select id="levelSelect2"><option value="1">Уровень 1</option><option value="2">Уровень 2</option><option value="3">Уровень 3</option><option value="4">Уровень 4</option></select>';
    
    levelInfoContainer.appendChild(levelSelectItem);
    
    levelSelect2 = document.getElementById('levelSelect2');
    
    recreateLevelSelectOptions2();
    
    levelSelect2.value = currentLevel2;
    levelSelect2.addEventListener('change', function() {
        const selectedLevel = parseInt(this.value);
        currentLevel2 = selectedLevel;
        resetMouseGame();
    });
}

function createDifficultySelector() {
    const levelInfoContainer = document.querySelector('.level-info-2');
    if (!levelInfoContainer) return;

    const difficultySelectItem = document.createElement('div');
    difficultySelectItem.className = 'level-info-item';
    difficultySelectItem.innerHTML = 'Сложность: <select id="difficultySelect2"><option value="easy">Легкая (1 сек)</option><option value="medium">Средняя (0.7 сек)</option><option value="hard">Сложная (0.3 сек)</option></select>';
    
    levelInfoContainer.appendChild(difficultySelectItem);
    
    const difficultySelect2 = document.getElementById('difficultySelect2');
    difficultySelect2.value = currentMouseDifficulty;
    difficultySelect2.addEventListener('change', function() {
        currentMouseDifficulty = this.value;
    });
}

function recreateLevelSelectOptions2() {
    if (!levelSelect2) return;
    
    levelSelect2.innerHTML = '';
    
    for (let i = 1; i <= 4; i++) {
        const option = document.createElement('option');
        option.value = i;
        
        option.disabled = false;
        if (completedLevels2.has(i)) {
            option.textContent = 'Уровень ' + i + ' ✓';
        } else {
            option.textContent = 'Уровень ' + i;
        }
        
        levelSelect2.appendChild(option);
    }
    
    levelSelect2.value = currentLevel2;
}

function updateLevelSelectOptions() {
    if (!levelSelect2) return;
    recreateLevelSelectOptions2();
}

function setupMouseEventListeners() {
    startGameBtn2.addEventListener('click', startGame2);
    restartGameBtn2.addEventListener('click', restartGame2);
    nextRoundBtn2.addEventListener('click', nextRound2);
    restartRoundBtn2.addEventListener('click', restartRound2);
    
    if (gameCanvas) {
        gameCanvas.addEventListener('mousemove', handleMouseMove);
        gameCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    }
}

function updateGameInterface() {
    const levelConfig = mouseLevels[currentLevel2];
    
    const levelDescription2 = document.getElementById('levelDescription2');
    if (levelDescription2) {
        levelDescription2.textContent = levelConfig.description;
    }
    
    timer2.textContent = 'Нажмите "Начать игру"';
    targetTimeElement.textContent = '0';
    startGameBtn2.style.display = 'inline-block';
    restartGameBtn2.style.display = 'none';
    result2.style.display = 'none';
    
    gameState2 = 'idle';
    gameCompleted = false;
    
    if (elapsedTimeElement && elapsedTimeElement.parentElement) {
        elapsedTimeElement.parentElement.style.display = 'none';
    }
    
    if (currentLevel2 < 4 && completedLevels2.has(currentLevel2)) {
        nextRoundBtn2.style.display = 'inline-block';
        nextRoundBtn2.textContent = 'Следующий уровень';
    } else if (currentLevel2 === 4 && completedLevels2.has(4)) {
        nextRoundBtn2.style.display = 'inline-block';
        nextRoundBtn2.textContent = 'Завершить игру';
    } else {
        nextRoundBtn2.style.display = 'none';
    }
    
    updateLevelSelectOptions();
}

function resetMousePosition() {
    if (!canvas) return;
    mousePosition = { x: 50, y: canvas.height / 2 };
    isMouseOnPath = false;
}

function generateRandomPath() {
    if (!canvas) return;
    
    pathPoints = [];
    const startX = 50;
    const endX = canvas.width - 50;
    const baseY = canvas.height / 2;
    
    pathPoints.push({ x: startX, y: baseY, type: 'start' });
    
    const pathType = Math.random();
    
    if (pathType < 0.3) {
        generateSmoothWaves(startX, endX, baseY);
    } else if (pathType < 0.6) {
        generateSharpTurns(startX, endX, baseY);
    } else {
        generateMixedPath(startX, endX, baseY);
    }
    
    pathPoints.push({ x: endX, y: baseY, type: 'end' });
}

function generateSmoothWaves(startX, endX, baseY) {
    const waveCount = Math.floor(Math.random() * 3) + 2;
    const waveWidth = (endX - startX) / waveCount;
    
    for (let i = 0; i < waveCount; i++) {
        const waveStartX = startX + i * waveWidth;
        const waveEndX = startX + (i + 1) * waveWidth;
        
        const amplitude = (Math.random() * 80) + 40;
        const waveDirection = Math.random() > 0.5 ? 1 : -1;
        
        const cp1 = {
            x: waveStartX + waveWidth * 0.25,
            y: baseY + amplitude * 0.7 * waveDirection
        };
        
        const cp2 = {
            x: waveStartX + waveWidth * 0.75,
            y: baseY + amplitude * 0.7 * waveDirection * -1
        };
        
        const end = {
            x: waveEndX,
            y: baseY
        };
        
        const start = i === 0 ? 
            pathPoints[0] : 
            { x: pathPoints[pathPoints.length - 1].x, y: pathPoints[pathPoints.length - 1].y };
        
        const pointsPerWave = 40;
        for (let j = 0; j <= pointsPerWave; j++) {
            const t = j / pointsPerWave;
            const point = calculateBezierPoint(t, start, cp1, cp2, end);
            pathPoints.push({ ...point, type: 'curve' });
        }
    }
}

function generateSharpTurns(startX, endX, baseY) {
    const turnCount = Math.floor(Math.random() * 4) + 2;
    const segmentWidth = (endX - startX) / turnCount;
    
    for (let i = 0; i < turnCount; i++) {
        const segmentStartX = startX + i * segmentWidth;
        const segmentEndX = startX + (i + 1) * segmentWidth;
        
        const amplitude = (Math.random() * 100) + 60;
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        const cp1 = {
            x: segmentStartX + segmentWidth * 0.1,
            y: baseY + amplitude * direction
        };
        
        const cp2 = {
            x: segmentStartX + segmentWidth * 0.9,
            y: baseY + amplitude * direction * -1
        };
        
        const end = {
            x: segmentEndX,
            y: baseY
        };
        
        const start = i === 0 ? 
            pathPoints[0] : 
            { x: pathPoints[pathPoints.length - 1].x, y: pathPoints[pathPoints.length - 1].y };
        
        const pointsPerSegment = 30;
        for (let j = 0; j <= pointsPerSegment; j++) {
            const t = j / pointsPerSegment;
            const point = calculateBezierPoint(t, start, cp1, cp2, end);
            pathPoints.push({ ...point, type: 'curve' });
        }
    }
}

function generateMixedPath(startX, endX, baseY) {
    const totalPoints = 120;
    let currentX = startX;
    const points = [];
    
    points.push({ x: startX, y: baseY });
    
    while (currentX < endX) {
        const segmentLength = (Math.random() * 150) + 50;
        const amplitude = (Math.random() * 120) + 30;
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        const nextX = Math.min(currentX + segmentLength, endX);
        const controlX = currentX + (nextX - currentX) * 0.5;
        
        const cp1 = {
            x: currentX + (nextX - currentX) * 0.3,
            y: baseY + amplitude * 0.8 * direction
        };
        
        const cp2 = {
            x: currentX + (nextX - currentX) * 0.7,
            y: baseY + amplitude * 0.8 * direction * -0.5
        };
        
        const end = {
            x: nextX,
            y: baseY + (Math.random() - 0.5) * 40
        };
        
        const start = points[points.length - 1];
        
        const pointsInSegment = Math.floor(totalPoints * (segmentLength / (endX - startX)));
        for (let j = 0; j <= pointsInSegment; j++) {
            const t = j / pointsInSegment;
            const point = calculateBezierPoint(t, start, cp1, cp2, end);
            points.push(point);
        }
        
        currentX = nextX;
    }
    
    points.forEach((point, index) => {
        pathPoints.push({ ...point, type: index === 0 ? 'start' : 'curve' });
    });
}

function calculateBezierPoint(t, p0, p1, p2, p3) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    
    const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
    const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
    
    return { x, y };
}

function generateObstacles() {
    movingObstacles = [];
    
    const levelConfig = mouseLevels[currentLevel2];
    
    if (levelConfig.obstacles.includes('moving')) {
        generateMovingObstacles();
    }
}

function generateMovingObstacles() {
    const levelConfig = mouseLevels[currentLevel2];
    const movingCount = levelConfig.movingCount;
    
    for (let i = 0; i < movingCount; i++) {
        const pathIndex = Math.floor((i + 1) * (pathPoints.length / (movingCount + 1)));
        const pathPoint = pathPoints[pathIndex];
        
        const obstacle = {
            x: pathPoint.x,
            y: pathPoint.y,
            width: 20,
            height: 20,
            speed: 1.5 + Math.random() * 1.5,
            direction: Math.random() > 0.5 ? 1 : -1,
            amplitude: 40 + Math.random() * 30,
            startX: pathPoint.x,
            startY: pathPoint.y,
            type: 'moving'
        };
        
        movingObstacles.push(obstacle);
    }
}

function updateMovingObstacles() {
    const currentTime = Date.now();
    
    movingObstacles.forEach(obstacle => {
        obstacle.x = obstacle.startX + Math.sin(currentTime * 0.001 * obstacle.speed) * obstacle.amplitude * obstacle.direction;
        obstacle.y = obstacle.startY + Math.cos(currentTime * 0.001 * obstacle.speed * 0.7) * (obstacle.amplitude * 0.3);
    });
}

function drawGame() {
    if (!ctx || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawPath();
    drawObstacles();
    drawHouse();
    
    if (timeOffPath > maxOffPathTime * 0.5 && gameState2 === 'playing') {
        drawWarningMouse();
    } else {
        drawMouse();
    }
    
    if (gameState2 === 'playing') {
        drawTargetZone();
    }
}

function drawObstacles() {
    movingObstacles.forEach(obstacle => {
        drawMovingObstacle(obstacle);
    });
}

function drawMovingObstacle(obstacle) {
    drawCheese(obstacle.x, obstacle.y, obstacle.width / 2);
}

function drawCheese(x, y, radius) {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    const startX = x;
    const startY = y;
    const seed = Math.floor(startX * 1000 + startY * 1000);
    
    const holeCount = 4 + (seed % 3);
    
    for (let i = 0; i < holeCount; i++) {
        const pseudoRandom = (seed * (i + 1) * 9301 + 49297) % 233280;
        const randVal = pseudoRandom / 233280;
        
        const pseudoRandom2 = (seed * (i + 2) * 49297 + 233280) % 9301;
        const randVal2 = pseudoRandom2 / 9301;
        
        const size = 0.08 + randVal * 0.15;
        const xOffset = (randVal2 - 0.5) * 0.6;
        
        const pseudoRandom3 = (seed * (i + 3) * 233280 + 9301) % 49297;
        const randVal3 = pseudoRandom3 / 49297;
        const yOffset = (randVal3 - 0.5) * 0.6;
        
        const holeX = x + xOffset * radius;
        const holeY = y + yOffset * radius;
        const holeRadius = size * radius;
        
        ctx.fillStyle = '#B8860B';
        ctx.beginPath();
        
        const widthMultiplier = 0.8 + randVal * 0.4;
        const heightMultiplier = 0.8 + randVal2 * 0.4;
        
        ctx.ellipse(
            holeX, 
            holeY, 
            holeRadius * widthMultiplier,
            holeRadius * heightMultiplier,
            0,
            0, Math.PI * 2
        );
        ctx.fill();
        
        ctx.fillStyle = '#8B7355';
        ctx.beginPath();
        ctx.arc(
            holeX - holeRadius * 0.15,
            holeY - holeRadius * 0.15,
            holeRadius * (0.4 + randVal * 0.3),
            0, Math.PI * 2
        );
        ctx.fill();
    }
    
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 5; i++) {
        const textureSeed = (seed * (i + 10) * 12345) % 67890;
        const textureRand = textureSeed / 67890;
        
        const textureX = x + (textureRand - 0.5) * radius * 0.7;
        const textureY = y + ((seed * (i + 20) * 54321) % 98765 / 98765 - 0.5) * radius * 0.7;
        const textureRadius = radius * 0.05 * (0.5 + textureRand);
        
        ctx.beginPath();
        ctx.arc(textureX, textureY, textureRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPath() {
    if (!ctx || pathPoints.length === 0) return;
    
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    
    for (let i = 1; i < pathPoints.length - 1; i++) {
        const point = pathPoints[i];
        ctx.lineTo(point.x, point.y);
    }
    
    ctx.lineTo(pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y);
    
    ctx.strokeStyle = '#8b5fbf';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    ctx.strokeStyle = '#6b4b8a';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    for (let i = 0; i < pathPoints.length; i++) {
        const point = pathPoints[i];
        const angle = calculatePathAngle(i);
        const offsetX = -Math.sin(angle) * 6;
        const offsetY = Math.cos(angle) * 6;
        
        if (i === 0) {
            ctx.moveTo(point.x + offsetX, point.y + offsetY);
        } else {
            ctx.lineTo(point.x + offsetX, point.y + offsetY);
        }
    }
    ctx.stroke();
    
    ctx.beginPath();
    for (let i = 0; i < pathPoints.length; i++) {
        const point = pathPoints[i];
        const angle = calculatePathAngle(i);
        const offsetX = Math.sin(angle) * 6;
        const offsetY = -Math.cos(angle) * 6;
        
        if (i === 0) {
            ctx.moveTo(point.x + offsetX, point.y + offsetY);
        } else {
            ctx.lineTo(point.x + offsetX, point.y + offsetY);
        }
    }
    ctx.stroke();
    
    ctx.setLineDash([]);
}

function calculatePathAngle(pointIndex) {
    if (pointIndex <= 0 || pointIndex >= pathPoints.length - 1) {
        return 0;
    }
    
    const prevPoint = pathPoints[pointIndex - 1];
    const nextPoint = pathPoints[pointIndex + 1];
    
    return Math.atan2(nextPoint.y - prevPoint.y, nextPoint.x - prevPoint.x);
}

function drawHouse() {
    if (!ctx || !canvas) return;
    
    const houseX = canvas.width - 50;
    const houseY = canvas.height / 2;
    
    ctx.fillStyle = '#FFB6C1';
    ctx.fillRect(houseX - 30, houseY - 20, 60, 40);
    
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.moveTo(houseX - 35, houseY - 20);
    ctx.lineTo(houseX + 35, houseY - 20);
    ctx.lineTo(houseX, houseY - 45);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#FFE4E1';
    ctx.fillRect(houseX - 8, houseY, 16, 20);
    
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(houseX + 10, houseY - 10, 12, 12);
    
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(houseX + 5, houseY + 10, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 1;
    ctx.strokeRect(houseX + 10, houseY - 10, 12, 12);
    ctx.beginPath();
    ctx.moveTo(houseX + 16, houseY - 10);
    ctx.lineTo(houseX + 16, houseY + 2);
    ctx.moveTo(houseX + 10, houseY - 4);
    ctx.lineTo(houseX + 22, houseY - 4);
    ctx.stroke();
}

function drawMouse() {
    if (!ctx) return;
    
    const mouseSize = 15;
    
    ctx.fillStyle = isMouseOnPath ? '#32cd32' : '#666';
    ctx.beginPath();
    ctx.ellipse(mousePosition.x, mousePosition.y, mouseSize, mouseSize/1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = isMouseOnPath ? '#228b22' : '#555';
    ctx.beginPath();
    ctx.arc(mousePosition.x - 5, mousePosition.y - 8, 4, 0, Math.PI * 2);
    ctx.arc(mousePosition.x + 5, mousePosition.y - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.arc(mousePosition.x - 5, mousePosition.y - 8, 2, 0, Math.PI * 2);
    ctx.arc(mousePosition.x + 5, mousePosition.y - 8, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(mousePosition.x - 3, mousePosition.y - 3, 1.5, 0, Math.PI * 2);
    ctx.arc(mousePosition.x + 3, mousePosition.y - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(mousePosition.x + mouseSize - 2, mousePosition.y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mousePosition.x + mouseSize - 2, mousePosition.y);
    ctx.lineTo(mousePosition.x + mouseSize + 8, mousePosition.y - 2);
    ctx.moveTo(mousePosition.x + mouseSize - 2, mousePosition.y);
    ctx.lineTo(mousePosition.x + mouseSize + 7, mousePosition.y + 1);
    ctx.moveTo(mousePosition.x + mouseSize - 2, mousePosition.y);
    ctx.lineTo(mousePosition.x + mouseSize + 6, mousePosition.y + 3);
    ctx.stroke();
    
    ctx.strokeStyle = isMouseOnPath ? '#228b22' : '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mousePosition.x - mouseSize, mousePosition.y);
    ctx.lineTo(mousePosition.x - mouseSize - 10, mousePosition.y - 5);
    ctx.stroke();
}

function drawWarningMouse() {
    if (!ctx) return;
    
    const mouseSize = 15;
    const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
    
    ctx.fillStyle = 'rgba(255, ' + Math.floor(69 * pulse) + ', ' + Math.floor(0 * pulse) + ', 1)';
    ctx.beginPath();
    ctx.ellipse(mousePosition.x, mousePosition.y, mouseSize, mouseSize/1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(139, ' + Math.floor(0 * pulse) + ', ' + Math.floor(0 * pulse) + ', 1)';
    ctx.beginPath();
    ctx.arc(mousePosition.x - 5, mousePosition.y - 8, 4, 0, Math.PI * 2);
    ctx.arc(mousePosition.x + 5, mousePosition.y - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(mousePosition.x - 3, mousePosition.y - 3, 1.5, 0, Math.PI * 2);
    ctx.arc(mousePosition.x + 3, mousePosition.y - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(mousePosition.x + mouseSize - 2, mousePosition.y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mousePosition.x + mouseSize - 2, mousePosition.y);
    ctx.lineTo(mousePosition.x + mouseSize + 8, mousePosition.y - 2);
    ctx.moveTo(mousePosition.x + mouseSize - 2, mousePosition.y);
    ctx.lineTo(mousePosition.x + mouseSize + 7, mousePosition.y + 1);
    ctx.moveTo(mousePosition.x + mouseSize - 2, mousePosition.y);
    ctx.lineTo(mousePosition.x + mouseSize + 6, mousePosition.y + 3);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(139, ' + Math.floor(0 * pulse) + ', ' + Math.floor(0 * pulse) + ', 1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mousePosition.x - mouseSize, mousePosition.y);
    ctx.lineTo(mousePosition.x - mouseSize - 10, mousePosition.y - 5);
    ctx.stroke();
}

function drawTargetZone() {
    if (!ctx || !canvas) return;
    
    const houseX = canvas.width - 50;
    const radius = 30;
    
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(houseX, canvas.height / 2, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = 'rgba(255, 69, 0, 0.1)';
    ctx.beginPath();
    ctx.arc(houseX, canvas.height / 2, radius, 0, Math.PI * 2);
    ctx.fill();
}

function checkCollisions() {
    for (let obstacle of movingObstacles) {
        const distance = Math.sqrt(
            Math.pow(mousePosition.x - obstacle.x, 2) + 
            Math.pow(mousePosition.y - obstacle.y, 2)
        );
        
        if (distance < (obstacle.width / 2 + 10)) {
            return true;
        }
    }
    
    return false;
}

function handleMouseMove(e) {
    if (gameState2 !== 'playing') return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    mousePosition.x = (e.clientX - rect.left) * scaleX;
    mousePosition.y = (e.clientY - rect.top) * scaleY;
    
    checkMouseOnPath();
    
    if (checkCollisions()) {
        gameOver('Столкновение с препятствием!');
        return;
    }
    
    checkGameCompletion();
    drawGame();
}

function handleTouchMove(e) {
    if (gameState2 !== 'playing') return;
    
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    
    mousePosition.x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    mousePosition.y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    
    checkMouseOnPath();
    
    if (checkCollisions()) {
        gameOver('Столкновение с препятствием!');
        return;
    }
    
    checkGameCompletion();
    drawGame();
}

function checkMouseOnPath() {
    isMouseOnPath = false;
    
    let closestDistance = Infinity;
    
    for (let i = 0; i < pathPoints.length; i++) {
        const point = pathPoints[i];
        const distance = Math.sqrt(
            Math.pow(mousePosition.x - point.x, 2) + 
            Math.pow(mousePosition.y - point.y, 2)
        );
        
        if (distance < closestDistance) {
            closestDistance = distance;
        }
    }
    
    if (closestDistance < 25) {
        isMouseOnPath = true;
    }
}

function pointToLineDistance(point, lineStart, lineEnd) {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
        param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
        xx = lineStart.x;
        yy = lineStart.y;
    } else if (param > 1) {
        xx = lineEnd.x;
        yy = lineEnd.y;
    } else {
        xx = lineStart.x + param * C;
        yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
}

function checkGameCompletion() {
    if (gameCompleted) return;
    
    const houseX = canvas.width - 50;
    const houseY = canvas.height / 2;
    const distance = Math.sqrt(
        Math.pow(mousePosition.x - houseX, 2) + 
        Math.pow(mousePosition.y - houseY, 2)
    );
    
    if (distance < 30 && isMouseOnPath) {
        gameCompleted = true;
        finishGame2();
    }
}

function startGame2() {
    gameState2 = 'playing';
    const levelConfig = mouseLevels[currentLevel2];
    
    targetTime = Math.floor(
        Math.random() * (levelConfig.targetTimeRange.max - levelConfig.targetTimeRange.min + 1)
    ) + levelConfig.targetTimeRange.min;
    
    elapsedTime = 0;
    gameStartTime = Date.now();
    gameCompleted = false;
    
    timeOnPath = 0;
    timeOffPath = 0;
    isMouseOffPathTooLong = false;
    
    const difficultyConfig = mouseDifficulties[currentMouseDifficulty];
    maxOffPathTime = difficultyConfig.deviation / 1000;
    
    targetTimeElement.textContent = targetTime;
    if (elapsedTimeElement && elapsedTimeElement.parentElement) {
        elapsedTimeElement.parentElement.style.display = 'none';
    }
    timer2.textContent = levelConfig.description;
    
    const levelDescription2 = document.getElementById('levelDescription2');
    if (levelDescription2) {
        levelDescription2.textContent = levelConfig.description;
    }
    
    startGameBtn2.style.display = 'none';
    restartGameBtn2.style.display = 'inline-block';
    
    resetMousePosition();
    isMouseOnPath = true;
    timeOnPath = 0.1;
    
    gameLoop();
}

function gameLoop() {
    if (gameState2 !== 'playing') return;
    
    const currentTime = Date.now();
    elapsedTime = (currentTime - gameStartTime) / 1000;
    
    const deltaTime = 0.016;
    
    if (isMouseOnPath) {
        timeOnPath += deltaTime;
        if (timeOffPath > 0) {
            timeOffPath = Math.max(0, timeOffPath - deltaTime * 2);
        }
    } else {
        timeOffPath += deltaTime;
        timeOnPath = Math.max(0, timeOnPath - deltaTime * 0.5);
    }
    
    if (timeOffPath > maxOffPathTime && !isMouseOffPathTooLong) {
        isMouseOffPathTooLong = true;
        gameOver('Слишком долго вне тропинки!');
        return;
    }
    
    updateMovingObstacles();
    drawGame();
    
    if (!gameCompleted) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function finishGame2() {
    gameState2 = 'finished';
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    const levelConfig = mouseLevels[currentLevel2];
    const difficultyConfig = mouseDifficulties[currentMouseDifficulty];
    const timeDifference = Math.abs(elapsedTime - targetTime) * 1000;
    let pointsEarned = 0;
    
    const timeWin = timeDifference <= difficultyConfig.deviation;
    const pathWin = !isMouseOffPathTooLong && (timeOnPath / elapsedTime) >= MIN_PATH_PERCENT;
    
    if (timeWin && pathWin) {
        pointsEarned = 100 * difficultyConfig.pointsMultiplier * currentLevel2;
        totalScore2 += pointsEarned;
        
        resultTitle2.textContent = 'Раунд пройден!';
        resultTitle2.className = 'win';
        resultMessage2.textContent = 'Вы успешно прошли уровень ' + currentLevel2 + '! +' + pointsEarned + ' очков';
        
        completedLevels2.add(currentLevel2);
        
        if (typeof window.saveMouseGameResult === 'function') {
            window.saveMouseGameResult();
        }
        
    } else {
        resultTitle2.textContent = 'Вы проиграли!';
        resultTitle2.className = 'lose';
        
        let failReason = '';
        if (!timeWin) {
            failReason += 'Слишком большая разница во времени: ' + (timeDifference/1000).toFixed(1) + ' сек (допустимо: ' + difficultyConfig.deviation/1000 + ' сек)';
        }
        if (!pathWin) {
            if (failReason) failReason += '<br>';
            failReason += 'Слишком много времени вне тропинки';
        }
        if (isMouseOffPathTooLong) {
            if (failReason) failReason += '<br>';
            failReason += 'Слишком долго вне тропинки';
        }
        
        resultMessage2.textContent = failReason;
    }
    
    currentScore2.textContent = totalScore2;
    
    resultMessage2.innerHTML += '<br><br>Целевое время: ' + targetTime + ' сек<br>Ваше время: ' + elapsedTime.toFixed(1) + ' сек';
    
    updateLevelSelectOptions();
    
    if (timeWin && pathWin) {
        if (currentLevel2 < 4) {
            nextRoundBtn2.style.display = 'inline-block';
            nextRoundBtn2.textContent = 'Следующий уровень';
        } else {
            nextRoundBtn2.style.display = 'inline-block';
            nextRoundBtn2.textContent = 'Завершить игру';
        }
    } else {
        nextRoundBtn2.style.display = 'none';
    }
    restartRoundBtn2.style.display = 'inline-block';
    
    result2.style.display = 'block';
    restartGameBtn2.style.display = 'none';
}

function gameOver(reason) {
    gameState2 = 'finished';
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    resultTitle2.textContent = 'Игра окончена!';
    resultTitle2.className = 'lose';
    resultMessage2.textContent = reason;
    resultMessage2.innerHTML += '<br><br>Целевое время: ' + targetTime + ' сек<br>Ваше время: ' + elapsedTime.toFixed(1) + ' сек';
    
    if (typeof window.saveMouseGameResult === 'function') {
        window.saveMouseGameResult();
    }
    
    nextRoundBtn2.style.display = 'none';
    restartRoundBtn2.style.display = 'inline-block';
    
    result2.style.display = 'block';
    restartGameBtn2.style.display = 'none';
}

function restartGame2() {
    gameState2 = 'idle';
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    targetTime = 0;
    elapsedTime = 0;
    gameCompleted = false;
    timeOnPath = 0;
    timeOffPath = 0;
    isMouseOffPathTooLong = false;
    
    targetTimeElement.textContent = '0';
    if (elapsedTimeElement && elapsedTimeElement.parentElement) {
        elapsedTimeElement.parentElement.style.display = 'none';
    }
    
    updateGameInterface();
    
    generateRandomPath();
    generateObstacles();
    drawGame();
}

function nextRound2() {
    if (typeof window.saveMouseGameResult === 'function') {
        window.saveMouseGameResult();
    }
    
    if (currentLevel2 < 4) {
        currentLevel2++;
        if (levelSelect2) levelSelect2.value = currentLevel2;
    } else {
        if (typeof showLeadersScreen === 'function') showLeadersScreen();
        return;
    }
    result2.style.display = 'none';
    
    generateRandomPath();
    generateObstacles();
    startGame2();
}

function restartRound2() {
    result2.style.display = 'none';
    
    generateRandomPath();
    generateObstacles();
    startGame2();
}

function resetMouseGame() {
    gameState2 = 'idle';
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    targetTime = 0;
    elapsedTime = 0;
    gameCompleted = false;
    timeOnPath = 0;
    timeOffPath = 0;
    isMouseOffPathTooLong = false;
    
    generateRandomPath();
    generateObstacles();
    updateGameInterface();
    drawGame();
}

function resetMouseGameProgress() {
    totalScore2 = 0;
    currentLevel2 = 1;
    completedLevels2 = new Set();
    currentMouseDifficulty = 'easy';
    timeOnPath = 0;
    timeOffPath = 0;
    isMouseOffPathTooLong = false;
    if (levelSelect2) {
        levelSelect2.value = currentLevel2;
        updateLevelSelectOptions();
    }
    if (document.getElementById('difficultySelect2')) {
        document.getElementById('difficultySelect2').value = currentMouseDifficulty;
    }
    resetMousePosition();
    updateGameInterface();
    drawGame();
}

function updateMouseGameUI() {
    updateLevelSelectOptions();
    updateGameInterface();
}

function getMouseGameProgress() {
    const progress = {
        score: totalScore2,
        level: currentLevel2
    };
    
    return progress;
}

function restoreMouseGameProgress(playerData) {
    if (playerData) {
        totalScore2 = Number(playerData.score) || 0;
        currentLevel2 = Number(playerData.level) || 1;
        
        for (let i = 1; i < currentLevel2; i++) {
            completedLevels2.add(i);
        }
        
        currentScore2.textContent = totalScore2;
        if (levelSelect2) {
            levelSelect2.value = currentLevel2;
            updateLevelSelectOptions();
        }
    }
}

window.getMouseGameProgress = getMouseGameProgress;
window.restoreMouseGameProgress = restoreMouseGameProgress;
window.initMouseGame = initMouseGame;
window.updateMouseGameUI = updateMouseGameUI;
window.resetMouseGameProgress = resetMouseGameProgress;