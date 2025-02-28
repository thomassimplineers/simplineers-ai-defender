// UIScene - Ansvarar för att visa spel-UI (poäng, liv, nivåer etc.)
class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        // UI-element för att visa spel-info
        this.scoreText = this.add.text(20, 20, 'Poäng: 0', {
            font: '18px monospace',
            fill: '#ffffff'
        });
        
        this.levelText = this.add.text(20, 50, 'Nivå: 1', {
            font: '18px monospace',
            fill: '#ffffff'
        });
        
        // Skapa liv-indikatorer
        this.livesGroup = this.add.group();
        this.updateLives(window.gameState.lives);
        
        // Skapa power-up-indikatorer
        this.powerUpTexts = {};
        
        // Game Over-text (dold från början)
        this.gameOverText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            'GAME OVER',
            {
                font: '48px monospace',
                fill: '#ff0000',
                stroke: '#ffffff',
                strokeThickness: 2
            }
        );
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setVisible(false);
        
        // Restart-knapp (dold från början)
        this.restartButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50,
            'SPELA IGEN',
            {
                font: '24px monospace',
                fill: '#ffffff',
                backgroundColor: '#1e88e5',
                padding: {
                    x: 15,
                    y: 8
                }
            }
        );
        this.restartButton.setOrigin(0.5);
        this.restartButton.setInteractive({ useHandCursor: true });
        this.restartButton.setVisible(false);
        
        this.restartButton.on('pointerover', () => {
            this.restartButton.setTint(0x90caf9);
        });
        
        this.restartButton.on('pointerout', () => {
            this.restartButton.clearTint();
        });
        
        this.restartButton.on('pointerdown', () => {
            this.hideGameOver();
            this.scene.get('GameScene').scene.restart();
            window.gameState.gameOver = false;
            window.gameState.score = 0;
            window.gameState.level = 1;
            window.gameState.lives = 3;
            this.updateUI();
        });
        
        // Meny-knapp (dold från början)
        this.menuButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            'HUVUDMENY',
            {
                font: '24px monospace',
                fill: '#ffffff',
                backgroundColor: '#1e88e5',
                padding: {
                    x: 15,
                    y: 8
                }
            }
        );
        this.menuButton.setOrigin(0.5);
        this.menuButton.setInteractive({ useHandCursor: true });
        this.menuButton.setVisible(false);
        
        this.menuButton.on('pointerover', () => {
            this.menuButton.setTint(0x90caf9);
        });
        
        this.menuButton.on('pointerout', () => {
            this.menuButton.clearTint();
        });
        
        this.menuButton.on('pointerdown', () => {
            this.hideGameOver();
            this.scene.stop('GameScene');
            this.scene.start('MenuScene');
        });
    }
    
    // Metod för att uppdatera liv-indikatorer
    updateLives(lives) {
        // Rensa tidigare liv
        this.livesGroup.clear(true, true);
        
        // Skapa nya liv-indikatorer
        for (let i = 0; i < lives; i++) {
            const lifeIcon = this.add.triangle(
                200 + (i * 30),
                35,
                0, 15,
                10, 0,
                20, 15,
                0xffffff
            );
            this.livesGroup.add(lifeIcon);
        }
    }
    
    // Metod för att visa en aktiv power-up
    showPowerUp(type, duration) {
        // Om vi redan har denna power-up, ta bort den
        if (this.powerUpTexts[type]) {
            this.powerUpTexts[type].destroy();
        }
        
        // Konvertera typ till läsbart namn
        let powerUpName = 'Power-up';
        switch (type) {
            case 'speed':
                powerUpName = 'Hastighet';
                break;
            case 'weapon':
                powerUpName = 'Vapen';
                break;
            case 'shield':
                powerUpName = 'Sköld';
                break;
        }
        
        // Skapa text med timer
        this.powerUpTexts[type] = this.add.text(
            this.cameras.main.width - 200,
            20 + (Object.keys(this.powerUpTexts).length * 30),
            `${powerUpName}: ${duration}s`,
            {
                font: '16px monospace',
                fill: '#ffff00'
            }
        );
        
        // Uppdatera timern
        let timer = duration;
        const timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                timer--;
                if (timer <= 0) {
                    // Ta bort power-up när den löper ut
                    this.powerUpTexts[type].destroy();
                    delete this.powerUpTexts[type];
                    timerEvent.remove();
                } else {
                    // Uppdatera countdown
                    this.powerUpTexts[type].setText(`${powerUpName}: ${timer}s`);
                }
            },
            callbackScope: this,
            loop: true
        });
    }
    
    // Metod för att visa game over
    showGameOver() {
        this.gameOverText.setVisible(true);
        this.restartButton.setVisible(true);
        this.menuButton.setVisible(true);
        
        // Kontrollera om poängen är hög nog för highscore
        if (checkHighScore(window.gameState.score)) {
            // Visa highscore-formulär om det är ett nytt highscore
            document.getElementById('highscore-form').classList.remove('hidden');
        }
    }
    
    // Metod för att dölja game over
    hideGameOver() {
        this.gameOverText.setVisible(false);
        this.restartButton.setVisible(false);
        this.menuButton.setVisible(false);
        
        // Dölj highscore-formuläret om det visas
        document.getElementById('highscore-form').classList.add('hidden');
    }
    
    // Uppdatera all information i UI
    updateUI() {
        this.scoreText.setText(`Poäng: ${window.gameState.score}`);
        this.levelText.setText(`Nivå: ${window.gameState.level}`);
        this.updateLives(window.gameState.lives);
        
        if (window.gameState.gameOver) {
            this.showGameOver();
        } else {
            this.hideGameOver();
        }
    }
}