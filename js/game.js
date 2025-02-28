// Huvudkonfiguration för spelet
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#0a1929',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    parent: 'game-container',
    scene: [BootScene, MenuScene, GameScene, UIScene]
};

// Globala variabler för hantering av speldata
window.gameState = {
    score: 0,
    level: 1,
    lives: 3,
    gameOver: false,
    highScores: [],
    playerName: '',
    playerEmail: ''
};

// Initiera spelet när fönstret har laddat
window.onload = function() {
    // Starta spelet
    const game = new Phaser.Game(config);
    
    // Hantera högscorelista
    initHighscoreHandlers();
};

// Funktion för att återställa spelstatus
function resetGame() {
    window.gameState.score = 0;
    window.gameState.level = 1;
    window.gameState.lives = 3;
    window.gameState.gameOver = false;
}

// Funktion för att starta ett nytt spel
function startNewGame() {
    resetGame();
    game.scene.start('GameScene');
}

// Funktion för att uppdatera spelstatus och UI
function updateGameState(key, value) {
    window.gameState[key] = value;
    
    // Uppdatera UI om UIScene är aktiv
    const uiScene = game.scene.getScene('UIScene');
    if (uiScene && uiScene.scene.isActive()) {
        uiScene.updateUI();
    }
}

// Funktion för att kontrollera och eventuellt visa högskorelistan
function checkHighScore(score) {
    const lowestScore = window.gameState.highScores.length > 0 ? 
        window.gameState.highScores[window.gameState.highScores.length - 1].score : 0;
    
    if (window.gameState.highScores.length < 10 || score > lowestScore) {
        document.getElementById('highscore-form').classList.remove('hidden');
        return true;
    }
    
    return false;
}