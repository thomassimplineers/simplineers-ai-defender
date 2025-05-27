// Spelscen som hanterar huvudspelloopen med Neural Network Boss support
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Grundläggande egenskaper
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.explosions = [];
        this.particles = [];
        
        // Boss properties
        this.boss = null;
        this.bossSpawned = false;
        
        // Spelstatus
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameOver = false;
        
        // Timers
        this.enemySpawnTimer = null;
        this.powerUpSpawnTimer = null;
    }

    create() {
        // Skapa spelaren
        this.player = new Player(this, 400, 500);
        
        // Starta spawning
        this.startSpawning();
        
        // Skapa UI
        this.createUI();
        
        // Hantera input
        this.setupInput();
        
        // Kamera-effekter
        this.cameras.main.setBackgroundColor(0x0a0a1f);
        
        // Lägg till partikelsystem för effekter
        this.particleEmitter = this.add.particles('particle');
    }

    update() {
        if (this.gameOver) return;
        
        // Uppdatera spelaren
        this.player.update();
        
        // Uppdatera fiender
        this.updateEnemies();
        
        // Uppdatera boss om den finns
        if (this.boss) {
            this.boss.update();
            this.checkBossCollisions();
        }
        
        // Uppdatera kulor
        this.updateBullets();
        
        // Uppdatera power-ups
        this.updatePowerUps();
        
        // Kolla kollisioner
        this.checkCollisions();
        
        // Uppdatera UI
        this.updateUI();
        
        // Kolla om det är dags för boss (Level 10)
        if (this.level === 10 && !this.bossSpawned && this.enemies.length === 0) {
            this.spawnBoss();
        }
    }

    spawnBoss() {
        if (this.bossSpawned) return;
        
        // Stoppa vanlig fiendespawning
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.destroy();
        }
        
        // Visa boss-varning
        this.showBossWarning();
        
        // Spawna bossen efter varningen
        this.time.delayedCall(3000, () => {
            this.boss = new NeuralNetworkBoss(400, -150);
            this.bossSpawned = true;
            
            // Lägg till boss musik eller effekter här
            this.cameras.main.shake(500, 0.02);
        });
    }

    showBossWarning() {
        const warningText = this.add.text(400, 300, 'NEURAL NETWORK BOSS APPROACHING!', {
            fontSize: '32px',
            fill: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Blinka texten
        this.tweens.add({
            targets: warningText,
            alpha: 0,
            ease: 'Power2',
            duration: 500,
            repeat: 5,
            yoyo: true,
            onComplete: () => {
                warningText.destroy();
            }
        });
    }

    checkBossCollisions() {
        if (!this.boss || !this.player) return;
        
        // Kolla kollision mellan spelare och boss
        if (this.checkOverlap(this.player, this.boss)) {
            this.playerHit();
        }
        
        // Kolla kollision mellan spelarens kulor och boss
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            if (this.checkOverlap(bullet, this.boss)) {
                // Boss tar skada
                const destroyed = this.boss.takeDamage(bullet.damage || 1);
                
                if (destroyed) {
                    this.bossDefeated();
                }
                
                // Ta bort kulan
                this.bullets.splice(i, 1);
            }
        }
        
        // Kolla environmental hazards från bossen
        if (this.boss.dataCorruptionZones) {
            for (const zone of this.boss.dataCorruptionZones) {
                const dist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    zone.x, zone.y
                );
                
                if (dist < zone.radius) {
                    this.playerHit();
                }
            }
        }
    }

    bossDefeated() {
        // Anropa boss defeat-metoden
        this.boss.onDefeat();
        
        // Skapa massiv explosion
        this.createMassiveExplosion(this.boss.pos.x, this.boss.pos.y);
        
        // Visa victory message
        const victoryText = this.add.text(400, 250, 'BOSS DEFEATED!', {
            fontSize: '48px',
            fill: '#00ff00',
            stroke: '#ffffff',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        const bonusText = this.add.text(400, 320, '+10000 POINTS!', {
            fontSize: '32px',
            fill: '#ffff00',
            stroke: '#ffffff',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Öka poängen
        this.score += 10000;
        
        // Visa marketing message efter delay
        this.time.delayedCall(3000, () => {
            this.showMarketingMessage();
        });
        
        // Ta bort boss
        this.boss = null;
        
        // Gå till nästa nivå efter en stund
        this.time.delayedCall(5000, () => {
            this.level++;
            this.bossSpawned = false;
            this.startSpawning();
            victoryText.destroy();
            bonusText.destroy();
        });
    }

    showMarketingMessage() {
        // Skapa en container för marketing message
        const container = this.add.container(400, 300);
        
        // Bakgrund
        const bg = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.9);
        container.add(bg);
        
        // Rubrik
        const title = this.add.text(0, -150, 'Du har besegrat AI Overlord!', {
            fontSize: '28px',
            fill: '#00ff00',
            align: 'center'
        }).setOrigin(0.5);
        container.add(title);
        
        // Huvudtext
        const mainText = this.add.text(0, -50, 
            'Men kan du bemästra verklig AI?\n\n' +
            'Upptäck Simplineers AI-kurser\n' +
            'och bli en AI-expert på riktigt!', {
            fontSize: '22px',
            fill: '#ffffff',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);
        container.add(mainText);
        
        // CTA-knapp
        const button = this.add.rectangle(0, 100, 250, 60, 0x4fc3f7);
        const buttonText = this.add.text(0, 100, 'Läs mer om våra kurser', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        container.add(button);
        container.add(buttonText);
        
        // Gör knappen interaktiv
        button.setInteractive();
        button.on('pointerover', () => {
            button.setFillStyle(0x64b5f6);
        });
        button.on('pointerout', () => {
            button.setFillStyle(0x4fc3f7);
        });
        button.on('pointerdown', () => {
            // Öppna Simplineers hemsida eller visa mer info
            console.log('Visa mer info om AI-kurser');
        });
        
        // Stäng-knapp
        const closeButton = this.add.text(280, -180, 'X', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        closeButton.setInteractive();
        closeButton.on('pointerdown', () => {
            container.destroy();
        });
        container.add(closeButton);
        
        // Animera in containern
        container.setScale(0);
        this.tweens.add({
            targets: container,
            scaleX: 1,
            scaleY: 1,
            ease: 'Back.easeOut',
            duration: 500
        });
    }

    createMassiveExplosion(x, y) {
        // Skapa många partiklar
        for (let i = 0; i < 100; i++) {
            const particle = this.particleEmitter.createEmitter({
                x: x,
                y: y,
                speed: { min: 200, max: 600 },
                scale: { start: 1, end: 0 },
                blendMode: 'ADD',
                lifespan: 1000,
                quantity: 1,
                tint: [0xff0000, 0xff6600, 0xffff00]
            });
            
            // Stoppa emitter efter en emission
            particle.explode();
        }
        
        // Skärmskakningseffekt
        this.cameras.main.shake(1000, 0.05);
    }

    checkOverlap(obj1, obj2) {
        if (!obj1 || !obj2) return false;
        
        const dist = Phaser.Math.Distance.Between(
            obj1.x || obj1.pos.x, 
            obj1.y || obj1.pos.y,
            obj2.x || obj2.pos.x, 
            obj2.y || obj2.pos.y
        );
        
        const size1 = obj1.size || obj1.radius || 20;
        const size2 = obj2.size || obj2.radius || 20;
        
        return dist < (size1 + size2);
    }

    startSpawning() {
        // Starta fiendespawning baserat på nivå
        const spawnDelay = Math.max(500, 2000 - (this.level * 100));
        
        this.enemySpawnTimer = this.time.addEvent({
            delay: spawnDelay,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    spawnEnemy() {
        // Spawna inte fiender om boss är aktiv
        if (this.boss) return;
        
        const x = Phaser.Math.Between(50, 750);
        const enemyType = Phaser.Math.Between(0, 2);
        
        let enemy;
        switch(enemyType) {
            case 0:
                enemy = new BasicEnemy(x, -50);
                break;
            case 1:
                enemy = new TankEnemy(x, -50);
                break;
            case 2:
                enemy = new AIModelEnemy(x, -50);
                break;
        }
        
        this.enemies.push(enemy);
    }

    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update();
            
            if (enemy.isOffScreen()) {
                this.enemies.splice(i, 1);
            }
        }
    }

    updateBullets() {
        // Uppdatera spelarens kulor
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();
            
            if (bullet.isOffScreen()) {
                this.bullets.splice(i, 1);
            }
        }
        
        // Uppdatera fiendekulor
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            bullet.update();
            
            if (bullet.isOffScreen()) {
                this.enemyBullets.splice(i, 1);
            }
        }
    }

    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update();
            
            if (powerUp.isOffScreen()) {
                this.powerUps.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        // Kollisioner mellan spelarkulor och fiender
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (this.checkOverlap(bullet, enemy)) {
                    // Fienden tar skada
                    const destroyed = enemy.takeDamage(bullet.damage || 1);
                    
                    if (destroyed) {
                        this.score += enemy.points || 10;
                        this.enemies.splice(j, 1);
                        
                        // Chans att spawna power-up
                        if (Math.random() < 0.1) {
                            this.spawnPowerUp(enemy.pos.x, enemy.pos.y);
                        }
                    }
                    
                    // Ta bort kulan
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }
        
        // Kollisioner mellan spelare och fiender
        for (const enemy of this.enemies) {
            if (this.checkOverlap(this.player, enemy)) {
                this.playerHit();
            }
        }
        
        // Kollisioner mellan spelare och fiendekulor
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            
            if (this.checkOverlap(this.player, bullet)) {
                this.playerHit();
                this.enemyBullets.splice(i, 1);
            }
        }
        
        // Kollisioner mellan spelare och power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            if (this.checkOverlap(this.player, powerUp)) {
                this.player.applyPowerUp(powerUp.type);
                this.powerUps.splice(i, 1);
            }
        }
    }

    playerHit() {
        if (this.player.invincible) return;
        
        this.lives--;
        this.player.makeInvincible();
        
        if (this.lives <= 0) {
            this.gameOver = true;
            this.showGameOver();
        }
    }

    spawnPowerUp(x, y) {
        const types = ['speed', 'weapon', 'shield', 'life'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const powerUp = new PowerUp(x, y, type);
        this.powerUps.push(powerUp);
    }

    createUI() {
        // Skapa UI-text
        this.scoreText = this.add.text(10, 10, 'Score: 0', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        
        this.levelText = this.add.text(400, 10, 'Level: 1', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5, 0);
        
        this.livesText = this.add.text(790, 10, 'Lives: 3', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(1, 0);
    }

    updateUI() {
        this.scoreText.setText(`Score: ${this.score}`);
        this.levelText.setText(`Level: ${this.level}`);
        this.livesText.setText(`Lives: ${this.lives}`);
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    showGameOver() {
        const gameOverText = this.add.text(400, 300, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        const restartText = this.add.text(400, 380, 'Press SPACE to restart', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Lyssna på space för restart
        this.spaceBar.once('down', () => {
            this.scene.restart();
        });
    }
}