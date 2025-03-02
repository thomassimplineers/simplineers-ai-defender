// UIScene - Ansvarar för att visa spel-UI (poäng, liv, nivåer etc.)
class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
        
        // Referens till aktiva power-ups
        this.activePowerUps = {};
        
        // Referens till boss-varning
        this.bossWarning = null;
    }

    create() {
        // Hämta speldata från gameScene
        const gameScene = this.scene.get('GameScene');
        this.gameData = window.gameState || {
            score: 0,
            level: 1,
            lives: 3,
            gameOver: false
        };
        
        // Skapa UI-element
        this.createScoreText();
        this.createLivesDisplay();
        this.createLevelText();
        this.createPowerUpDisplay();
        
        // Lyssna på händelser från gameScene
        this.events.on('updateScore', this.updateScore, this);
        this.events.on('updateLives', this.updateLives, this);
        this.events.on('updateLevel', this.updateLevel, this);
        
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
    
    update() {
        // Uppdatera UI baserat på speldata
        if (window.gameState) {
            this.updateScore(window.gameState.score);
            this.updateLives(window.gameState.lives);
            this.updateLevel(window.gameState.level);
        }
        
        // Uppdatera power-up-timers
        this.updatePowerUpTimers();
    }
    
    createScoreText() {
        // Skapa poängtext i övre vänstra hörnet
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
    }
    
    createLivesDisplay() {
        // Skapa livsdisplay i övre högra hörnet
        this.livesContainer = this.add.container(this.cameras.main.width - 20, 20);
        this.livesContainer.setDepth(1);
        
        // Skapa livssymboler
        this.updateLives(this.gameData.lives);
    }
    
    createLevelText() {
        // Skapa nivåtext i övre mitten
        this.levelText = this.add.text(this.cameras.main.width / 2, 20, 'LEVEL 1', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0);
    }
    
    createPowerUpDisplay() {
        // Skapa container för power-up-indikatorer
        this.powerUpContainer = this.add.container(20, this.cameras.main.height - 20);
        this.powerUpContainer.setDepth(1);
    }
    
    updateScore(score) {
        // Uppdatera poängtext
        if (this.scoreText) {
            this.scoreText.setText(`SCORE: ${score}`);
        }
    }
    
    updateLives(lives) {
        // Uppdatera livsdisplay
        if (!this.livesContainer) return;
        
        // Rensa befintliga livssymboler
        this.livesContainer.removeAll();
        
        // Skapa nya livssymboler
        for (let i = 0; i < lives; i++) {
            const lifeSymbol = this.add.triangle(
                -30 * i, 0,
                0, -10,
                10, 10,
                -10, 10,
                0x1e88e5
            );
            this.livesContainer.add(lifeSymbol);
        }
    }
    
    updateLevel(level) {
        // Uppdatera nivåtext
        if (this.levelText) {
            this.levelText.setText(`LEVEL ${level}`);
        }
    }
    
    /**
     * Visa en power-up-indikator
     * @param {string} type Power-up-typ
     * @param {number} duration Varaktighet i sekunder
     */
    showPowerUp(type, duration) {
        // Skapa eller uppdatera power-up-indikator
        if (!this.activePowerUps[type]) {
            // Skapa ny indikator
            const container = this.add.container(0, -Object.keys(this.activePowerUps).length * 40);
            
            // Bakgrund
            const bg = this.add.rectangle(0, 0, 120, 30, 0x162b3d, 0.8);
            bg.setStrokeStyle(2, 0x1e88e5);
            
            // Ikon
            let icon;
            let color;
            switch (type) {
                case 'speed':
                    icon = '⚡';
                    color = '#00ffff';
                    break;
                case 'weapon':
                    icon = '🔥';
                    color = '#ff0000';
                    break;
                case 'shield':
                    icon = '🛡️';
                    color = '#1e88e5';
                    break;
                default:
                    icon = '⭐';
                    color = '#ffffff';
            }
            
            const iconText = this.add.text(-50, 0, icon, {
                fontSize: 16
            }).setOrigin(0, 0.5);
            
            // Namn
            const nameText = this.add.text(-30, 0, this.getPowerUpName(type), {
                fontFamily: 'Arial',
                fontSize: 12,
                color: color
            }).setOrigin(0, 0.5);
            
            // Timer
            const timerText = this.add.text(50, 0, `${duration.toFixed(1)}s`, {
                fontFamily: 'Arial',
                fontSize: 12,
                color: '#ffffff'
            }).setOrigin(0, 0.5);
            
            // Lägg till i container
            container.add([bg, iconText, nameText, timerText]);
            
            // Lägg till i power-up-container
            this.powerUpContainer.add(container);
            
            // Spara referens
            this.activePowerUps[type] = {
                container,
                timerText,
                duration,
                startTime: this.time.now
            };
            
            // Animera in
            this.tweens.add({
                targets: container,
                x: 60,
                duration: 300,
                ease: 'Back.easeOut'
            });
        } else {
            // Uppdatera befintlig indikator
            const powerUp = this.activePowerUps[type];
            powerUp.duration = duration;
            powerUp.startTime = this.time.now;
            powerUp.timerText.setText(`${duration.toFixed(1)}s`);
        }
    }
    
    /**
     * Uppdatera timer för en power-up
     * @param {string} type Power-up-typ
     * @param {number} remainingTime Återstående tid i sekunder
     */
    updatePowerUpTime(type, remainingTime) {
        if (this.activePowerUps[type]) {
            const powerUp = this.activePowerUps[type];
            powerUp.timerText.setText(`${remainingTime.toFixed(1)}s`);
            
            // Blinka när tiden nästan är ute
            if (remainingTime < 3) {
                powerUp.timerText.setColor('#ff0000');
                
                if (!powerUp.isBlinking) {
                    powerUp.isBlinking = true;
                    this.tweens.add({
                        targets: powerUp.container,
                        alpha: 0.5,
                        duration: 200,
                        yoyo: true,
                        repeat: -1
                    });
                }
            }
            
            // Ta bort när tiden är ute
            if (remainingTime <= 0) {
                this.removePowerUp(type);
            }
        }
    }
    
    /**
     * Uppdatera alla power-up-timers
     */
    updatePowerUpTimers() {
        const now = this.time.now;
        
        for (const type in this.activePowerUps) {
            const powerUp = this.activePowerUps[type];
            const elapsed = (now - powerUp.startTime) / 1000;
            const remaining = Math.max(0, powerUp.duration - elapsed);
            
            this.updatePowerUpTime(type, remaining);
        }
    }
    
    /**
     * Ta bort en power-up-indikator
     * @param {string} type Power-up-typ
     */
    removePowerUp(type) {
        if (this.activePowerUps[type]) {
            const powerUp = this.activePowerUps[type];
            
            // Animera ut
            this.tweens.add({
                targets: powerUp.container,
                x: -120,
                duration: 300,
                ease: 'Back.easeIn',
                onComplete: () => {
                    powerUp.container.destroy();
                    delete this.activePowerUps[type];
                    
                    // Flytta upp återstående power-ups
                    this.rearrangePowerUps();
                }
            });
        }
    }
    
    /**
     * Flytta upp återstående power-ups efter att en tagits bort
     */
    rearrangePowerUps() {
        let index = 0;
        for (const type in this.activePowerUps) {
            const powerUp = this.activePowerUps[type];
            
            this.tweens.add({
                targets: powerUp.container,
                y: -index * 40,
                duration: 200,
                ease: 'Power2'
            });
            
            index++;
        }
    }
    
    /**
     * Visa en boss-varning
     * @param {number} level Nivå för bossen
     */
    showBossWarning(level) {
        // Ta bort befintlig varning om den finns
        if (this.bossWarning) {
            this.bossWarning.destroy();
        }
        
        // Skapa container för varningen
        this.bossWarning = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
        
        // Bakgrund
        const bg = this.add.rectangle(0, 0, 400, 100, 0x000000, 0.8);
        bg.setStrokeStyle(4, 0xff0000);
        
        // Varningstext
        const warningText = this.add.text(0, -20, 'WARNING!', {
            fontFamily: 'Arial',
            fontSize: 32,
            color: '#ff0000',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Boss-text
        const bossText = this.add.text(0, 20, `LEVEL ${level} BOSS APPROACHING`, {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Lägg till i container
        this.bossWarning.add([bg, warningText, bossText]);
        
        // Animera in
        this.bossWarning.setScale(0);
        this.tweens.add({
            targets: this.bossWarning,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // Blinka bakgrunden
        this.tweens.add({
            targets: bg,
            fillAlpha: 0.4,
            duration: 300,
            yoyo: true,
            repeat: 5
        });
        
        // Ta bort efter en stund
        this.time.delayedCall(3000, () => {
            if (this.bossWarning) {
                this.tweens.add({
                    targets: this.bossWarning,
                    alpha: 0,
                    y: this.bossWarning.y - 50,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        if (this.bossWarning) {
                            this.bossWarning.destroy();
                            this.bossWarning = null;
                        }
                    }
                });
            }
        });
    }
    
    /**
     * Visa game over-skärm
     */
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
    
    /**
     * Dölja game over-skärm
     */
    hideGameOver() {
        this.gameOverText.setVisible(false);
        this.restartButton.setVisible(false);
        this.menuButton.setVisible(false);
        
        // Dölj highscore-formuläret om det visas
        document.getElementById('highscore-form').classList.add('hidden');
    }
    
    /**
     * Uppdatera all information i UI
     */
    updateUI() {
        this.updateScore(window.gameState.score);
        this.updateLives(window.gameState.lives);
        this.updateLevel(window.gameState.level);
        
        if (window.gameState.gameOver) {
            this.showGameOver();
        } else {
            this.hideGameOver();
        }
    }
    
    /**
     * Hämta namn för en power-up-typ
     * @param {string} type Power-up-typ
     * @returns {string} Namn på power-up
     */
    getPowerUpName(type) {
        switch (type) {
            case 'speed':
                return 'SPEED';
            case 'weapon':
                return 'WEAPON';
            case 'shield':
                return 'SHIELD';
            case 'life':
                return 'EXTRA LIFE';
            default:
                return type.toUpperCase();
        }
    }
}