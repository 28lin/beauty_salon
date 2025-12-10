let bulbsContainer, startBtn, restartBtn, nextLevelBtn, timer, result, resultTitle;
let resultMessage, intervalsInfo, currentScore, levelDescription, levelSelect, difficultySelect;

let gameState = 'idle';
let currentLevelNum = 1;
let totalScore = 0;
let sessionScore = 0;
let completedLevels = new Set();
let gameIntervals = [];
let userIntervals = [];
let clickTimes = [];
let bulbs = [];
let currentBulbIndex = 0;
let currentDifficultyType = 'easy';

const levels = {
    1: { 
        bulbs: 2,
        basePoints: 100, 
        description: 'Запомните интервал между двумя лампочками и повторите!'
    },
    2: { 
        bulbs: 3,
        basePoints: 200,
        description: 'Запомните два интервала между тремя лампочками и повторите!'
    },
    3: { 
        bulbs: 4,
        basePoints: 300,
        description: 'Запомните три интервала между четырьмя лампочками и повторите!'
    },
    4: { 
        bulbs: 4,
        basePoints: 400,
        description: 'Запомните три интервала между четырьмя лампочками и повторите!'
    },
    5: { 
        bulbs: 5,
        basePoints: 500,
        description: 'Запомните четыре интервала между пятью лампочками и повторите!'
    }
};

const difficulties = {
    easy: { 
        deviation: 1000,
        name: 'Легкая',
        className: 'easy-difficulty',
        pointsMultiplier: 1 
    },
    medium: { 
        deviation: 500,
        name: 'Средняя',
        className: 'medium-difficulty',
        pointsMultiplier: 2 
    },
    hard: { 
        deviation: 200,
        name: 'Сложная',
        className: 'hard-difficulty',
        pointsMultiplier: 3 
    }
};

function initBulbsGame() {
    bulbsContainer = document.getElementById('bulbsContainer');
    startBtn = document.getElementById('startBtn');
    restartBtn = document.getElementById('restartBtn');
    nextLevelBtn = document.getElementById('nextLevelBtn');
    timer = document.getElementById('timer');
    result = document.getElementById('result');
    resultTitle = document.getElementById('resultTitle');
    resultMessage = document.getElementById('resultMessage');
    intervalsInfo = document.getElementById('intervalsInfo');
    currentScore = document.getElementById('currentScore');
    levelDescription = document.getElementById('levelDescription');
    levelSelect = document.getElementById('levelSelect');
    difficultySelect = document.getElementById('difficultySelect');

    setupBulbsEventListeners();
    setupLevelSelect();
    setupDifficultySelect();
    updateLevelInfo();
    createBulbs();

    updateLevelSelectOptions();
}

function setupBulbsEventListeners() {
    startBtn.addEventListener('click', startLevel);
    restartBtn.addEventListener('click', function() {
        result.style.display = 'none';
        startLevel();
    });
    nextLevelBtn.addEventListener('click', nextLevel);
}

function setupLevelSelect() {
    updateLevelSelectOptions();
    levelSelect.value = currentLevelNum;
    levelSelect.addEventListener('change', function() {
        const selectedLevel = parseInt(this.value);
        currentLevelNum = selectedLevel;
        updateLevelInfo();
        createBulbs();
        resetBulbsGame();
        
        if (typeof savePlayerResult === 'function') savePlayerResult();
    });
}

function updateLevelSelectOptions() {
    for (let i = 1; i <= 5; i++) {
        const option = levelSelect.querySelector('option[value="' + i + '"]');
        if (option) {
            option.disabled = false;
            if (completedLevels.has(i)) {
                option.textContent = 'Уровень ' + i + ' ✓';
            } else {
                option.textContent = 'Уровень ' + i;
            }
        }
    }
}

function setupDifficultySelect() {
    difficultySelect.value = currentDifficultyType;
    difficultySelect.addEventListener('change', function() {
        currentDifficultyType = this.value;
        
        if (typeof savePlayerResult === 'function') savePlayerResult();
    });
}

function updateLevelInfo() {
    levelSelect.value = currentLevelNum;
    currentScore.textContent = sessionScore;
    levelDescription.textContent = levels[currentLevelNum].description;
    updateLevelSelectOptions();

    if (typeof savePlayerResult === 'function') savePlayerResult();
}

function createBulbs() {
    bulbsContainer.innerHTML = '';
    bulbs = [];
    const bulbCount = levels[currentLevelNum].bulbs;
    
    for (let i = 0; i < bulbCount; i++) {
        const bulbWrapper = document.createElement('div');
        bulbWrapper.className = 'bulb-wrapper';
        
        const bulb = document.createElement('div');
        bulb.className = 'bulb';
        bulb.id = 'bulb' + (i + 1);
        
        const label = document.createElement('div');
        label.className = 'bulb-label';
        label.textContent = 'Лампочка ' + (i + 1);
        
        bulb.addEventListener('click', () => handleBulbClick(i + 1));
        
        bulbWrapper.appendChild(bulb);
        bulbWrapper.appendChild(label);
        bulbsContainer.appendChild(bulbWrapper);
        bulbs.push(bulb);
    }
}

function startLevel() {
    resetBulbsGame();
    gameState = 'demo';
    startBtn.disabled = true;
    timer.textContent = 'Следите за лампочками...';
    
    const bulbCount = levels[currentLevelNum].bulbs;
    gameIntervals = [];
    
    for (let i = 0; i < bulbCount - 1; i++) {
        gameIntervals.push(Math.floor(Math.random() * 2000) + 1000);
    }
    
    showBulbSequence(0);
}

function showBulbSequence(index) {
    if (index >= bulbs.length) {
        setTimeout(() => {
            bulbs.forEach(bulb => bulb.classList.remove('active'));
            timer.textContent = 'Теперь ваша очередь! Повторите последовательность';
            gameState = 'playing';
            currentBulbIndex = 0;
            clickTimes = [];
        }, 1000);
        return;
    }
    
    bulbs[index].classList.add('active');
    timer.textContent = 'Зажглась лампочка ' + (index + 1);
    
    const delay = index < gameIntervals.length ? gameIntervals[index] : 1000;
    setTimeout(() => {
        bulbs[index].classList.remove('active');
        showBulbSequence(index + 1);
    }, delay);
}

function handleBulbClick(bulbNumber) {
    if (gameState !== 'playing') return;
    
    if (bulbNumber !== currentBulbIndex + 1) {
        timer.textContent = 'Неправильная последовательность! Нужно нажать лампочку ' + (currentBulbIndex + 1);
        return;
    }
    
    clickTimes.push(Date.now());
    bulbs[bulbNumber - 1].classList.add('active');
    timer.textContent = 'Лампочка ' + bulbNumber + ' нажата';
    
    setTimeout(() => {
        bulbs[bulbNumber - 1].classList.remove('active');
    }, 300);
    
    currentBulbIndex++;
    
    if (currentBulbIndex === bulbs.length) {
        checkResult();
    }
}

function checkResult() {
    gameState = 'finished';
    
    userIntervals = [];
    for (let i = 1; i < clickTimes.length; i++) {
        userIntervals.push(clickTimes[i] - clickTimes[i - 1]);
    }
    
    const levelConfig = levels[currentLevelNum];
    const difficultyConfig = difficulties[currentDifficultyType];
    let allIntervalsCorrect = true;
    let maxDifference = 0;
    
    const intervalResults = [];
    
    for (let i = 0; i < gameIntervals.length; i++) {
        const difference = Math.abs(userIntervals[i] - gameIntervals[i]);
        maxDifference = Math.max(maxDifference, difference);
        const isCorrect = difference <= difficultyConfig.deviation;
        
        if (!isCorrect) {
            allIntervalsCorrect = false;
        }
        
        intervalResults.push({
            index: i + 1,
            gameInterval: gameIntervals[i],
            userInterval: userIntervals[i],
            difference: difference,
            isCorrect: isCorrect
        });
    }
    
    showResult(allIntervalsCorrect, maxDifference, intervalResults, levelConfig, difficultyConfig);
}

function showResult(isWin, maxDifference, intervalResults, levelConfig, difficultyConfig) {
    result.style.display = 'block';
    intervalsInfo.innerHTML = '';
    
    if (isWin) {
        const pointsEarned = calculatePoints(currentLevelNum);
        
        resultTitle.textContent = 'Уровень пройден!';
        resultTitle.className = 'win';
        resultMessage.textContent = 'Поздравляем! Вы успешно прошли уровень ' + currentLevelNum + '! +' + pointsEarned + ' очков';
        totalScore += pointsEarned;
        sessionScore += pointsEarned;
        
        completedLevels.add(currentLevelNum);
        
        if (typeof savePlayerResult === 'function') {
            savePlayerResult();
            if (typeof updateLeadersTable === 'function') {
                updateLeadersTable();
            }
        }
        
        if (currentLevelNum < 5) {
            nextLevelBtn.style.display = 'inline-block';
        } else {
            nextLevelBtn.textContent = 'Завершить игру';
            resultMessage.textContent += '. Поздравляем! Вы прошли все уровни!';
        }
        
    } else {
        resultTitle.textContent = 'Уровень не пройден';
        resultTitle.className = 'lose';
        resultMessage.textContent = 'Максимальное отклонение: ' + maxDifference + ' мс (допустимо: ' + difficultyConfig.deviation + ' мс)';
        nextLevelBtn.style.display = 'none';
        
        if (typeof savePlayerResult === 'function') savePlayerResult();
    }
    
    const difficultyInfo = document.createElement('p');
    difficultyInfo.innerHTML = 'Сложность: <span class="' + difficultyConfig.className + '">' + difficultyConfig.name + '</span> (множитель очков: ×' + difficultyConfig.pointsMultiplier + ')';
    intervalsInfo.appendChild(difficultyInfo);
    
    if (intervalResults.length > 0) {
        const intervalsDiv = document.createElement('div');
        intervalsDiv.className = 'interval-stats';
        intervalsDiv.innerHTML = '<h3>Детали интервалов:</h3>';
        
        intervalResults.forEach(result => {
            const intervalDiv = document.createElement('div');
            intervalDiv.className = 'interval-stat';
            intervalDiv.innerHTML = '<span>Интервал ' + result.index + ':</span><span>' + result.gameInterval + ' мс vs ' + result.userInterval + ' мс</span><span style="color: ' + (result.isCorrect ? '#4CAF50' : '#f44336') + '">(' + result.difference + ' мс ' + (result.isCorrect ? '✓' : '✗') + ')</span>';
            intervalsDiv.appendChild(intervalDiv);
        });
        
        intervalsInfo.appendChild(intervalsDiv);
    }
    
    startBtn.disabled = false;
    timer.textContent = 'Уровень завершен.';
    updateLevelInfo();
}

function calculatePoints(levelNum) {
    const levelConfig = levels[levelNum];
    const difficultyConfig = difficulties[currentDifficultyType];
    
    return levelConfig.basePoints * difficultyConfig.pointsMultiplier;
}

function nextLevel() {
    if (currentLevelNum < 5) {
        currentLevelNum++;
        updateLevelInfo();
        createBulbs();
        result.style.display = 'none';
        startLevel();
    } else {
        if (typeof savePlayerResult === 'function') savePlayerResult();
        if (typeof updateLeadersTable === 'function') updateLeadersTable();
        if (typeof showLeadersScreen === 'function') showLeadersScreen();
    }
}

function resetBulbsGame() {
    if (bulbs && bulbs.length > 0) {
        bulbs.forEach(bulb => bulb.classList.remove('active'));
    }
    gameState = 'idle';
    currentBulbIndex = 0;
    clickTimes = [];
    gameIntervals = [];
    userIntervals = [];
    startBtn.disabled = false;
    timer.textContent = 'Нажмите "Начать уровень"';
}

function restoreBulbsGameProgress(existingPlayer) {
    totalScore = existingPlayer.score;
    currentLevelNum = existingPlayer.level;
    sessionScore = 0;

    for (let i = 1; i < currentLevelNum; i++) {
        completedLevels.add(i);
    }
    updateLevelInfo();
    createBulbs();
}

function resetBulbsGameProgress() {
    totalScore = 0;
    sessionScore = 0;
    currentLevelNum = 1;
    completedLevels.clear();
    updateLevelInfo();
    createBulbs();
}

function getBulbsGameProgress() {
    return {
        score: totalScore,
        level: currentLevelNum
    };
}

window.initBulbsGame = initBulbsGame;
window.resetBulbsGame = resetBulbsGame;
window.restoreBulbsGameProgress = restoreBulbsGameProgress;
window.resetBulbsGameProgress = resetBulbsGameProgress;
window.getBulbsGameProgress = getBulbsGameProgress;