// AI Defender - Renodlad p5.js version
// Alla Phaser-beroenden har tagits bort

// Globala variabler
let player;
let bullets = [];
let enemies = [];
let powerUps = [];
let particles = [];
let starfield;
let gameState = {
    score: 0,
    level: 1,
    lives: 3,
    gameOver: false,
    paused: false
};

// Boss-variabler
let boss = null;
let bossActive = false;

// Setup - körs en gång vid start
function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('game-container');
    
    // Initiera spelet
    starfield = new Starfield();
    player = new Player(width/2, height - 50);
    
    // Starta fiendespawning
    window.enemySpawnInterval = setInterval(spawnEnemy, 2000);
}

// Draw - körs varje frame
function draw() {
    background(10, 10, 31);
    
    // Rita stjärnfält
    starfield.update();
    starfield.display();
    
    if (!gameState.gameOver && !gameState.paused) {
        // Uppdatera och visa spelaren
        player.update();
        player.display();
        
        // Hantera input
        handleInput();
        
        // Uppdatera och visa fiender
        updateEnemies();
        
        // Uppdatera och visa boss om aktiv
        if (boss && bossActive) {
            boss.update();
            boss.display();
            checkBossCollisions();
        }
        
        // Uppdatera och visa kulor
        updateBullets();
        
        // Uppdatera och visa power-ups
        updatePowerUps();
        
        // Uppdatera partiklar
        updateParticles();
        
        // Kolla om det är dags för boss
        checkBossSpawn();
    }
    
    // Rita UI
    drawUI();
    
    // Hantera game over
    if (gameState.gameOver) {
        drawGameOver();
    }
}

// Spelarklass
class Player {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.size = 20;
        this.speed = 5;
        this.weaponLevel = 1;
        this.shield = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
    }
    
    update() {
        // Uppdatera oövervinnlighet
        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
    }
    
    display() {
        push();
        if (this.invincible && frameCount % 10 < 5) {
            fill(100, 100, 100, 150);
        } else {
            fill(50, 150, 255);
        }
        stroke(255);
        strokeWeight(2);
        
        // Rita skepp
        beginShape();
        vertex(this.pos.x, this.pos.y - this.size);
        vertex(this.pos.x - this.size, this.pos.y + this.size);
        vertex(this.pos.x, this.pos.y + this.size/2);
        vertex(this.pos.x + this.size, this.pos.y + this.size);
        endShape(CLOSE);
        
        // Rita sköld
        if (this.shield > 0) {
            noFill();
            stroke(100, 100, 255, 150);
            strokeWeight(2);
            ellipse(this.pos.x, this.pos.y, this.size * 3);
        }
        pop();
    }
    
    shoot() {
        // Olika vapen beroende på nivå
        switch(this.weaponLevel) {
            case 1:
                bullets.push(new Bullet(this.pos.x, this.pos.y - 20, 0, -10));
                break;
            case 2:
                bullets.push(new Bullet(this.pos.x - 10, this.pos.y - 15, 0, -10));
                bullets.push(new Bullet(this.pos.x + 10, this.pos.y - 15, 0, -10));
                break;
            case 3:
                bullets.push(new Bullet(this.pos.x, this.pos.y - 20, 0, -10));
                bullets.push(new Bullet(this.pos.x - 15, this.pos.y - 15, -2, -8));
                bullets.push(new Bullet(this.pos.x + 15, this.pos.y - 15, 2, -8));
                break;
        }
    }
    
    takeDamage() {
        if (this.invincible) return false;
        
        if (this.shield > 0) {
            this.shield--;
            this.invincible = true;
            this.invincibleTimer = 60;
            return false;
        } else {
            this.invincible = true;
            this.invincibleTimer = 120;
            return true;
        }
    }
}

// Fiendeklass
class Enemy {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, random(1, 3));
        this.size = 20;
        this.health = 1;
        this.points = 10;
        this.color = color(255, 100, 100);
    }
    
    update() {
        this.pos.add(this.vel);
    }
    
    display() {
        push();
        fill(this.color);
        stroke(255);
        strokeWeight(2);
        ellipse(this.pos.x, this.pos.y, this.size * 2);
        pop();
    }
    
    takeDamage(damage) {
        this.health -= damage;
        return this.health <= 0;
    }
    
    isOffScreen() {
        return this.pos.y > height + 50;
    }
}

// Neural Network Boss
class NeuralNetworkBoss {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.size = 80;
        this.health = 50;
        this.maxHealth = 50;
        this.phase = 1;
        this.attackTimer = 0;
        this.pattern = 0;
        this.nodes = [];
        
        // Skapa neural network noder
        for (let i = 0; i < 6; i++) {
            this.nodes.push({
                angle: (TWO_PI / 6) * i,
                offset: 0,
                active: false
            });
        }
    }
    
    update() {
        // Rör sig in i position
        if (this.pos.y < 150) {
            this.pos.y += 1;
        } else {
            // Boss AI
            this.pos.x = width/2 + sin(frameCount * 0.01) * 200;
            
            // Attack patterns
            this.attackTimer++;
            if (this.attackTimer > 120) {
                this.attack();
                this.attackTimer = 0;
            }
            
            // Uppdatera noder
            for (let i = 0; i < this.nodes.length; i++) {
                let node = this.nodes[i];
                node.offset = sin(frameCount * 0.05 + i) * 20;
                node.active = sin(frameCount * 0.1 + i) > 0;
            }
        }
        
        // Byt fas baserat på hälsa
        if (this.health < this.maxHealth * 0.66 && this.phase === 1) {
            this.phase = 2;
        } else if (this.health < this.maxHealth * 0.33 && this.phase === 2) {
            this.phase = 3;
        }
    }
    
    display() {
        push();
        
        // Rita kopplingar mellan noder
        stroke(100, 200, 255, 100);
        strokeWeight(2);
        for (let i = 0; i < this.nodes.length; i++) {
            let node1 = this.nodes[i];
            let node2 = this.nodes[(i + 1) % this.nodes.length];
            
            let x1 = this.pos.x + cos(node1.angle) * (this.size + node1.offset);
            let y1 = this.pos.y + sin(node1.angle) * (this.size + node1.offset);
            let x2 = this.pos.x + cos(node2.angle) * (this.size + node2.offset);
            let y2 = this.pos.y + sin(node2.angle) * (this.size + node2.offset);
            
            line(x1, y1, x2, y2);
        }
        
        // Rita huvudkropp
        fill(50, 50, 150);
        stroke(100, 200, 255);
        strokeWeight(3);
        ellipse(this.pos.x, this.pos.y, this.size * 2);
        
        // Rita noder
        for (let node of this.nodes) {
            let x = this.pos.x + cos(node.angle) * (this.size + node.offset);
            let y = this.pos.y + sin(node.angle) * (this.size + node.offset);
            
            if (node.active) {
                fill(255, 100, 100);
            } else {
                fill(100, 100, 255);
            }
            ellipse(x, y, 30);
        }
        
        // Rita hälsomätare
        let healthPercent = this.health / this.maxHealth;
        fill(255 * (1 - healthPercent), 255 * healthPercent, 0);
        noStroke();
        rect(this.pos.x - this.size, this.pos.y - this.size - 20, this.size * 2 * healthPercent, 10);
        
        pop();
    }
    
    attack() {
        switch(this.phase) {
            case 1:
                // Fas 1: Cirkulär attack
                for (let i = 0; i < 8; i++) {
                    let angle = (TWO_PI / 8) * i;
                    bullets.push(new EnemyBullet(
                        this.pos.x + cos(angle) * 40,
                        this.pos.y + sin(angle) * 40,
                        cos(angle) * 3,
                        sin(angle) * 3
                    ));
                }
                break;
                
            case 2:
                // Fas 2: Riktad attack mot spelaren
                let toPlayer = p5.Vector.sub(player.pos, this.pos).normalize();
                for (let i = -2; i <= 2; i++) {
                    let angle = atan2(toPlayer.y, toPlayer.x) + i * 0.2;
                    bullets.push(new EnemyBullet(
                        this.pos.x,
                        this.pos.y,
                        cos(angle) * 5,
                        sin(angle) * 5
                    ));
                }
                break;
                
            case 3:
                // Fas 3: Kaos!
                for (let i = 0; i < 12; i++) {
                    let angle = random(TWO_PI);
                    let speed = random(2, 6);
                    bullets.push(new EnemyBullet(
                        this.pos.x,
                        this.pos.y,
                        cos(angle) * speed,
                        sin(angle) * speed
                    ));
                }
                break;
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
        
        // Skapa partiklar vid träff
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(
                this.pos.x + random(-this.size, this.size),
                this.pos.y + random(-this.size, this.size),
                color(100, 200, 255)
            ));
        }
        
        return this.health <= 0;
    }
}

// Bullet-klass
class Bullet {
    constructor(x, y, vx, vy) {
        this.pos = createVector(x, y);
        this.vel = createVector(vx, vy);
        this.size = 6;
        this.damage = 1;
    }
    
    update() {
        this.pos.add(this.vel);
    }
    
    display() {
        push();
        fill(100, 200, 255);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.size);
        pop();
    }
    
    isOffScreen() {
        return this.pos.y < -10 || this.pos.y > height + 10 ||
               this.pos.x < -10 || this.pos.x > width + 10;
    }
}

// Enemy Bullet-klass
class EnemyBullet extends Bullet {
    display() {
        push();
        fill(255, 100, 100);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.size);
        pop();
    }
}

// Power-up klass
class PowerUp {
    constructor(x, y, type) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 1);
        this.type = type;
        this.size = 15;
        this.collected = false;
        
        // Sätt färg baserat på typ
        switch(type) {
            case 'weapon':
                this.color = color(255, 100, 100);
                break;
            case 'shield':
                this.color = color(100, 100, 255);
                break;
            case 'life':
                this.color = color(100, 255, 100);
                break;
            default:
                this.color = color(255, 255, 100);
        }
    }
    
    update() {
        this.pos.add(this.vel);
    }
    
    display() {
        push();
        fill(this.color);
        stroke(255);
        strokeWeight(2);
        
        // Pulsera
        let pulseSize = this.size + sin(frameCount * 0.1) * 5;
        ellipse(this.pos.x, this.pos.y, pulseSize);
        pop();
    }
    
    isOffScreen() {
        return this.pos.y > height + 50;
    }
}

// Partikel-klass för effekter
class Particle {
    constructor(x, y, col) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D().mult(random(1, 5));
        this.lifetime = 255;
        this.color = col;
        this.size = random(3, 8);
    }
    
    update() {
        this.pos.add(this.vel);
        this.lifetime -= 5;
        this.vel.mult(0.98);
    }
    
    display() {
        push();
        noStroke();
        fill(red(this.color), green(this.color), blue(this.color), this.lifetime);
        ellipse(this.pos.x, this.pos.y, this.size);
        pop();
    }
    
    isDead() {
        return this.lifetime <= 0;
    }
}

// Stjärnfält för bakgrund
class Starfield {
    constructor() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: random(width),
                y: random(height),
                size: random(1, 3),
                speed: random(0.5, 2)
            });
        }
    }
    
    update() {
        for (let star of this.stars) {
            star.y += star.speed;
            if (star.y > height) {
                star.y = 0;
                star.x = random(width);
            }
        }
    }
    
    display() {
        push();
        fill(255);
        noStroke();
        for (let star of this.stars) {
            ellipse(star.x, star.y, star.size);
        }
        pop();
    }
}

// Hjälpfunktioner
function handleInput() {
    // Rörelse
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // A
        player.pos.x -= player.speed;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // D
        player.pos.x += player.speed;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { // W
        player.pos.y -= player.speed;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { // S
        player.pos.y += player.speed;
    }
    
    // Begränsa till skärmen
    player.pos.x = constrain(player.pos.x, player.size, width - player.size);
    player.pos.y = constrain(player.pos.y, player.size, height - player.size);
    
    // Skjut
    if (keyIsDown(32) && frameCount % 10 === 0) { // Space
        player.shoot();
    }
}

function spawnEnemy() {
    // Spawna inte vanliga fiender om boss är aktiv
    if (bossActive) return;
    
    let x = random(50, width - 50);
    enemies.push(new Enemy(x, -30));
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        enemy.update();
        enemy.display();
        
        // Ta bort om utanför skärmen
        if (enemy.isOffScreen()) {
            enemies.splice(i, 1);
            continue;
        }
        
        // Kolla kollision med spelare
        if (dist(enemy.pos.x, enemy.pos.y, player.pos.x, player.pos.y) < enemy.size + player.size) {
            if (player.takeDamage()) {
                gameState.lives--;
                if (gameState.lives <= 0) {
                    gameState.gameOver = true;
                    showHighscoreForm();
                }
            }
            enemies.splice(i, 1);
            createExplosion(enemy.pos.x, enemy.pos.y);
        }
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        bullet.update();
        bullet.display();
        
        // Ta bort om utanför skärmen
        if (bullet.isOffScreen()) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Kolla kollisioner
        if (bullet instanceof EnemyBullet) {
            // Fiendens kulor träffar spelaren
            if (dist(bullet.pos.x, bullet.pos.y, player.pos.x, player.pos.y) < bullet.size + player.size) {
                if (player.takeDamage()) {
                    gameState.lives--;
                    if (gameState.lives <= 0) {
                        gameState.gameOver = true;
                        showHighscoreForm();
                    }
                }
                bullets.splice(i, 1);
                createExplosion(player.pos.x, player.pos.y);
            }
        } else {
            // Spelarens kulor träffar fiender
            for (let j = enemies.length - 1; j >= 0; j--) {
                let enemy = enemies[j];
                if (dist(bullet.pos.x, bullet.pos.y, enemy.pos.x, enemy.pos.y) < bullet.size + enemy.size) {
                    if (enemy.takeDamage(bullet.damage)) {
                        gameState.score += enemy.points;
                        enemies.splice(j, 1);
                        createExplosion(enemy.pos.x, enemy.pos.y);
                        
                        // Chans för power-up
                        if (random() < 0.2) {
                            let types = ['weapon', 'shield', 'life'];
                            let type = random(types);
                            powerUps.push(new PowerUp(enemy.pos.x, enemy.pos.y, type));
                        }
                    }
                    bullets.splice(i, 1);
                    break;
                }
            }
            
            // Kolla träff på boss
            if (boss && bossActive) {
                if (dist(bullet.pos.x, bullet.pos.y, boss.pos.x, boss.pos.y) < bullet.size + boss.size) {
                    if (boss.takeDamage(bullet.damage)) {
                        // Boss besegrad!
                        bossDefeated();
                    }
                    bullets.splice(i, 1);
                }
            }
        }
    }
}

function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        let powerUp = powerUps[i];
        powerUp.update();
        powerUp.display();
        
        // Ta bort om utanför skärmen
        if (powerUp.isOffScreen()) {
            powerUps.splice(i, 1);
            continue;
        }
        
        // Kolla uppsamling
        if (dist(powerUp.pos.x, powerUp.pos.y, player.pos.x, player.pos.y) < powerUp.size + player.size) {
            collectPowerUp(powerUp);
            powerUps.splice(i, 1);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let particle = particles[i];
        particle.update();
        particle.display();
        
        if (particle.isDead()) {
            particles.splice(i, 1);
        }
    }
}

function collectPowerUp(powerUp) {
    switch(powerUp.type) {
        case 'weapon':
            player.weaponLevel = min(player.weaponLevel + 1, 3);
            break;
        case 'shield':
            player.shield = min(player.shield + 1, 3);
            break;
        case 'life':
            gameState.lives = min(gameState.lives + 1, 5);
            break;
    }
}

function createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(x, y, color(255, random(100, 200), 0)));
    }
}

function checkBossSpawn() {
    // Spawna boss var 5:e nivå eller vid vissa poäng
    if (gameState.score > 0 && gameState.score % 1000 === 0 && !bossActive && !boss) {
        spawnBoss();
    }
}

function spawnBoss() {
    // Rensa vanliga fiender
    enemies = [];
    
    // Stoppa vanlig spawning
    clearInterval(window.enemySpawnInterval);
    
    // Skapa boss
    boss = new NeuralNetworkBoss(width/2, -100);
    bossActive = true;
}

function checkBossCollisions() {
    // Boss kolliderar med spelare
    if (dist(boss.pos.x, boss.pos.y, player.pos.x, player.pos.y) < boss.size + player.size) {
        if (player.takeDamage()) {
            gameState.lives--;
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
                showHighscoreForm();
            }
        }
    }
}

function bossDefeated() {
    // Skapa massiv explosion
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle(
            boss.pos.x + random(-boss.size, boss.size),
            boss.pos.y + random(-boss.size, boss.size),
            color(random(100, 255), random(100, 255), random(100, 255))
        ));
    }
    
    // Ge poäng
    gameState.score += 500;
    
    // Spawna flera power-ups
    for (let i = 0; i < 3; i++) {
        let types = ['weapon', 'shield', 'life'];
        powerUps.push(new PowerUp(
            boss.pos.x + random(-50, 50),
            boss.pos.y + random(-50, 50),
            random(types)
        ));
    }
    
    // Ta bort boss
    boss = null;
    bossActive = false;
    
    // Öka nivå
    gameState.level++;
    
    // Starta vanlig spawning igen
    window.enemySpawnInterval = setInterval(spawnEnemy, max(500, 2000 - gameState.level * 100));
}

function drawUI() {
    push();
    fill(255);
    textAlign(LEFT, TOP);
    textSize(20);
    text(`Poäng: ${gameState.score}`, 10, 10);
    text(`Nivå: ${gameState.level}`, 10, 35);
    text(`Liv: ${gameState.lives}`, 10, 60);
    
    // Visa vapennivå
    textAlign(RIGHT, TOP);
    text(`Vapen: ${'▲'.repeat(player.weaponLevel)}`, width - 10, 10);
    
    // Visa sköld
    if (player.shield > 0) {
        text(`Sköld: ${'◆'.repeat(player.shield)}`, width - 10, 35);
    }
    pop();
}

function drawGameOver() {
    push();
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);
    
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(48);
    text("GAME OVER", width/2, height/2 - 50);
    
    textSize(24);
    text(`Slutpoäng: ${gameState.score}`, width/2, height/2 + 20);
    text("Tryck ENTER för att starta om", width/2, height/2 + 60);
    pop();
}

function keyPressed() {
    if (keyCode === ENTER && gameState.gameOver) {
        resetGame();
    }
}

function resetGame() {
    // Återställ gameState
    gameState = {
        score: 0,
        level: 1,
        lives: 3,
        gameOver: false,
        paused: false
    };
    
    // Återställ arrays
    bullets = [];
    enemies = [];
    powerUps = [];
    particles = [];
    
    // Återställ boss
    boss = null;
    bossActive = false;
    
    // Skapa ny spelare
    player = new Player(width/2, height - 50);
    
    // Starta spawning igen
    clearInterval(window.enemySpawnInterval);
    window.enemySpawnInterval = setInterval(spawnEnemy, 2000);
    
    // Dölj highscore-formulär
    document.getElementById('highscore-form').classList.add('hidden');
}

// Visa highscore-formulär när spelet är slut
function showHighscoreForm() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('score-input').value = gameState.score;
    document.getElementById('highscore-form').classList.remove('hidden');
}