// GameScene - Hanterar spelets huvudlogik
class GameScene {
    constructor() {
        // Spelarens egenskaper
        this.playerSpeed = 5;
        this.playerFireRate = 15;
        this.playerWeaponLevel = 1;
        
        // Fiende-egenskaper
        this.enemySpeed = 2;
        this.spawnRate = 2000;
        
        // Spelvariabler
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameOver = false;
        
        // Power-up variabler
        this.powerUpProb = 0.1;
        this.activePowerUps = {};
        
        // Bakgrundshantering
        this.starfield = null;
        
        // Spelobjekt
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
        this.explosions = [];
    }

    setup() {
        console.log("GameScene setup");
        
        try {
            // Skapa starfield (redan p5.js-kompatibel)
            this.starfield = new Starfield();
            
            // Skapa spelare
            this.player = new Player(width / 2, height - 50);
            console.log("Player created:", this.player);
            
            // Starta fiendespawning med säkerhetscheck
            if (typeof setInterval === 'function') {
                this.enemySpawnInterval = setInterval(() => {
                    this.spawnEnemy();
                }, this.spawnRate);
            } else {
                console.error("setInterval not available!");
            }
            
            // Ställ in globala speldata
            if (typeof gameState !== 'undefined') {
                gameState.score = this.score;
                gameState.level = this.level;
                gameState.lives = this.lives;
                gameState.gameOver = this.gameOver;
            }
            
            console.log("GameScene setup complete");
        } catch (e) {
            console.error("Error in GameScene setup:", e);
        }
    }
    
    draw() {
        if (this.gameOver) return;
        
        // Uppdatera bakgrunden (starfield)
        this.starfield.update();
        this.starfield.display();
        
        // Uppdatera spelaren
        this.player.update();
        this.player.display();
        
        // Hantera fiender
        this.updateEnemies();
        
        // Hantera skott
        this.updateBullets();
        
        // Hantera power-ups
        this.updatePowerUps();
        
        // Hantera kollisioner
        this.checkCollisions();
        
        // Rita UI
        this.drawUI();
    }

    // Konvertera resten av metoderna från Phaser till p5.js
    spawnEnemy() {
        const x = random(50, width - 50);
        const y = -20;
        const enemy = new Enemy(x, y);
        this.enemies.push(enemy);
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update();
            enemy.display();
            
            // Ta bort fiender som lämnar skärmen
            if (enemy.pos.y > height + 50) {
                this.enemies.splice(i, 1);
            }
        }
    }
    
    // ... Fortsätt konvertera metoder
}

// Skapa en global GameScene-instans som spelet kan använda
let gameScene;