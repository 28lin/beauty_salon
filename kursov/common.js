document.addEventListener('DOMContentLoaded', function() {
    const registrationScreen = document.getElementById('registrationScreen');
    const gameSelectionScreen = document.getElementById('gameSelectionScreen');
    const gameScreen = document.getElementById('gameScreen');
    const gameScreen2 = document.getElementById('gameScreen2');
    const gameScreen3 = document.getElementById('gameScreen3');
    const leadersScreen = document.getElementById('leadersScreen');
    const playerNameInput = document.getElementById('playerName');
    const startGameBtn = document.getElementById('startGameBtn');
    const currentPlayerName = document.getElementById('currentPlayerName');
    const showLeadersBtn = document.getElementById('showLeadersBtn');
    const backToGameBtn = document.getElementById('backToGameBtn');
    const newGameBtn = document.getElementById('newGameBtn');
    const newGameHeaderBtn = document.getElementById('newGameHeaderBtn');
    const backToSelectionBtn = document.getElementById('backToSelectionBtn');
    const leadersTable = document.getElementById('leadersTable');
    const gameOptions = document.querySelectorAll('.game-option');
    
    const currentPlayerName2 = document.getElementById('currentPlayerName2');
    const backToSelectionBtn2 = document.getElementById('backToSelectionBtn2');
    const newGameHeaderBtn2 = document.getElementById('newGameHeaderBtn2');
    const showLeadersBtn2 = document.getElementById('showLeadersBtn2');
    
    const currentPlayerName3 = document.getElementById('currentPlayerName3');
    const backToSelectionBtn3 = document.getElementById('backToSelectionBtn3');
    const newGameHeaderBtn3 = document.getElementById('newGameHeaderBtn3');
    const showLeadersBtn3 = document.getElementById('showLeadersBtn3');
    const endFrogGameBtn = document.getElementById('endFrogGameBtn');

    let currentPlayer = '';
    let lastActiveGame = '';

    function initGame() {
        showRegistrationScreen();
        setupEventListeners();
        if (typeof initBulbsGame === 'function') initBulbsGame();
        if (typeof initMouseGame === 'function') initMouseGame();
        if (typeof initFrogGame === 'function') initFrogGame();
    }

    function setupEventListeners() {
        startGameBtn.addEventListener('click', startGame);
        showLeadersBtn.addEventListener('click', () => showLeadersScreen('game1'));
        backToGameBtn.addEventListener('click', showGameScreenFromLeaders);
        newGameBtn.addEventListener('click', newGame);
        newGameHeaderBtn.addEventListener('click', newGame);
        backToSelectionBtn.addEventListener('click', showGameSelectionScreen);
        
        gameOptions.forEach(option => {
            option.addEventListener('click', function() {
                const gameId = this.getAttribute('data-game');
                selectGame(gameId);
            });
        });
        
        playerNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                startGame();
            }
        });

        backToSelectionBtn2.addEventListener('click', showGameSelectionScreen);
        newGameHeaderBtn2.addEventListener('click', newGame);
        showLeadersBtn2.addEventListener('click', () => showLeadersScreen('game2'));
        
        if (backToSelectionBtn3) {
            backToSelectionBtn3.addEventListener('click', showGameSelectionScreen);
        }
        if (newGameHeaderBtn3) {
            newGameHeaderBtn3.addEventListener('click', newGame);
        }
        if (showLeadersBtn3) {
            showLeadersBtn3.addEventListener('click', () => showLeadersScreen('game3'));
        }
        if (endFrogGameBtn) {
            endFrogGameBtn.addEventListener('click', function() {
                window.saveFrogGameResult();
                showGameSelectionScreen();
            });
        }
    }

    function showRegistrationScreen() {
        registrationScreen.style.display = 'block';
        gameSelectionScreen.style.display = 'none';
        gameScreen.style.display = 'none';
        gameScreen2.style.display = 'none';
        gameScreen3.style.display = 'none';
        leadersScreen.style.display = 'none';
        playerNameInput.focus();
    }

    function showGameSelectionScreen() {
        lastActiveGame = '';
        registrationScreen.style.display = 'none';
        gameSelectionScreen.style.display = 'block';
        gameScreen.style.display = 'none';
        gameScreen2.style.display = 'none';
        gameScreen3.style.display = 'none';
        leadersScreen.style.display = 'none';
    }

    function selectGame(gameId) {
        if (gameId === '1') {
            showGameScreen();
        } else if (gameId === '2') {
            showGameScreen2();
        } else if (gameId === '3') {
            showGameScreen3();
        } else {
            alert('Игра "' + gameId + ' раунд" находится в разработке. Следите за обновлениями!');
        }
    }

    function startGame() {
        const name = playerNameInput.value.trim();
        if (name === '') {
            alert('Пожалуйста, введите ваше имя');
            playerNameInput.focus();
            return;
        }
        
        currentPlayer = name;
        currentPlayerName.textContent = name;
        currentPlayerName2.textContent = name;
        
        if (currentPlayerName3) {
            currentPlayerName3.textContent = name;
        }
        
        checkAndRestorePlayerProgress(name);
        
        showGameSelectionScreen();
        saveBulbPlayerResult();
    }

    function checkAndRestorePlayerProgress(playerName) {
        const bulbLeaders = JSON.parse(localStorage.getItem('bulbGameLeaders')) || [];
        const mouseLeaders = JSON.parse(localStorage.getItem('mouseGameLeaders')) || [];
        const frogLeaders = JSON.parse(localStorage.getItem('frogGameLeaders')) || [];
        
        const bulbPlayer = bulbLeaders.find(leader => leader.name === playerName);
        if (bulbPlayer && typeof restoreBulbsGameProgress === 'function') {
            restoreBulbsGameProgress(bulbPlayer);
        } else if (typeof resetBulbsGameProgress === 'function') {
            resetBulbsGameProgress();
        }
        
        const mousePlayer = mouseLeaders.find(leader => leader.name === playerName);
        if (mousePlayer && typeof restoreMouseGameProgress === 'function') {
            restoreMouseGameProgress(mousePlayer);
        } else if (typeof resetMouseGameProgress === 'function') {
            resetMouseGameProgress();
        }
        
        const frogPlayer = frogLeaders.find(leader => leader.name === playerName);
        if (frogPlayer && typeof restoreFrogGameProgress === 'function') {
            restoreFrogGameProgress(frogPlayer);
        } else if (typeof resetFrogGameProgress === 'function') {
            resetFrogGameProgress();
        }
    }

    function newGame() {
        if (typeof resetBulbsGameProgress === 'function') resetBulbsGameProgress();
        if (typeof resetMouseGameProgress === 'function') resetMouseGameProgress();
        if (typeof resetFrogGameProgress === 'function') resetFrogGameProgress();
        
        showRegistrationScreen();
        playerNameInput.value = '';
        playerNameInput.focus();
    }

    function showGameScreen() {
        lastActiveGame = 'game1';
        registrationScreen.style.display = 'none';
        gameSelectionScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        gameScreen2.style.display = 'none';
        gameScreen3.style.display = 'none';
        leadersScreen.style.display = 'none';
        
        if (typeof resetBulbsGame === 'function') resetBulbsGame();
        
        if (typeof updateLevelInfo === 'function') updateLevelInfo();
    }

    function showGameScreen2() {
        lastActiveGame = 'game2';
        registrationScreen.style.display = 'none';
        gameSelectionScreen.style.display = 'none';
        gameScreen.style.display = 'none';
        gameScreen2.style.display = 'block';
        gameScreen3.style.display = 'none';
        leadersScreen.style.display = 'none';
        
        setTimeout(() => {
            if (typeof updateMouseGameUI === 'function') {
                updateMouseGameUI();
            }
        }, 100);
    }
    
    function showGameScreen3() {
        lastActiveGame = 'game3';
        registrationScreen.style.display = 'none';
        gameSelectionScreen.style.display = 'none';
        gameScreen.style.display = 'none';
        gameScreen2.style.display = 'none';
        gameScreen3.style.display = 'block';
        leadersScreen.style.display = 'none';
        
        setTimeout(() => {
            if (typeof updateFrogGameUI === 'function') {
                updateFrogGameUI();
            }
        }, 100);
    }

    function showLeadersScreen(fromGame = '') {
        if (fromGame) {
            lastActiveGame = fromGame;
        }
        
        registrationScreen.style.display = 'none';
        gameSelectionScreen.style.display = 'none';
        gameScreen.style.display = 'none';
        gameScreen2.style.display = 'none';
        gameScreen3.style.display = 'none';
        leadersScreen.style.display = 'block';
        updateLeadersTable();
    }

    function showGameScreenFromLeaders() {
        if (!lastActiveGame) {
            showGameSelectionScreen();
            return;
        }
        
        switch(lastActiveGame) {
            case 'game1':
                showGameScreen();
                break;
            case 'game2':
                showGameScreen2();
                break;
            case 'game3':
                showGameScreen3();
                break;
            default:
                showGameSelectionScreen();
        }
    }

    function updateLeadersTable() {
        const combinedLeaders = getCombinedLeaders();
        const sortedLeaders = [...combinedLeaders].sort((a, b) => b.totalScore - a.totalScore);
        
        leadersTable.innerHTML = '';
        
        if (sortedLeaders.length === 0) {
            leadersTable.innerHTML = '<p style="padding: 20px; opacity: 0.7;">Пока нет результатов</p>';
            return;
        }
        
        sortedLeaders.slice(0, 10).forEach((leader, index) => {
            const row = document.createElement('div');
            row.className = 'leader-row ' + (leader.name === currentPlayer ? 'current-player' : '');
            
            row.title = 'Лампочки: ' + leader.bulbScore + ' | Мышка: ' + leader.mouseScore + ' | Лягушка: ' + leader.frogScore;
            
            row.innerHTML = '<div class="leader-rank">' + (index + 1) + '</div><div class="leader-name">' + leader.name + '</div><div class="leader-score">' + leader.totalScore + '</div><div class="leader-details" style="font-size: 12px; color: #666; display: none;">Л:' + leader.bulbScore + ' М:' + leader.mouseScore + ' Ж:' + leader.frogScore + '</div>';
            
            leadersTable.appendChild(row);
        });
    }

    function getCombinedLeaders() {
        const combinedMap = new Map();
        
        const bulbLeaders = JSON.parse(localStorage.getItem('bulbGameLeaders')) || [];
        bulbLeaders.forEach(leader => {
            combinedMap.set(leader.name, {
                name: leader.name,
                totalScore: Number(leader.score) || 0,
                bulbScore: Number(leader.score) || 0,
                mouseScore: 0,
                frogScore: 0,
                bulbLevel: Number(leader.level) || 1,
                mouseLevel: 1,
                frogLevel: 1
            });
        });
        
        const mouseLeaders = JSON.parse(localStorage.getItem('mouseGameLeaders')) || [];
        mouseLeaders.forEach(leader => {
            const mouseScore = Number(leader.score) || 0;
            const existing = combinedMap.get(leader.name);
            
            if (existing) {
                existing.totalScore += mouseScore;
                existing.mouseScore = mouseScore;
                existing.mouseLevel = Number(leader.level) || 1;
            } else {
                combinedMap.set(leader.name, {
                    name: leader.name,
                    totalScore: mouseScore,
                    bulbScore: 0,
                    mouseScore: mouseScore,
                    frogScore: 0,
                    bulbLevel: 1,
                    mouseLevel: Number(leader.level) || 1,
                    frogLevel: 1
                });
            }
        });
        
        const frogLeaders = JSON.parse(localStorage.getItem('frogGameLeaders')) || [];
        frogLeaders.forEach(leader => {
            const frogScore = Number(leader.score) || 0;
            const existing = combinedMap.get(leader.name);
            
            if (existing) {
                existing.totalScore += frogScore;
                existing.frogScore = frogScore;
                existing.frogLevel = Number(leader.level) || 1;
            } else {
                combinedMap.set(leader.name, {
                    name: leader.name,
                    totalScore: frogScore,
                    bulbScore: 0,
                    mouseScore: 0,
                    frogScore: frogScore,
                    bulbLevel: 1,
                    mouseLevel: 1,
                    frogLevel: Number(leader.level) || 1
                });
            }
        });
        
        return Array.from(combinedMap.values());
    }

    function saveBulbPlayerResult() {
        if (!currentPlayer) {
            return;
        }
        
        let currentScore = 0;
        let currentLevel = 1;
        if (typeof getBulbsGameProgress === 'function') {
            const progress = getBulbsGameProgress();
            currentScore = Number(progress.score) || 0;
            currentLevel = Number(progress.level) || 1;
        }
        
        const result = {
            name: currentPlayer,
            score: currentScore,
            level: currentLevel,
            timestamp: new Date().toISOString()
        };
        
        let bulbLeaders = JSON.parse(localStorage.getItem('bulbGameLeaders')) || [];
        const existingIndex = bulbLeaders.findIndex(leader => leader.name === currentPlayer);
        
        if (existingIndex !== -1) {
            if (currentScore > bulbLeaders[existingIndex].score) {
                bulbLeaders[existingIndex] = result;
            } else {
                bulbLeaders[existingIndex].level = Math.max(bulbLeaders[existingIndex].level, currentLevel);
                bulbLeaders[existingIndex].timestamp = new Date().toISOString();
            }
        } else {
            bulbLeaders.push(result);
        }
        
        localStorage.setItem('bulbGameLeaders', JSON.stringify(bulbLeaders));
        updateLeadersTable();
    }

    window.saveMouseGameResult = function() {
        if (!currentPlayer) {
            return;
        }
        
        const mouseProgress = getMouseGameProgress();
        const mouseScore = Number(mouseProgress.score) || 0;
        const mouseLevel = Number(mouseProgress.level) || 1;
        
        const mouseResult = {
            name: currentPlayer,
            score: mouseScore,
            level: mouseLevel,
            timestamp: new Date().toISOString()
        };
        
        let mouseLeaders = JSON.parse(localStorage.getItem('mouseGameLeaders')) || [];
        const existingIndex = mouseLeaders.findIndex(leader => leader.name === currentPlayer);
        
        if (existingIndex !== -1) {
            if (mouseScore > mouseLeaders[existingIndex].score) {
                mouseLeaders[existingIndex] = mouseResult;
            } else {
                mouseLeaders[existingIndex].level = Math.max(mouseLeaders[existingIndex].level, mouseLevel);
                mouseLeaders[existingIndex].timestamp = new Date().toISOString();
            }
        } else {
            mouseLeaders.push(mouseResult);
        }
        
        localStorage.setItem('mouseGameLeaders', JSON.stringify(mouseLeaders));
        updateLeadersTable();
    };

    window.saveFrogGameResult = function() {
        if (!currentPlayer) {
            return;
        }
        
        let frogScore = 0;
        let frogLevel = 1;
        if (typeof getFrogGameProgress === 'function') {
            const progress = getFrogGameProgress();
            frogScore = Number(progress.score) || 0;
            frogLevel = Number(progress.level) || 1;
        } else if (window.frogGame) {
            frogScore = Number(window.frogGame.score) || 0;
            frogLevel = Number(window.frogGame.currentRound) || 1;
        }
        
        const frogResult = {
            name: currentPlayer,
            score: frogScore,
            level: frogLevel,
            timestamp: new Date().toISOString()
        };
        
        let frogLeaders = JSON.parse(localStorage.getItem('frogGameLeaders')) || [];
        const existingIndex = frogLeaders.findIndex(leader => leader.name === currentPlayer);
        
        if (existingIndex !== -1) {
            if (frogScore > frogLeaders[existingIndex].score) {
                frogLeaders[existingIndex] = frogResult;
            } else {
                frogLeaders[existingIndex].level = Math.max(frogLeaders[existingIndex].level, frogLevel);
                frogLeaders[existingIndex].timestamp = new Date().toISOString();
            }
        } else {
            frogLeaders.push(frogResult);
        }
        
        localStorage.setItem('frogGameLeaders', JSON.stringify(frogLeaders));
        updateLeadersTable();
    };

    window.debugLeaderboards = function() {
        const bulbLeaders = JSON.parse(localStorage.getItem('bulbGameLeaders')) || [];
        const mouseLeaders = JSON.parse(localStorage.getItem('mouseGameLeaders')) || [];
        const frogLeaders = JSON.parse(localStorage.getItem('frogGameLeaders')) || [];
        const combined = getCombinedLeaders();
    };

    window.getCurrentPlayer = function() {
        return currentPlayer;
    };

    window.savePlayerResult = saveBulbPlayerResult;
    window.saveBulbPlayerResult = saveBulbPlayerResult;
    window.showGameScreen = showGameScreen;
    window.showGameScreen2 = showGameScreen2;
    window.showGameScreen3 = showGameScreen3;
    window.showGameSelectionScreen = showGameSelectionScreen;
    window.showLeadersScreen = showLeadersScreen;
    window.updateLeadersTable = updateLeadersTable;

    initGame();
});