let frogGame = {
    attempts: 3,
    maxAttempts: 3,
    score: 0,
    isJumping: false,
    isGameActive: false,
    pressStartTime: 0,
    pressDuration: 0,
    maxPressDuration: 2000,
    targetLilypad: null,
    frog: null,
    currentLilypad: null,
    gameContainer: null,
    distanceToTarget: 0,
    jumpPower: 0,
    successfulJumps: 0,
    requiredJumps: 1,
    gameStarted: false,
    frogWidth: 70,
    frogHeight: 50,
    currentRound: 1,
    maxRounds: 4,
    difficulty: 'easy',
    difficulties: {
        easy: { 
            attempts: 3, 
            scoreMultiplier: 1,
            name: 'Легкая',
            className: 'easy-difficulty'
        },
        medium: { 
            attempts: 2, 
            scoreMultiplier: 2,
            name: 'Средняя',
            className: 'medium-difficulty'
        },
        hard: { 
            attempts: 1, 
            scoreMultiplier: 3,
            name: 'Сложная',
            className: 'hard-difficulty'
        }
    },
    currentLilypadX: 150,
    currentLilypadY: 100,
    targetLilypadX: 0,
    targetLilypadY: 100,
    animationInterval: null,
    isAnimating: false,
    completedRounds: new Set(),
    sessionScore: 0
};

function initFrogGame() {
    frogGame.frog = document.getElementById('frog');
    frogGame.targetLilypad = document.getElementById('targetLilypad');
    frogGame.currentLilypad = document.getElementById('currentLilypad');
    frogGame.gameContainer = document.getElementById('frogGameContainer');
    
    if (!frogGame.frog) {
        return;
    }
    if (!frogGame.targetLilypad) {
        return;
    }
    
    repositionStartLilypad();
    setupFrogGameEventListeners();
    
    setupFrogLevelSelectors();
    
    frogGame.isGameActive = false;
    frogGame.gameStarted = false;
    
    updateFrogGameUI();
}

function setupFrogLevelSelectors() {
    const levelSelect3 = document.getElementById('levelSelect3');
    const difficultySelect3 = document.getElementById('difficultySelect3');
    
    if (!levelSelect3) {
        return;
    }
    
    if (!difficultySelect3) {
        return;
    }
    
    recreateFrogLevelSelectOptions();
    
    levelSelect3.value = frogGame.currentRound;
    difficultySelect3.value = frogGame.difficulty;
    
    levelSelect3.addEventListener('change', function() {
        const selectedLevel = parseInt(this.value);
        frogGame.currentRound = selectedLevel;
        restartRoundFrog();
    });
    
    difficultySelect3.addEventListener('change', function() {
        frogGame.difficulty = this.value;
        const diffSettings = frogGame.difficulties[frogGame.difficulty];
        frogGame.maxAttempts = diffSettings.attempts;
        
        if (frogGame.gameStarted) {
            frogGame.attempts = frogGame.maxAttempts;
            updateFrogGameUI();
        }
    });
}

function recreateFrogLevelSelectOptions() {
    const levelSelect3 = document.getElementById('levelSelect3');
    if (!levelSelect3) return;
    
    levelSelect3.innerHTML = '';
    
    for (let i = 1; i <= 4; i++) {
        const option = document.createElement('option');
        option.value = i;
        
        option.disabled = false;
        if (frogGame.completedRounds.has(i)) {
            option.textContent = 'Уровень ' + i + ' ✓';
        } else {
            option.textContent = 'Уровень ' + i;
        }
        
        levelSelect3.appendChild(option);
    }
    
    levelSelect3.value = frogGame.currentRound;
}

function updateFrogLevelSelectOptions() {
    recreateFrogLevelSelectOptions();
}

function repositionStartLilypad() {
    if (!frogGame.currentLilypad) return;
    frogGame.currentLilypad.style.left = '100px';
    frogGame.currentLilypad.style.bottom = '100px';
}

function setupFrogGameEventListeners() {
    const frog = frogGame.frog;
    const startGameBtn3 = document.getElementById('startGameBtn3');
    const nextRoundBtn3 = document.getElementById('nextRoundBtn3');
    const restartRoundBtn3 = document.getElementById('restartRoundBtn3');
    
    if (startGameBtn3) {
        startGameBtn3.addEventListener('click', startFrogGame);
    }
    
    if (nextRoundBtn3) {
        nextRoundBtn3.addEventListener('click', nextRoundFrog);
    }
    
    if (restartRoundBtn3) {
        restartRoundBtn3.addEventListener('click', restartRoundFrog);
    }
    
    if (frog) {
        frog.addEventListener('mousedown', handleFrogPress);
        frog.addEventListener('touchstart', function(e) {
            e.preventDefault();
            handleFrogPress(e);
        }, { passive: false });
        
        document.addEventListener('mouseup', handleFrogRelease);
        document.addEventListener('touchend', handleFrogRelease);
        
        frog.addEventListener('contextmenu', (e) => e.preventDefault());
    }
}

function handleFrogPress(e) {
    if (!frogGame.isGameActive || frogGame.isJumping || frogGame.attempts <= 0) {
        return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    frogGame.pressStartTime = Date.now();
    frogGame.isJumping = true;
    frogGame.frog.style.transform = 'scale(0.9)';
}

function handleFrogRelease(e) {
    if (!frogGame.isJumping || !frogGame.isGameActive) {
        return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const currentTime = Date.now();
    frogGame.pressDuration = Math.min(currentTime - frogGame.pressStartTime, frogGame.maxPressDuration);
    frogGame.jumpPower = (frogGame.pressDuration / frogGame.maxPressDuration) * 100;
    
    performJump();
}

function performJump() {
    frogGame.isJumping = false;
    frogGame.attempts--;
    
    stopLilypadAnimations();
    
    const currentRect = frogGame.currentLilypad.getBoundingClientRect();
    const targetRect = frogGame.targetLilypad.getBoundingClientRect();
    const containerRect = frogGame.gameContainer.getBoundingClientRect();
    
    const currentX = currentRect.left - containerRect.left + currentRect.width / 2;
    const currentY = currentRect.bottom - containerRect.top;
    const targetX = targetRect.left - containerRect.left + targetRect.width / 2;
    const targetY = targetRect.bottom - containerRect.top;
    
    frogGame.distanceToTarget = Math.abs(targetX - currentX);
    const verticalDifference = targetY - currentY;
    
    const maxJumpDistance = 400;
    const jumpDistance = (frogGame.jumpPower / 100) * maxJumpDistance;
    
    const lilypadRadius = 60;
    const frogHalfWidth = frogGame.frogWidth / 2;
    const allowedDistanceFromCenter = lilypadRadius - frogHalfWidth;
    
    const distanceFromTargetCenter = Math.abs(jumpDistance - frogGame.distanceToTarget);
    const isSuccess = distanceFromTargetCenter <= allowedDistanceFromCenter;
    
    frogGame.frog.classList.add('jumping');
    frogGame.frog.style.setProperty('--jump-distance', jumpDistance + 'px');
    frogGame.frog.style.setProperty('--jump-vertical', verticalDifference + 'px');
    
    updateFrogGameUI();
    
    setTimeout(() => {
        frogGame.frog.classList.remove('jumping');
        
        if (isSuccess) {
            handleSuccessfulJump();
        } else {
            handleFailedJump();
        }
        
        startLilypadAnimations();
        
        if (frogGame.attempts <= 0 || frogGame.successfulJumps >= frogGame.requiredJumps) {
            endFrogGame();
        } else {
            showFrogMessage(
                isSuccess ? 
                'Отличный прыжок! Осталось попыток: ' + frogGame.attempts : 
                'Промах! Осталось попыток: ' + frogGame.attempts,
                isSuccess ? 'success' : 'error'
            );
        }
    }, 800);
}

function handleSuccessfulJump() {
    frogGame.frog.classList.add('landed');
    
    const scoreMultiplier = frogGame.difficulties[frogGame.difficulty].scoreMultiplier;
    const pointsEarned = Math.round(100 * scoreMultiplier * frogGame.currentRound);
    
    frogGame.score += pointsEarned;
    frogGame.sessionScore += pointsEarned;
    frogGame.successfulJumps++;
    
    showFrogMessage('Прыжок успешен! +' + pointsEarned + ' очков', 'success');
    
    updateFrogGameUI();
}

function handleFailedJump() {
    frogGame.frog.classList.add('splash');
    frogGame.frog.style.setProperty('--jump-distance', (frogGame.jumpPower / 100 * 400) + 'px');
    
    setTimeout(() => {
        frogGame.frog.classList.remove('splash');
        frogGame.frog.style.transform = 'translate(0, 0) scale(1)';
        frogGame.frog.style.opacity = '1';
    }, 800);
}

function showFrogMessage(message, type) {
    const timer = document.getElementById('timer3');
    if (!timer) return;
    
    timer.textContent = message;
    timer.className = 'timer-3';
    timer.classList.add(type + '-message');
    
    setTimeout(() => {
        if (frogGame.isGameActive && frogGame.attempts > 0) {
            timer.textContent = 'Нажмите на лягушку и удерживайте для прыжка';
            timer.className = 'timer-3';
        }
    }, 2000);
}

function positionTargetLilypad() {
    if (!frogGame.gameContainer || !frogGame.targetLilypad) return;
    
    const containerWidth = frogGame.gameContainer.clientWidth;
    
    const minDistance = 150;
    const maxDistance = 400;
    const minBottom = 50;
    const maxBottom = 250;
    
    const distance = minDistance + Math.random() * (maxDistance - minDistance);
    const targetX = 100 + distance;
    
    const maxX = containerWidth - 170;
    const finalX = Math.min(targetX, maxX);
    
    const targetY = minBottom + Math.random() * (maxBottom - minBottom);
    
    frogGame.targetLilypad.style.left = finalX + 'px';
    frogGame.targetLilypad.style.bottom = targetY + 'px';
    frogGame.targetLilypad.style.right = 'auto';
    
    setupLevelAnimations();
}

function setupLevelAnimations() {
    frogGame.currentLilypad.classList.remove('moving-slow', 'moving-medium', 'moving-horizontal', 'moving-horizontal-fast');
    frogGame.targetLilypad.classList.remove('moving-slow', 'moving-medium', 'moving-horizontal', 'moving-horizontal-fast');
    
    if (frogGame.animationInterval) {
        clearInterval(frogGame.animationInterval);
        frogGame.animationInterval = null;
    }
    
    switch(frogGame.currentRound) {
        case 1:
            break;
        case 2:
            frogGame.targetLilypad.classList.add('moving-slow');
            break;
        case 3:
            frogGame.currentLilypad.classList.add('moving-horizontal');
            break;
        case 4:
            frogGame.currentLilypad.classList.add('moving-horizontal');
            frogGame.targetLilypad.classList.add('moving-horizontal-fast');
            break;
    }
}

function stopLilypadAnimations() {
    if (frogGame.animationInterval) {
        clearInterval(frogGame.animationInterval);
        frogGame.animationInterval = null;
    }
    
    frogGame.currentLilypad.style.animationPlayState = 'paused';
    frogGame.targetLilypad.style.animationPlayState = 'paused';
}

function startLilypadAnimations() {
    frogGame.currentLilypad.style.animationPlayState = 'running';
    frogGame.targetLilypad.style.animationPlayState = 'running';
}

function updateFrogGameUI() {
    const remainingAttempts = document.getElementById('remainingAttempts');
    if (remainingAttempts) {
        remainingAttempts.textContent = frogGame.attempts + '/' + frogGame.maxAttempts;
    }
    
    const currentScore3 = document.getElementById('currentScore3');
    if (currentScore3) {
        currentScore3.textContent = frogGame.score;
    }
    
    const levelSelect3 = document.getElementById('levelSelect3');
    const difficultySelect3 = document.getElementById('difficultySelect3');
    
    if (levelSelect3) {
        recreateFrogLevelSelectOptions();
    }
    
    if (difficultySelect3) {
        difficultySelect3.value = frogGame.difficulty;
    }
    
    const startGameBtn3 = document.getElementById('startGameBtn3');
    const nextRoundBtn3 = document.getElementById('nextRoundBtn3');
    const restartRoundBtn3 = document.getElementById('restartRoundBtn3');
    
    if (startGameBtn3) {
        if (!frogGame.gameStarted || !frogGame.isGameActive) {
            startGameBtn3.style.display = 'inline-block';
        } else {
            startGameBtn3.style.display = 'none';
        }
    }
    
    if (nextRoundBtn3) {
        if (frogGame.gameStarted && !frogGame.isGameActive) {
            const won = frogGame.successfulJumps >= frogGame.requiredJumps;
            if (won && frogGame.currentRound < 4) {
                nextRoundBtn3.style.display = 'inline-block';
                nextRoundBtn3.textContent = 'Следующий уровень';
            } else if (won && frogGame.currentRound === 4) {
                nextRoundBtn3.style.display = 'inline-block';
                nextRoundBtn3.textContent = 'Завершить игру';
            } else {
                nextRoundBtn3.style.display = 'none';
            }
        } else {
            nextRoundBtn3.style.display = 'none';
        }
    }
    
    if (restartRoundBtn3) {
        if (frogGame.gameStarted && !frogGame.isGameActive) {
            restartRoundBtn3.style.display = 'inline-block';
            restartRoundBtn3.textContent = 'Повторить уровень';
        } else {
            restartRoundBtn3.style.display = 'none';
        }
    }
}

function startFrogGame() {
    frogGame.gameStarted = true;
    frogGame.isGameActive = true;
    
    const diffSettings = frogGame.difficulties[frogGame.difficulty];
    frogGame.maxAttempts = diffSettings.attempts;
    frogGame.attempts = frogGame.maxAttempts;
    
    frogGame.successfulJumps = 0;
    frogGame.isJumping = false;
    frogGame.sessionScore = 0;
    
    if (frogGame.frog) {
        frogGame.frog.classList.remove('jumping', 'landed', 'splash');
        frogGame.frog.style.transform = 'translate(0, 0) scale(1)';
        frogGame.frog.style.opacity = '1';
    }
    
    positionTargetLilypad();
    
    const resultScreen = document.getElementById('result3');
    if (resultScreen) {
        resultScreen.style.display = 'none';
    }
    
    const levelSelect3 = document.getElementById('levelSelect3');
    if (levelSelect3) {
        levelSelect3.value = frogGame.currentRound;
    }
    
    updateFrogGameUI();
    
    const timer = document.getElementById('timer3');
    if (timer) {
        timer.textContent = 'Нажмите на лягушку и удерживайте для прыжка';
        timer.className = 'timer-3';
    }
}

function resetFrogGame() {
    frogGame.currentRound = 1;
    frogGame.difficulty = 'easy';
    frogGame.score = 0;
    frogGame.sessionScore = 0;
    frogGame.completedRounds = new Set();
    const diffSettings = frogGame.difficulties[frogGame.difficulty];
    frogGame.maxAttempts = diffSettings.attempts;
    
    startFrogGame();
}

function nextRoundFrog() {
    if (typeof window.saveFrogGameResult === 'function') {
        window.saveFrogGameResult();
    }
    
    if (frogGame.currentRound < 4) {
        frogGame.currentRound++;
        
        const levelSelect3 = document.getElementById('levelSelect3');
        if (levelSelect3) {
            levelSelect3.value = frogGame.currentRound;
        }
        
        startFrogGame();
    } else {
        resetFrogGame();
    }
}

function restartRoundFrog() {
    const currentLevel = frogGame.currentRound;
    
    startFrogGame();
    
    frogGame.currentRound = currentLevel;
    
    const levelSelect3 = document.getElementById('levelSelect3');
    if (levelSelect3) {
        levelSelect3.value = frogGame.currentRound;
    }
    
    updateFrogGameUI();
}

function endFrogGame() {
    frogGame.isGameActive = false;
    
    const resultScreen = document.getElementById('result3');
    const resultTitle = document.getElementById('resultTitle3');
    const resultMessage = document.getElementById('resultMessage3');
    const nextRoundBtn3 = document.getElementById('nextRoundBtn3');
    const restartRoundBtn3 = document.getElementById('restartRoundBtn3');
    
    if (resultScreen) {
        resultScreen.style.display = 'block';
    }
    
    const won = frogGame.successfulJumps >= frogGame.requiredJumps;
    
    if (won) {
        frogGame.completedRounds.add(frogGame.currentRound);
        
        const diffSettings = frogGame.difficulties[frogGame.difficulty];
        
        if (resultTitle) resultTitle.textContent = 'Поздравляем!';
        if (resultMessage) {
            resultMessage.innerHTML = 'Вы выиграли уровень ' + frogGame.currentRound + '!<br>Набрано ' + frogGame.score + ' очков.<br>Сложность: <span class="' + diffSettings.className + '">' + diffSettings.name + '</span> (множитель: ×' + diffSettings.scoreMultiplier + ')';
        }
        showFrogMessage('Победа! Вы успешно допрыгали до кувшинки!', 'success');
        
        if (typeof window.saveFrogGameResult === 'function') {
            window.saveFrogGameResult();
        }
        
        updateFrogLevelSelectOptions();
        updateFrogGameUI();
        
    } else {
        if (resultTitle) resultTitle.textContent = 'Попробуйте ещё раз!';
        if (resultMessage) resultMessage.textContent = 'Вы проиграли уровень ' + frogGame.currentRound + '. Набрано ' + frogGame.score + ' очков. Попробуйте снова!';
        showFrogMessage('Поражение! Не удалось допрыгнуть до кувшинки.', 'error');
        
        if (typeof window.saveFrogGameResult === 'function') {
            window.saveFrogGameResult();
        }
    }
    
    if (nextRoundBtn3) {
        nextRoundBtn3.style.display = 'inline-block';
    }
    if (restartRoundBtn3) {
        restartRoundBtn3.style.display = 'inline-block';
    }
}

function showGameScreen3() {
    const gameScreen3 = document.getElementById('gameScreen3');
    if (gameScreen3) {
        gameScreen3.style.display = 'block';
    }
    
    const screens = ['registrationScreen', 'gameSelectionScreen', 'gameScreen', 'gameScreen2', 'leadersScreen'];
    screens.forEach(screenId => {
        const screen = document.getElementById(screenId);
        if (screen && screen !== gameScreen3) {
            screen.style.display = 'none';
        }
    });
    
    setTimeout(() => {
        updateFrogLevelSelectOptions();
        updateFrogGameUI();
        
        if (!frogGame.gameStarted) {
            frogGame.isGameActive = false;
            frogGame.gameStarted = false;
            const timer = document.getElementById('timer3');
            if (timer) {
                timer.textContent = 'Нажмите "Начать игру" чтобы начать';
                timer.className = 'timer-3 info-message';
            }
        }
    }, 100);
}

function resetFrogGameProgress() {
    frogGame.score = 0;
    frogGame.sessionScore = 0;
    frogGame.currentRound = 1;
    frogGame.completedRounds = new Set();
    frogGame.difficulty = 'easy';
    updateFrogLevelSelectOptions();
    updateFrogGameUI();
}

function restoreFrogGameProgress(playerData) {
    if (playerData) {
        frogGame.score = Number(playerData.score) || 0;
        frogGame.currentRound = Number(playerData.level) || 1;
        frogGame.sessionScore = 0;
        
        frogGame.completedRounds = new Set();
        for (let i = 1; i < frogGame.currentRound; i++) {
            frogGame.completedRounds.add(i);
        }
        
        updateFrogLevelSelectOptions();
        updateFrogGameUI();
    }
}

function getFrogGameProgress() {
    const progress = {
        score: frogGame.score,
        level: frogGame.currentRound,
        completedRounds: Array.from(frogGame.completedRounds)
    };
    
    return progress;
}

window.initFrogGame = initFrogGame;
window.showGameScreen3 = showGameScreen3;
window.resetFrogGame = resetFrogGame;
window.resetFrogGameProgress = resetFrogGameProgress;
window.restoreFrogGameProgress = restoreFrogGameProgress;
window.getFrogGameProgress = getFrogGameProgress;
window.updateFrogGameUI = updateFrogGameUI;
window.updateFrogLevelSelectOptions = updateFrogLevelSelectOptions;

window.getFrogGameState = function() {
    return {
        score: frogGame.score,
        currentRound: frogGame.currentRound,
        sessionScore: frogGame.sessionScore,
        attempts: frogGame.attempts,
        successfulJumps: frogGame.successfulJumps,
        isGameActive: frogGame.isGameActive
    };
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initFrogGame, 500);
    });
} else {
    setTimeout(initFrogGame, 500);
}