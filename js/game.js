// Globala variabler
let player;
let bullets = [];
let enemies = [];
let powerUps = [];
let bosses = [];
let starfield;
let gameState = {
    score: 0,
    level: 1,
    lives: 3,
    gameOver: false
};
let explosions = [];
let scoreFloaters = [];
let combo = 0;
let comboTimer = 0;
let comboMultiplier = 1;
let showingFact = false;
let currentFact = "";
let factTimer = 0;
let playerSkillFactor = 1.0;
let achievements = {
    firstKill: {unlocked: false, name: "AI Novis", description: "Förstör din första fiende"},
    tenKills: {unlocked: false, name: "AI Student", description: "Förstör 10 fiender"},
    bossKiller: {unlocked: false, name: "AI Expert", description: "Besegra en boss"},
    survivalKing: {unlocked: false, name: "AI Champion", description: "Nå nivå 5"},
    collector: {unlocked: false, name: "Datasamlare", description: "Samla 5 powerups"}
};
let powerupCount = 0;
let killCount = 0;
let showAchievement = false;
let currentAchievement = null;
let achievementTimer = 0;
let showingHighscoreForm = false;
let screenShake = 0;
let bossDefeated = false;

// AI-fakta att visa
const aiFacts = [
    "Visste du att neural networks använder 'backpropagation' för att lära sig?",
    "Transformer-modeller revolutionerade NLP 2017 med 'attention mechanism'",
    "Reinforcement Learning hjälpte AI besegra schacklegender",
    "En 'Generative Adversarial Network' består av en generator och en diskriminator",
    "Machine Learning kräver data, algoritmer och beräkningsresurser",
    "Deep Learning är en del av Machine Learning som använder neurala nätverk",
    "Simplineers AI-kurser hjälper ditt företag förstå dessa tekniker!"
];

// Lägg till i början av filen för att säkerställa canvas-skapande
let canvas;

// I början av filen, före setup()
const RETRY_MAX = 5;
let retryCount = 0;

// I början av filen
let gameInstance = null;
let canvasReady = false;

// DirectCanvas nödlösning - garanterar att en canvas finns
function createFallbackCanvas() {
    console.log("EMERGENCY: Creating fallback canvas directly");
    
    // Ta bort eventuell befintlig canvas
    const existingCanvas = document.querySelector('canvas');
    if (existingCanvas) {
        existingCanvas.remove();
    }
    
    // Skapa en DOM-canvas utan p5.js
    const directCanvas = document.createElement('canvas');
    directCanvas.width = 800;
    directCanvas.height = 600;
    directCanvas.id = 'direct-canvas';
    directCanvas.style.border = '3px solid red';
    
    // Infoga i DOM
    const container = document.getElementById('game-container');
    if (container) {
        container.appendChild(directCanvas);
        console.log("DirectCanvas skapad och tillagd i DOM");
        
        // Initiera DirectCanvas-rendering
        setupDirectCanvas(directCanvas);
    } else {
        console.error("Game container not found!");
        // Lägg till i body som sista utväg
        document.body.appendChild(directCanvas);
    }
}

// Separat initialiseringsfunktion för DirectCanvas
function setupDirectCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    
    // Rita bakgrund
    ctx.fillStyle = '#0a0a1f';
    ctx.fillRect(0, 0, 800, 600);
    
    // Visa meddelande om nödläge
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AI DEFENDER - EMERGENCY MODE', 400, 150);
    ctx.fillText('p5.js initialization failed', 400, 200);
    
    // Skapa knappar
    drawButton(ctx, 'STARTA OM', 400, 300, function() {
        location.reload();
    });
    
    drawButton(ctx, 'DIREKTSTART', 400, 370, function() {
        startDirectGame();
    });
    
    // Lägg till event-lyssnare för knappar
    canvas.addEventListener('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Kolla om någon knapp klickades
        checkButtonClick(clickX, clickY);
    });
    
    // Spara knappinformation globalt
    window.directButtons = [];
}

// Hjälpfunktion för att rita knappar
function drawButton(ctx, text, x, y, callback) {
    const buttonWidth = 200;
    const buttonHeight = 50;
    
    // Rita knappen
    ctx.fillStyle = '#1e88e5';
    ctx.fillRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight);
    
    // Rita text
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    
    // Spara knappinformation
    window.directButtons.push({
        x: x - buttonWidth/2,
        y: y - buttonHeight/2,
        width: buttonWidth,
        height: buttonHeight,
        callback: callback
    });
}

// Kontrollera klick på knappar
function checkButtonClick(x, y) {
    for (const button of window.directButtons) {
        if (x >= button.x && 
            x <= button.x + button.width && 
            y >= button.y && 
            y <= button.y + button.height) {
            
            button.callback();
            break;
        }
    }
}

// Starta spelet i direktläge
function startDirectGame() {
    console.log("Starting game in direct mode");
    
    // Försök återigen med p5.js, men med en minimal konfiguration
    try {
        // Återanvänd canvasen om möjligt
        const directCanvas = document.getElementById('direct-canvas');
        
        // Skapa en minimal spelinstans
        window.player = new SimplePlayer(400, 500);
        window.enemies = [];
        
        // Starta en enkel spelloop
        window.gameLoopInterval = setInterval(function() {
            const ctx = directCanvas.getContext('2d');
            
            // Rensa canvas
            ctx.fillStyle = '#0a0a1f';
            ctx.fillRect(0, 0, 800, 600);
            
            // Rita spelaren
            window.player.draw(ctx);
            
            // Rita stjärnor
            drawStars(ctx);
            
            // Visa enkel information
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('DIRECT MODE: Reduced functionality', 10, 20);
            
        }, 1000/60); // 60 FPS
        
        // Lägg till input-hantering
        setupDirectInput(directCanvas);
        
    } catch (e) {
        console.error("Failed to start direct game:", e);
    }
}

// Enkel spelarklass för direktläge
class SimplePlayer {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 20);
        ctx.lineTo(this.x - 15, this.y + 10);
        ctx.lineTo(this.x + 15, this.y + 10);
        ctx.closePath();
        ctx.fill();
    }
    
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        
        // Begränsa till canvas
        this.x = Math.max(20, Math.min(this.x, 780));
        this.y = Math.max(20, Math.min(this.y, 580));
    }
}

// Rita stjärnor för bakgrund
function drawStars(ctx) {
    ctx.fillStyle = '#ffffff';
    
    // Använd en pseudo-slumpmässig metod
    for (let i = 0; i < 100; i++) {
        const x = (i * 17) % 800;
        const y = (i * 23) % 600;
        const size = (i % 3) + 1;
        
        ctx.fillRect(x, y, size, size);
    }
}

// Hantera input för direktläge
function setupDirectInput(canvas) {
    // Tangentbord
    document.addEventListener('keydown', function(e) {
        if (!window.player) return;
        
        const speed = 5;
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
                window.player.move(-speed, 0);
                break;
            case 'ArrowRight':
            case 'd':
                window.player.move(speed, 0);
                break;
            case 'ArrowUp':
            case 'w':
                window.player.move(0, -speed);
                break;
            case 'ArrowDown':
            case 's':
                window.player.move(0, speed);
                break;
        }
    });
}

// Använd DirectCanvas nödlösning direkt vid sidinladdning
window.addEventListener('load', function() {
    // Säkerställ att canvas finns någon gång
    setTimeout(function() {
        if (!document.querySelector('canvas')) {
            console.error("No canvas detected after full page load - forcing DirectCanvas");
            createFallbackCanvas();
        }
    }, 1000);
});

// Ersätt setup med detta
function setup() {
    console.log("P5 setup called with URL: " + window.location.href);
    
    // Använd minimal setup-logik
    try {
        let c = createCanvas(800, 600);
        c.parent('game-container');
        
        // Testa canvas-skapandet omedelbart
        console.log("Canvas created:", c);
        console.log("Canvas exists in DOM:", !!document.querySelector('canvas'));
        
        if (document.querySelector('canvas')) {
            console.log("Canvas exists - continuing with game setup");
            bootScene = new BootScene();
            bootScene.preload();
            setTimeout(() => bootScene.start(), 300);
        } else {
            console.error("Canvas reference exists but no DOM element found!");
            createFallbackCanvas();
        }
        
    } catch (e) {
        console.error("p5.js setup failed:", e);
        createFallbackCanvas();
    }
}

// P5.js draw funktion - körs varje bilduppdatering
function draw() {
    // Rensa skärmen
    background(10, 10, 31);
    
    // Hantera diagnostisk info
    if (DEBUG && DEBUG.ENABLED) {
        DEBUG.status.frame = frameCount;
    }
    
    // Om gameScene är skapad, anropa dess draw-metod
    if (gameScene) {
        gameScene.draw();
    } else {
        // Visa laddningsskärm
        fill(255);
        textSize(24);
        textAlign(CENTER, CENTER);
        text("Laddar...", width/2, height/2);
    }
    
    // Rita debug-information om aktiverad
    if (DEBUG && DEBUG.ENABLED && DEBUG.VISUAL_HELPERS) {
        DEBUG.drawDebugInfo();
    }
}

// Hantera tangentbordsinmatning
function keyPressed() {
    if (keyCode === 83) { // 83 är ASCII/Keycode för 'S'
        if (!gameState.gameOver) {
            fireBullet();
        }
    }
    
    if (keyCode === ENTER && gameState.gameOver) {
        resetGame();
    }
}

// Hantera musklick
function mousePressed() {
    if (!gameState.gameOver && player) {
        fireBullet();
    }
}

// Hjälpfunktioner
function fireBullet() {
    if (!player) return;  // Avbryt om player är undefined
    
    // Olika skottmönster beroende på vapennivå
    switch (player.weaponLevel) {
        case 1:
            // Ett skott rakt fram
            bullets.push(new Bullet(player.pos.x, player.pos.y - 20, 0));
            break;
            
        case 2:
            // Dubbla skott
            bullets.push(new Bullet(player.pos.x - 10, player.pos.y - 15, 0));
            bullets.push(new Bullet(player.pos.x + 10, player.pos.y - 15, 0));
            break;
            
        case 3:
            // Trippla skott med spridning
            bullets.push(new Bullet(player.pos.x, player.pos.y - 20, 0));
            bullets.push(new Bullet(player.pos.x - 12, player.pos.y - 15, -0.2));
            bullets.push(new Bullet(player.pos.x + 12, player.pos.y - 15, 0.2));
            break;
    }
    
    // Kommentera bort ljudet
    // playSound('playerShoot', 0.4);
}

function spawnEnemy() {
    let x = random(50, width - 50);
    let y = -20;
    
    // I grundläggande läge, skapa bara vanliga fiender
    let enemy = new Enemy(x, y);
    
    // När vi har implementerat nya fiender kan vi expandera detta
    if (gameState.level >= 2 && random() < 0.3) {
        enemy = new NeuralNode(x, y);
    }
    
    enemies.push(enemy);
}

function createPowerUp(x, y, forcedType = null) {
    // Mer power-ups tidigt i spelet (nivåer 1-3)
    let types = ['speed', 'weapon', 'shield', 'life'];
    
    // Lägg till nya power-up typer
    if (gameState.level >= 2) types.push('aiAssist');
    if (gameState.level >= 3) types.push('dataOverflow');
    if (gameState.level >= 4) types.push('quantum');
    if (gameState.level >= 5) types.push('knowledge');
    
    // Använd forcedType om specificerad, annars slumpa
    let type = forcedType || random(types);
    
    let powerUp = {
        pos: createVector(x, y),
        vel: createVector(random(-1, 1), random(1, 3)),
        type: type,
        size: 15,
        collected: false,
        displayColor: color(255, 255, 255),
        pulseRadius: 0
    };
    
    // Sätt färg baserat på power-up typ
    switch(type) {
        case 'speed':
            powerUp.displayColor = color(0, 255, 255);
            break;
        case 'weapon':
            powerUp.displayColor = color(255, 100, 100);
            break;
        case 'shield':
            powerUp.displayColor = color(100, 100, 255);
            break;
        case 'life':
            powerUp.displayColor = color(255, 200, 200);
            break;
        case 'aiAssist':
            powerUp.displayColor = color(200, 255, 100);
            break;
        case 'dataOverflow':
            powerUp.displayColor = color(255, 50, 200);
            break;
        case 'quantum':
            powerUp.displayColor = color(150, 0, 255);
            break;
        case 'knowledge':
            powerUp.displayColor = color(255, 220, 0);
            break;
    }
    
    powerUps.push(powerUp);
}

function activatePowerUp(type) {
    // Öka powerupCount och kolla achievement
    powerupCount++;
    if (powerupCount >= 5 && !achievements.collector.unlocked) {
        unlockAchievement('collector');
    }
    
    switch (type) {
        case 'speed':
            player.speed *= 1.5;
            setTimeout(() => { player.speed /= 1.5; }, 10000);
            // playSound('speedUp');
            break;
        case 'weapon':
            player.weaponLevel = min(player.weaponLevel + 1, 3);
            setTimeout(() => { player.weaponLevel = max(player.weaponLevel - 1, 1); }, 15000);
            // playSound('weaponUp');
            break;
        case 'shield':
            player.shield = min(player.shield + 1, 3);
            setTimeout(() => { player.shield = max(player.shield - 1, 0); }, 8000);
            // playSound('shieldUp');
            break;
        case 'life':
            gameState.lives = min(gameState.lives + 1, 5);
            // playSound('lifeUp');
            break;
        case 'bomb':
            // Förstör alla fiender på skärmen
            for (let i = enemies.length - 1; i >= 0; i--) {
                createExplosion(enemies[i].pos.x, enemies[i].pos.y);
                gameState.score += 5;
                enemies.splice(i, 1);
            }
            // playSound('bombExplosion');
            break;
        case 'time':
            // Sakta ner fienderna
            for (let enemy of enemies) {
                enemy.vel.mult(0.5);
            }
            setTimeout(() => {
                for (let enemy of enemies) {
                    if (enemy) enemy.vel.mult(2); // återställ
                }
            }, 8000);
            // playSound('timeWarp');
            break;
    }
}

function screenShake(intensity = 5) {
    let shakeAmount = intensity;
    let shakeX = random(-shakeAmount, shakeAmount);
    let shakeY = random(-shakeAmount, shakeAmount);
    translate(shakeX, shakeY);
}

function createExplosion(x, y, scale = 1) {
    explosions.push(new Explosion(x, y, scale));
    if (scale > 0.8) screenShake(scale * 5);
}

function drawUI() {
    // Top HUD
    fill(0, 0, 0, 150);
    noStroke();
    rect(0, 0, width, 40);
    
    // Poäng
    fill(255);
    textSize(20);
    textAlign(LEFT, CENTER);
    text(`Poäng: ${gameState.score}`, 20, 20);
    
    // Nivå
    textAlign(CENTER, CENTER);
    text(`Nivå: ${gameState.level}`, width/2, 20);
    
    // Liv
    textAlign(RIGHT, CENTER);
    text(`Liv: ${gameState.lives}`, width - 20, 20);
    
    // Combo-mätare om aktiv
    if (combo > 1) {
        fill(255, 255, 0);
        textAlign(CENTER, CENTER);
        textSize(16);
        text(`Combo: ${combo}x (${comboMultiplier}x)`, width/2, 60);
        
        // Combo-timer-bar
        let barWidth = 100;
        let timeLeft = comboTimer / 120; // 120 frames = 2 sekunder
        fill(255, 255, 0, 150);
        rect(width/2 - barWidth/2, 70, barWidth * timeLeft, 5);
    }
    
    // Shield-indikator
    if (player.shield > 0) {
        fill(100, 100, 255);
        textAlign(LEFT, CENTER);
        textSize(16);
        text(`Sköld: ${player.shield}`, 20, 580);
    }
    
    // Aktiva power-ups
    let activePowerups = [];
    if (player.powerups && player.powerups.aiAssist && player.powerups.aiAssistTimer > 0) {
        activePowerups.push({name: "AI Assist", time: player.powerups.aiAssistTimer, color: color(200, 255, 100)});
    }
    if (player.powerups && player.powerups.dataOverflow && player.powerups.dataOverflowTimer > 0) {
        activePowerups.push({name: "Data Overflow", time: player.powerups.dataOverflowTimer, color: color(255, 50, 200)});
    }
    if (player.powerups && player.powerups.quantum && player.powerups.quantumTimer > 0) {
        activePowerups.push({name: "Quantum", time: player.powerups.quantumTimer, color: color(150, 0, 255)});
    }
    if (player.powerups && player.powerups.knowledge && player.powerups.knowledgeTimer > 0) {
        activePowerups.push({name: "Knowledge", time: player.powerups.knowledgeTimer, color: color(255, 220, 0)});
    }
    
    // Visa aktiva power-ups
    if (activePowerups.length > 0) {
        textAlign(RIGHT, CENTER);
        textSize(14);
        for (let i = 0; i < activePowerups.length; i++) {
            let powerup = activePowerups[i];
            let timeLeft = floor(powerup.time / 60); // Sekunder
            fill(powerup.color);
            text(`${powerup.name}: ${timeLeft}s`, width - 20, 550 - i * 20);
        }
    }
}

function resetGame() {
    gameState.score = 0;
    gameState.level = 1;
    gameState.lives = 3;
    gameState.gameOver = false;
    showingHighscoreForm = false;
    
    // Dölj formuläret igen
    const highscoreForm = document.getElementById('highscore-form');
    highscoreForm.classList.add('hidden');
    
    player = new Player(width / 2, height - 50);
    bullets = [];
    enemies = [];
    powerUps = [];
    bosses = [];
}

// Lägg till en dummy preloadSounds-funktion om den inte finns
function preload() {
    // Dummy preloadSounds som inte gör något
    window.preloadSounds = function() { console.log("Sound loading disabled"); };
    window.playSound = function() { /* gör ingenting */ };
    window.startMusic = function() { /* gör ingenting */ };
    window.stopMusic = function() { /* gör ingenting */ };
}

// Skapa floaterande poängtext
function createScoreFloater(x, y, text) {
    scoreFloaters.push({
        pos: createVector(x, y),
        text: text,
        lifetime: 0,
        maxLifetime: 60
    });
}

function levelUp() {
    gameState.level++;
    
    // Visa AI-fakta
    currentFact = random(aiFacts);
    showingFact = true;
    factTimer = 180; // 3 sekunder
    
    // Speciell bossnivå var tredje nivå
    if (gameState.level % 3 === 0) {
        setTimeout(spawnMiniBoss, 2000); // Spawn boss efter 2 sekunder
    }
    
    // Dynamisk justering av enemy spawn rate
    let baseSpawnRate = 2000; // Millisekunder
    let adjustedRate = baseSpawnRate / (1 + (gameState.level * 0.3));
    adjustedRate = max(adjustedRate, 500); // Inte snabbare än 0.5 sekunder
    
    // Uppdatera spawn-intervall
    clearInterval(window.enemySpawnInterval);
    window.enemySpawnInterval = setInterval(spawnEnemy, adjustedRate);
    
    // Öka spelarens skicklighetsfaktor något
    playerSkillFactor += 0.1;
    
    // Chans för speciell powerup-dusch
    if (random(1) < 0.5 && gameState.level > 1) {
        setTimeout(createPowerupShower, 5000);
    }
    
    // Achievement för överlevnad
    if (gameState.level >= 5 && !achievements.survivalKing.unlocked) {
        unlockAchievement('survivalKing');
    }
}

function handleEnemies() {
    DEBUG.info("handleEnemies körs", {antal: enemies.length});
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        
        // Påverkas av quantum-effekten
        if (player.powerups && player.powerups.quantum && player.powerups.quantumTimer > 0) {
            // Uppdatera med lägre hastighet under quantum-effekten
            if (frameCount % 3 === 0) enemy.update(); // 33% normal hastighet
        } else {
            enemy.update();
        }
        
        enemy.display();
        
        // Kolla om fienden har lämnat nedre delen av skärmen
        if (enemy.pos.y > height + 50) {
            enemies.splice(i, 1);
            continue;
        }
        
        // Kolla kollision med spelaren
        if (!player.invincible && dist(enemy.pos.x, enemy.pos.y, player.pos.x, player.pos.y) < enemy.size + player.size) {
            // Skada spelaren
            playerHit();
            
            // Fienden tar också skada/förstörs
            if (enemy.takeDamage(1)) {
                handleEnemyDestruction(enemy);
                enemies.splice(i, 1);
            }
        }
    }
}

function handleEnemyDestruction(enemy) {
    // Öka poäng baserat på fiendetyp
    let points = enemy.points;
    
    // Kunskapsboost ger exponentiellt ökande poäng
    if (player.powerups && player.powerups.knowledge && player.powerups.knowledgeTimer > 0) {
        points *= 2 + (combo * 0.1); // Ökar med combo
    }
    
    // Lägg till poäng
    gameState.score += points * comboMultiplier;
    
    // Skapa poängfloater
    createScoreFloater(enemy.pos.x, enemy.pos.y, `+${points * comboMultiplier}`);
    
    // Öka combo
    combo++;
    comboTimer = 120; // 2 sekunder
    
    // Uppdatera combomultiplikatorn
    if (combo >= 10) comboMultiplier = 3;
    else if (combo >= 5) comboMultiplier = 2;
    else comboMultiplier = 1;
    
    // Skapa explosion
    createEnhancedExplosion(enemy.pos.x, enemy.pos.y, enemy.size / 15, 
                           [enemy.color._array[0] * 255, enemy.color._array[1] * 255, enemy.color._array[2] * 255]);
    
    // Slumpmässigt skapa en power-up
    if (random() < 0.2 || enemy.isBoss) {
        createPowerUp(enemy.pos.x, enemy.pos.y);
    }
    
    // Öka killCount och kolla achievements
    killCount++;
    
    if (killCount === 1 && !achievements.firstKill.unlocked) {
        unlockAchievement('firstKill');
    }
    
    if (killCount >= 10 && !achievements.tenKills.unlocked) {
        unlockAchievement('tenKills');
    }
    
    if (enemy.isBoss && !achievements.bossKiller.unlocked) {
        unlockAchievement('bossKiller');
    }
}

function unlockAchievement(id) {
    if (!achievements[id].unlocked) {
        achievements[id].unlocked = true;
        currentAchievement = achievements[id];
        showAchievement = true;
        achievementTimer = 180; // 3 sekunder
    }
}

// Lägg till en funktion för att visa highscore-formuläret
function showHighscoreForm(score) {
    // Visa formuläret
    const highscoreForm = document.getElementById('highscore-form');
    highscoreForm.classList.remove('hidden');
    
    // Scrolla till formuläret
    highscoreForm.scrollIntoView({ behavior: 'smooth' });
    
    // Spara poängen i ett dolt fält
    const scoreInput = document.createElement('input');
    scoreInput.type = 'hidden';
    scoreInput.name = 'score';
    scoreInput.value = score;
    
    const form = document.getElementById('score-form');
    form.appendChild(scoreInput);
}

console.log("Player object after setup:", player);

// Nya fiendtyper
class NeuralNode extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.color = color(50, 150, 255);
        this.health = 2;
        this.size = 20;
        this.points = 20;
        this.amplitude = random(20, 40);
        this.frequency = random(0.02, 0.05);
        this.fireRate = 120; // Skjuter var 2:a sekund
        this.fireTimer = random(0, this.fireRate);
    }
    
    update() {
        this.pos.y += 1.2;
        this.pos.x += sin(frameCount * this.frequency) * this.amplitude * 0.1;
        
        // Skjut-logik
        this.fireTimer--;
        if (this.fireTimer <= 0) {
            this.fireTimer = this.fireRate;
            
            // Skapa en fiendeprojectil
            let dir = createVector(player.pos.x - this.pos.x, player.pos.y - this.pos.y).normalize();
            let enemyBullet = {
                pos: createVector(this.pos.x, this.pos.y),
                vel: dir.mult(3),
                size: 6,
                damage: 1,
                isEnemyBullet: true
            };
            
            bullets.push(enemyBullet);
        }
    }
    
    display() {
        // Rita hexagon
        push();
        fill(this.color);
        stroke(255);
        strokeWeight(2);
        beginShape();
        for (let i = 0; i < 6; i++) {
            let angle = TWO_PI / 6 * i;
            let x = this.pos.x + cos(angle) * this.size;
            let y = this.pos.y + sin(angle) * this.size;
            vertex(x, y);
        }
        endShape(CLOSE);
        
        // Rita "laddnings"-indikator
        if (this.fireTimer < 30) {
            fill(255, 0, 0);
            ellipse(this.pos.x, this.pos.y, 8, 8);
        }
        pop();
    }
}

class DecisionTree extends Enemy {
    constructor(x, y, size = 20) {
        super(x, y);
        this.color = color(30, 220, 120);
        this.health = 1;
        this.size = size;
        this.points = 15;
        this.canSplit = size > 12; // Kan bara dela sig om tillräckligt stor
    }
    
    update() {
        this.pos.y += 1.5;
        this.pos.x += cos(frameCount * 0.03 + this.pos.y * 0.01) * 2;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        if (this.health <= 0) {
            if (this.canSplit) {
                // Skapa två mindre träd
                for (let i = 0; i < 2; i++) {
                    let offset = i === 0 ? -10 : 10;
                    enemies.push(new DecisionTree(this.pos.x + offset, this.pos.y, this.size * 0.6));
                }
            }
            return true; // Fienden är förstörd
        }
        return false;
    }
    
    display() {
        push();
        fill(this.color);
        stroke(255);
        strokeWeight(2);
        triangle(
            this.pos.x, this.pos.y - this.size,
            this.pos.x - this.size, this.pos.y + this.size/2,
            this.pos.x + this.size, this.pos.y + this.size/2
        );
        pop();
    }
}

class DeepLearning extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.color = color(220, 50, 100);
        this.health = 4;
        this.size = 22;
        this.points = 30;
        this.speed = 0.8;
    }
    
    update() {
        // Följ spelaren långsamt
        let dir = createVector(player.pos.x - this.pos.x, player.pos.y - this.pos.y).normalize();
        this.pos.x += dir.x * this.speed;
        this.pos.y += dir.y * this.speed;
    }
    
    display() {
        // Rita oktagon
        push();
        fill(this.color);
        stroke(255);
        strokeWeight(2);
        beginShape();
        for (let i = 0; i < 8; i++) {
            let angle = TWO_PI / 8 * i;
            let x = this.pos.x + cos(angle) * this.size;
            let y = this.pos.y + sin(angle) * this.size;
            vertex(x, y);
        }
        endShape(CLOSE);
        
        // Rita hälsoindikator
        let healthPct = this.health / 4;
        fill(255 * (1 - healthPct), 255 * healthPct, 50);
        rect(this.pos.x - this.size, this.pos.y - this.size - 10, 
             this.size * 2 * healthPct, 5);
        pop();
    }
}

class Transformer extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.color = color(180, 100, 220);
        this.health = 2;
        this.size = 18;
        this.points = 25;
        this.teleportTimer = 180; // Teleportera var 3e sekund
        this.teleportCooldown = 0;
        this.isVisible = true;
    }
    
    update() {
        this.pos.y += 0.5;
        
        // Teleport-logik
        if (this.teleportCooldown > 0) {
            this.teleportCooldown--;
            this.isVisible = this.teleportCooldown < 30 || this.teleportCooldown % 10 < 5;
        } else {
            this.teleportTimer--;
            
            if (this.teleportTimer <= 0) {
                // Teleportera till en ny plats nära spelaren
                let offset = random(100, 200);
                let angle = random(TWO_PI);
                this.pos.x = constrain(player.pos.x + cos(angle) * offset, 50, width - 50);
                this.pos.y = constrain(player.pos.y + sin(angle) * offset, 50, height - 100);
                
                // Skapa teleport-effekt
                createTeleportEffect(this.pos.x, this.pos.y);
                
                // Återställ timer och sätt cooldown
                this.teleportTimer = 180;
                this.teleportCooldown = 60;
                this.isVisible = false;
            }
        }
    }
    
    display() {
        if (!this.isVisible) return;
        
        push();
        fill(this.color);
        stroke(255);
        strokeWeight(2);
        rectMode(CENTER);
        rect(this.pos.x, this.pos.y, this.size * 2, this.size * 2);
        
        // Teleport-indikator
        if (this.teleportTimer < 30) {
            noFill();
            stroke(180, 100, 220, 150 + sin(frameCount * 0.2) * 100);
            ellipse(this.pos.x, this.pos.y, this.size * 3, this.size * 3);
        }
        pop();
    }
}

class AISupervisor extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.color = color(255, 150, 0);
        this.health = 20;
        this.maxHealth = 20;
        this.size = 40;
        this.points = 500;
        this.isBoss = true;
        this.attackTimer = 120;
        this.pattern = 'circle'; // Startmönster
    }
    
    update() {
        // Rör sig långsamt nedåt tills den når en viss position
        if (this.pos.y < 100) {
            this.pos.y += 1;
        } else {
            // Rör sig i ett sinusmönster
            this.pos.x = width/2 + sin(frameCount * 0.01) * (width * 0.4);
            
            // Attackmönster
            this.attackTimer--;
            if (this.attackTimer <= 0) {
                this.attackTimer = 120;
                this.attack();
                
                // Byt mönster ibland
                if (random(1) < 0.3) {
                    this.pattern = random(['circle', 'spread', 'targeted']);
                }
            }
        }
    }
    
    attack() {
        // Olika attackmönster
        switch(this.pattern) {
            case 'circle':
                // Cirkulär attack
                for (let i = 0; i < 12; i++) {
                    let angle = (TWO_PI / 12) * i;
                    let dir = createVector(cos(angle), sin(angle));
                    bullets.push({
                        pos: createVector(this.pos.x, this.pos.y),
                        vel: dir.mult(3),
                        size: 8,
                        damage: 1,
                        isEnemyBullet: true
                    });
                }
                break;
                
            case 'spread':
                // Spridd attack
                for (let i = 0; i < 5; i++) {
                    let angle = PI/2 + map(i, 0, 4, -PI/4, PI/4);
                    let dir = createVector(cos(angle), sin(angle));
                    bullets.push({
                        pos: createVector(this.pos.x, this.pos.y),
                        vel: dir.mult(4),
                        size: 8,
                        damage: 1,
                        isEnemyBullet: true
                    });
                }
                break;
                
            case 'targeted':
                // Målsökning
                let dir = createVector(player.pos.x - this.pos.x, player.pos.y - this.pos.y).normalize();
                for (let i = -1; i <= 1; i++) {
                    let rotatedDir = createVector(
                        dir.x * cos(i * PI/10) - dir.y * sin(i * PI/10),
                        dir.x * sin(i * PI/10) + dir.y * cos(i * PI/10)
                    );
                    bullets.push({
                        pos: createVector(this.pos.x, this.pos.y),
                        vel: rotatedDir.mult(5),
                        size: 10,
                        damage: 1,
                        isEnemyBullet: true
                    });
                }
                break;
        }
        
        // Skaka skärmen något vid attack
        screenShake = 5;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // Spawn partiklar vid träff
        for (let i = 0; i < 3; i++) {
            createScoreFloater(this.pos.x + random(-this.size, this.size), 
                               this.pos.y + random(-this.size, this.size), 
                               amount * 10);
        }
        
        // Ändra färg när den tar skada
        this.color = color(255, 200 - (this.maxHealth - this.health) * 20, 0);
        
        if (this.health <= 0) {
            // Boss besegad - skapa stor explosion
            createEnhancedExplosion(this.pos.x, this.pos.y, 3, [255, 200, 0]);
            
            // Spawna garanterade power-ups
            for (let i = 0; i < 3; i++) {
                let type = ['weapon', 'shield', 'aiAssist'][i];
                createPowerUp(this.pos.x + random(-50, 50), this.pos.y + random(-30, 30), type);
            }
            
            // Bossflagga för achievement etc
            bossDefeated = true;
            
            return true;
        }
        return false;
    }
    
    display() {
        push();
        // Rita boss-kropp
        fill(this.color);
        stroke(255);
        strokeWeight(3);
        ellipse(this.pos.x, this.pos.y, this.size * 2, this.size * 2);
        
        // Rita detaljer
        fill(0);
        ellipse(this.pos.x - this.size * 0.5, this.pos.y - this.size * 0.3, this.size * 0.4);
        ellipse(this.pos.x + this.size * 0.5, this.pos.y - this.size * 0.3, this.size * 0.4);
        
        // Mun baserad på hälsa
        let mouthAngle = map(this.health, 0, this.maxHealth, PI * 0.8, PI * 0.2);
        fill(0);
        arc(this.pos.x, this.pos.y + this.size * 0.2, this.size, this.size * 0.8, 
            PI + mouthAngle, TWO_PI - mouthAngle);
        
        // Hälsomätare
        let healthPct = this.health / this.maxHealth;
        fill(255 * (1 - healthPct), 255 * healthPct, 0);
        rect(this.pos.x - this.size, this.pos.y - this.size - 15, 
             this.size * 2 * healthPct, 8);
        
        pop();
    }
}

// Partikelsystem och visuella effekter
function createEnhancedExplosion(x, y, size = 1, colorArr = [255, 100, 50]) {
    let particleCount = Math.floor(15 * size);
    
    for (let i = 0; i < particleCount; i++) {
        let particle = {
            pos: createVector(x, y),
            vel: p5.Vector.random2D().mult(random(1, 3) * size),
            size: random(3, 8) * size,
            color: color(colorArr[0], colorArr[1], colorArr[2]),
            alpha: 255,
            lifetime: 0,
            maxLifetime: random(20, 40)
        };
        
        explosions.push(particle);
    }
    
    // Skärmskakningseffekt
    if (size > 1.5) {
        screenShake = 15 * size;
    }
}

function createTeleportEffect(x, y) {
    let particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        let particle = {
            pos: createVector(x, y),
            vel: p5.Vector.random2D().mult(random(3, 6)),
            size: random(3, 8),
            color: color(180, 100, 220, 200),
            alpha: 255,
            lifetime: 0,
            maxLifetime: random(15, 30)
        };
        
        explosions.push(particle);
    }
    
    // Liten skärmskakning
    screenShake = 5;
}

// Lägg till funktion för att uppdatera power-up effekter
function updatePowerUpEffects() {
    // AI Assist effekt
    if (player.powerups && player.powerups.aiAssist && player.powerups.aiAssistTimer > 0) {
        player.powerups.aiAssistTimer--;
        
        // Visuell indikator
        push();
        stroke(200, 255, 100, 50 + sin(frameCount * 0.1) * 50);
        strokeWeight(2);
        noFill();
        ellipse(player.pos.x, player.pos.y, 100 + sin(frameCount * 0.1) * 20);
        pop();
        
        // Auto-aiming funktion
        if (enemies.length > 0 && frameCount % 15 === 0) {
            // Hitta närmaste fienden
            let closestEnemy = null;
            let closestDist = Infinity;
            
            for (let enemy of enemies) {
                let d = dist(player.pos.x, player.pos.y, enemy.pos.x, enemy.pos.y);
                if (d < closestDist) {
                    closestDist = d;
                    closestEnemy = enemy;
                }
            }
            
            if (closestEnemy) {
                // Skjut mot närmaste fienden
                let dir = createVector(
                    closestEnemy.pos.x - player.pos.x,
                    closestEnemy.pos.y - player.pos.y
                ).normalize();
                
                player.shoot(dir);
            }
        }
    } else if (player.powerups && player.powerups.aiAssist) {
        player.powerups.aiAssist = false;
    }
    
    // Data Overflow effekt
    if (player.powerups && player.powerups.dataOverflow && player.powerups.dataOverflowTimer > 0) {
        player.powerups.dataOverflowTimer--;
        
        // Visuell indikator
        push();
        stroke(255, 50, 200, 50 + sin(frameCount * 0.1) * 50);
        strokeWeight(2);
        noFill();
        
        // Rita en dataström runt spelaren
        for (let i = 0; i < 8; i++) {
            let angle = frameCount * 0.05 + i * PI/4;
            let x1 = player.pos.x + cos(angle) * 30;
            let y1 = player.pos.y + sin(angle) * 30;
            let x2 = player.pos.x + cos(angle + PI/8) * 40;
            let y2 = player.pos.y + sin(angle + PI/8) * 40;
            line(x1, y1, x2, y2);
        }
        pop();
    } else if (player.powerups && player.powerups.dataOverflow) {
        player.powerups.dataOverflow = false;
    }
    
    // Quantum effekt
    if (player.powerups && player.powerups.quantum && player.powerups.quantumTimer > 0) {
        player.powerups.quantumTimer--;
        
        // Visuell indikator
        push();
        stroke(150, 0, 255, 50 + sin(frameCount * 0.1) * 50);
        strokeWeight(2);
        noFill();
        
        // Rita kvanteffekt
        for (let i = 0; i < 3; i++) {
            let size = 50 + i * 20 + sin(frameCount * 0.1 + i) * 10;
            ellipse(player.pos.x, player.pos.y, size, size);
        }
        pop();
        
        // Tidsfördröjningseffekt hanteras i handleEnemies och handleBullets
    } else if (player.powerups && player.powerups.quantum) {
        player.powerups.quantum = false;
    }
    
    // Knowledge effekt
    if (player.powerups && player.powerups.knowledge && player.powerups.knowledgeTimer > 0) {
        player.powerups.knowledgeTimer--;
        
        // Visuell indikator
        push();
        stroke(255, 220, 0, 50 + sin(frameCount * 0.1) * 50);
        strokeWeight(2);
        noFill();
        
        // Rita kunskapseffekt
        beginShape();
        for (let i = 0; i < 8; i++) {
            let angle = frameCount * 0.02 + i * TWO_PI / 8;
            let r = 40 + sin(frameCount * 0.1 + i) * 10;
            let x = player.pos.x + cos(angle) * r;
            let y = player.pos.y + sin(angle) * r;
            vertex(x, y);
        }
        endShape(CLOSE);
        pop();
        
        // Poängmultiplikator hanteras i handleEnemyDestruction
    } else if (player.powerups && player.powerups.knowledge) {
        player.powerups.knowledge = false;
    }
}

// Lägg till kollektionsfunktion för power-ups
function collectPowerUp(powerup) {
    // Visuell effekt vid uppsamling
    for (let i = 0; i < 10; i++) {
        let particle = {
            pos: createVector(powerup.pos.x, powerup.pos.y),
            vel: p5.Vector.random2D().mult(random(1, 3)),
            size: random(3, 8),
            color: powerup.displayColor,
            alpha: 255,
            lifetime: 0,
            maxLifetime: random(20, 40)
        };
        
        explosions.push(particle);
    }
    
    // Ljud avstängt enligt instruktioner
    
    // Applicera power-up effekt
    switch(powerup.type) {
        case 'speed':
            player.speed += 1;
            createScoreFloater(powerup.pos.x, powerup.pos.y, "Speed +1");
            break;
            
        case 'weapon':
            player.weaponLevel = min(player.weaponLevel + 1, 3);
            createScoreFloater(powerup.pos.x, powerup.pos.y, "Weapon Up!");
            break;
            
        case 'shield':
            player.shield = min(player.shield + 1, 3);
            createScoreFloater(powerup.pos.x, powerup.pos.y, "Shield Up!");
            break;
            
        case 'life':
            gameState.lives = min(gameState.lives + 1, 5);
            createScoreFloater(powerup.pos.x, powerup.pos.y, "Extra Life!");
            break;
            
        case 'aiAssist':
            player.powerups.aiAssist = true;
            player.powerups.aiAssistTimer = 600; // 10 sekunder
            createScoreFloater(powerup.pos.x, powerup.pos.y, "AI ASSIST!");
            break;
            
        case 'dataOverflow':
            player.powerups.dataOverflow = true;
            player.powerups.dataOverflowTimer = 480; // 8 sekunder
            createScoreFloater(powerup.pos.x, powerup.pos.y, "DATA OVERFLOW!");
            break;
            
        case 'quantum':
            player.powerups.quantum = true;
            player.powerups.quantumTimer = 300; // 5 sekunder
            createScoreFloater(powerup.pos.x, powerup.pos.y, "QUANTUM TIME!");
            break;
            
        case 'knowledge':
            player.powerups.knowledge = true;
            player.powerups.knowledgeTimer = 900; // 15 sekunder
            createScoreFloater(powerup.pos.x, powerup.pos.y, "KNOWLEDGE BOOST!");
            break;
    }
    
    powerupCount++;
    // Achievement-hantering
    if (powerupCount >= 5 && !achievements.collector.unlocked) {
        unlockAchievement('collector');
    }
}

// Speciella händelser - PowerUp Shower
function createPowerupShower() {
    const powerupCount = 10;
    
    // Visa meddelande
    currentFact = "POWER-UP SHOWER: Fånga dem alla!";
    showingFact = true;
    factTimer = 180; // 3 sekunder
    
    // Skapa power-ups över en tidsperiod
    for (let i = 0; i < powerupCount; i++) {
        setTimeout(() => {
            let x = random(50, width - 50);
            createPowerUp(x, -20);
        }, i * 300); // En power-up var 0.3:e sekund
    }
}

// Uppdatera Player-klassen
class Player {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.speed = 5;
        this.size = 20;
        this.weaponLevel = 1;
        this.shield = 0;
        this.fireRate = 15;
        this.fireTimer = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.thrusterParticles = [];
        
        // Nya power-up egenskaper
        this.powerups = {
            aiAssist: false,
            aiAssistTimer: 0,
            dataOverflow: false,
            dataOverflowTimer: 0,
            quantum: false,
            quantumTimer: 0,
            knowledge: false,
            knowledgeTimer: 0
        };
        
        // Debug-info
        DEBUG.info("Player konstruktor slutförd", this);
    }
    
    update() {
        // Debug-markering i början av uppdateringen
        DEBUG.debug("Player.update körs");
        
        // Uppdatera position
        this.pos.add(this.vel);
        
        // Minska fire timer
        if (this.fireTimer > 0) {
            this.fireTimer--;
        }
        
        // Hantera oövervinnlighet
        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
        
        // Skapa thruster-partiklar
        if (frameCount % 3 === 0) {
            this.thrusterParticles.push({
                pos: createVector(this.pos.x, this.pos.y + this.size),
                vel: createVector(random(-0.5, 0.5), random(1, 3)),
                size: random(3, 8),
                alpha: 255,
                lifetime: 0,
                maxLifetime: random(10, 20)
            });
        }
        
        // Uppdatera thruster-partiklar
        for (let i = this.thrusterParticles.length - 1; i >= 0; i--) {
            let particle = this.thrusterParticles[i];
            particle.pos.add(particle.vel);
            particle.lifetime++;
            particle.alpha = map(particle.lifetime, 0, particle.maxLifetime, 255, 0);
            
            if (particle.lifetime >= particle.maxLifetime) {
                this.thrusterParticles.splice(i, 1);
            }
        }
        
        // Markera att uppdateringen slutförts framgångsrikt
        DEBUG.status.playerUpdated = true;
    }
    
    display() {
        // Debug-markering i början av rendering
        DEBUG.debug("Player.display körs");
        
        // Rita thruster-partiklar
        for (let particle of this.thrusterParticles) {
            fill(255, 100, 0, particle.alpha);
            noStroke();
            ellipse(particle.pos.x, particle.pos.y, particle.size, particle.size);
        }
        
        // Rita spelaren
        push();
        if (this.invincible && frameCount % 6 < 3) {
            // Blinka om oövervinnlig
            fill(150, 150, 150, 150);
        } else {
            fill(50, 150, 255);
        }
        stroke(255);
        strokeWeight(2);
        
        // Skeppets kropp
        beginShape();
        vertex(this.pos.x, this.pos.y - this.size);
        vertex(this.pos.x - this.size, this.pos.y + this.size);
        vertex(this.pos.x, this.pos.y + this.size/2);
        vertex(this.pos.x + this.size, this.pos.y + this.size);
        endShape(CLOSE);
        
        // Sköld om aktiv
        if (this.shield > 0) {
            noFill();
            stroke(100, 100, 255, 150 + sin(frameCount * 0.1) * 50);
            strokeWeight(2);
            ellipse(this.pos.x, this.pos.y, this.size * 3, this.size * 3);
        }
        pop();
        
        // Markera att visningen slutförts framgångsrikt
        DEBUG.status.playerDisplayed = true;
    }
    
    shoot(direction = null) {
        if (this.fireTimer <= 0) {
            // Normal skjutning uppåt om ingen riktning ges
            if (!direction) {
                direction = createVector(0, -1);
            }
            
            // Baserat på vapennivå
            if (this.weaponLevel === 1) {
                // Enkelt skott
                bullets.push({
                    pos: createVector(this.pos.x, this.pos.y - 10),
                    vel: direction.copy().mult(10),
                    size: 8,
                    damage: 1,
                    penetrating: this.powerups && this.powerups.dataOverflow
                });
            } else if (this.weaponLevel === 2) {
                // Dubbla skott
                bullets.push({
                    pos: createVector(this.pos.x - 10, this.pos.y - 5),
                    vel: direction.copy().mult(10),
                    size: 6,
                    damage: 1,
                    penetrating: this.powerups && this.powerups.dataOverflow
                });
                bullets.push({
                    pos: createVector(this.pos.x + 10, this.pos.y - 5),
                    vel: direction.copy().mult(10),
                    size: 6,
                    damage: 1,
                    penetrating: this.powerups && this.powerups.dataOverflow
                });
            } else if (this.weaponLevel >= 3) {
                // Trippelskott
                bullets.push({
                    pos: createVector(this.pos.x, this.pos.y - 10),
                    vel: direction.copy().mult(10),
                    size: 8,
                    damage: 2,
                    penetrating: this.powerups && this.powerups.dataOverflow
                });
                
                let dir1 = createVector(direction.x - 0.2, direction.y).normalize();
                let dir2 = createVector(direction.x + 0.2, direction.y).normalize();
                
                bullets.push({
                    pos: createVector(this.pos.x - 15, this.pos.y),
                    vel: dir1.mult(8),
                    size: 6,
                    damage: 1,
                    penetrating: this.powerups && this.powerups.dataOverflow
                });
                bullets.push({
                    pos: createVector(this.pos.x + 15, this.pos.y),
                    vel: dir2.mult(8),
                    size: 6,
                    damage: 1,
                    penetrating: this.powerups && this.powerups.dataOverflow
                });
            }
            
            this.fireTimer = this.fireRate;
        }
    }
}

// Uppdatera handleBullets-funktionen
function handleBullets() {
    DEBUG.info("handleBullets körs", {antal: bullets.length});
    
    // Uppdatera och visa skott
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        
        // Uppdatera positionen
        bullet.pos.x += bullet.vel.x;
        bullet.pos.y += bullet.vel.y;
        
        // Fiendekulor påverkas av quantum-effekten
        if (bullet.isEnemyBullet && player.powerups && player.powerups.quantum && player.powerups.quantumTimer > 0) {
            bullet.pos.x += bullet.vel.x * 0.3; // 70% långsammare
            bullet.pos.y += bullet.vel.y * 0.3;
        }
        
        // Rita skottet
        fill(bullet.isEnemyBullet ? color(255, 50, 50) : color(50, 200, 255));
        
        // Speciell visuell effekt för penetrerande skott
        if (bullet.penetrating) {
            stroke(255, 50, 200, 150);
            strokeWeight(2);
            // Ritade en liten svans efter skottet
            line(bullet.pos.x, bullet.pos.y, 
                 bullet.pos.x - bullet.vel.x * 0.5, bullet.pos.y - bullet.vel.y * 0.5);
            noStroke();
        } else {
            noStroke();
        }
        
        ellipse(bullet.pos.x, bullet.pos.y, bullet.size, bullet.size);
        
        // Kolla om skott lämnar skärmen
        if (bullet.pos.y < -10 || bullet.pos.y > height + 10 || 
            bullet.pos.x < -10 || bullet.pos.x > width + 10) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Kolla kollisioner
        if (!bullet.isEnemyBullet) {
            // Spelares skott kolliderar med fiender
            for (let j = enemies.length - 1; j >= 0; j--) {
                let enemy = enemies[j];
                if (dist(bullet.pos.x, bullet.pos.y, enemy.pos.x, enemy.pos.y) < enemy.size + bullet.size/2) {
                    // Fienden tar skada
                    let destroyed = enemy.takeDamage(bullet.damage);
                    if (destroyed) {
                        handleEnemyDestruction(enemy);
                        enemies.splice(j, 1);
                    }
                    
                    // Ta bort skottet om det inte penetrerar
                    if (!bullet.penetrating) {
                        bullets.splice(i, 1);
                        break;
                    }
                }
            }
        } else {
            // Fiendeskott kolliderar med spelaren
            if (!player.invincible && dist(bullet.pos.x, bullet.pos.y, player.pos.x, player.pos.y) < player.size) {
                playerHit();
                bullets.splice(i, 1);
            }
        }
    }
}

// Uppdatera checkLevelComplete-funktionen
function checkLevelComplete() {
    // En nivå anses vara klar när spelaren har uppnått en viss poänggräns
    let levelThreshold = 1000 * gameState.level;
    
    // Kontrollera om det finns en boss på skärmen
    let bossExists = enemies.some(e => e.isBoss);
    
    if (gameState.score >= levelThreshold && !bossExists) {
        levelUp();
    }
}

// Lägg till miniboss-spawning
function spawnMiniBoss() {
    // Rensa skärmen lite
    enemies = enemies.filter(e => !e.isBoss);
    
    // Skapa bossen i mitten av skärmen
    let boss = new AISupervisor(width/2, -50);
    enemies.push(boss);
    
    // Visa boss-meddelande
    currentFact = "AI SUPERVISOR: Dags att testa din kunskap!";
    showingFact = true;
    factTimer = 180; // 3 sekunder
}

// Uppdatera displayFact-funktionen
function displayFact() {
    push();
    fill(0, 0, 0, 200);
    rect(0, height/2 - 30, width, 60);
    
    fill(255);
    textSize(18);
    textAlign(CENTER, CENTER);
    text(currentFact, width/2, height/2);
    pop();
}

// Funktion för att visa achievements
function displayAchievement() {
    push();
    fill(0, 0, 0, 200);
    rect(width/2 - 150, height/2 - 60, 300, 120);
    
    fill(255, 215, 0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("Achievement Unlocked!", width/2, height/2 - 30);
    
    fill(255);
    textSize(18);
    text(currentAchievement.name, width/2, height/2);
    
    textSize(14);
    text(currentAchievement.description, width/2, height/2 + 30);
    pop();
}

// Uppdatera flytande poängtext
function updateScoreFloaters() {
    for (let i = scoreFloaters.length - 1; i >= 0; i--) {
        let floater = scoreFloaters[i];
        
        // Uppdatera position
        floater.pos.y -= 1;
        
        // Öka livstid
        floater.lifetime++;
        
        // Rita floater
        let alpha = map(floater.lifetime, 0, floater.maxLifetime, 255, 0);
        
        // Olika färg baserat på om det är poäng eller text
        if (typeof floater.text === 'number' || (typeof floater.text === 'string' && floater.text.startsWith('+'))) {
            fill(255, 255, 0, alpha);
        } else {
            fill(255, 255, 255, alpha);
        }
        
        textSize(16);
        textAlign(CENTER, CENTER);
        text(floater.text, floater.pos.x, floater.pos.y);
        
        // Ta bort om livstiden är slut
        if (floater.lifetime >= floater.maxLifetime) {
            scoreFloaters.splice(i, 1);
        }
    }
}

// Uppdatera explosionseffekter
function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        let particle = explosions[i];
        
        // Uppdatera position
        particle.pos.x += particle.vel.x;
        particle.pos.y += particle.vel.y;
        
        // Friktionseffekt
        particle.vel.mult(0.95);
        
        // Öka livstid
        particle.lifetime++;
        
        // Beräkna alpha baserat på livstid
        particle.alpha = map(particle.lifetime, 0, particle.maxLifetime, 255, 0);
        
        // Rita partikel
        noStroke();
        fill(red(particle.color), green(particle.color), blue(particle.color), particle.alpha);
        ellipse(particle.pos.x, particle.pos.y, particle.size, particle.size);
        
        // Ta bort om livstiden är slut
        if (particle.lifetime >= particle.maxLifetime) {
            explosions.splice(i, 1);
        }
    }
}

// Uppdatera playerHit-funktionen
function playerHit() {
    // Om spelaren har sköld, minska den istället för liv
    if (player.shield > 0) {
        player.shield--;
        // Skapa sköldfeedback
        createEnhancedExplosion(player.pos.x, player.pos.y, 1, [100, 100, 255]);
        player.invincible = true;
        player.invincibleTimer = 60; // 1 sekund
    } else {
        // Minska liv
        gameState.lives--;
        
        // Lägga till explosion
        createEnhancedExplosion(player.pos.x, player.pos.y, 2, [255, 100, 100]);
        
        // Skärmskakningseffekt
        screenShake = 15;
        
        // Sätt spelaren till oövervinnlig tillfälligt
        player.invincible = true;
        player.invincibleTimer = 120; // 2 sekunder
        
        // Kontrollera om spelet är slut
        if (gameState.lives <= 0) {
            gameOver();
        }
    }
}

// Uppdatera gameOver-funktionen
function gameOver() {
    gameState.gameOver = true;
    
    // Visa highscore-formulär
    setTimeout(() => {
        let highscoreForm = document.getElementById('highscore-form');
        if (highscoreForm) {
            document.getElementById('score-input').value = gameState.score;
            highscoreForm.classList.remove('hidden');
            showingHighscoreForm = true;
        }
    }, 1500); // Vänta 1.5 sekunder
    
    // Rensa intervaller
    clearInterval(window.enemySpawnInterval);
}

// Uppdatera handleGameOver-funktionen
function handleGameOver() {
    // Visa Game Over-skärm
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);
    
    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width/2, height/3);
    
    textSize(24);
    text(`Poäng: ${gameState.score}`, width/2, height/3 + 60);
    text(`Nivå: ${gameState.level}`, width/2, height/3 + 90);
    
    // Om highscore-formuläret inte visas ännu
    if (!showingHighscoreForm) {
        textSize(16);
        text("Laddar highscore-formulär...", width/2, height/3 + 150);
    }
}

// Uppdatera resetGame-funktionen
function resetGame() {
    // Återställ spelläget
    gameState = {
        score: 0,
        level: 1,
        lives: 3,
        gameOver: false
    };
    
    // Återställ spelaren
    player = new Player(width/2, height - 50);
    
    // Rensa arrays
    bullets = [];
    enemies = [];
    powerUps = [];
    explosions = [];
    scoreFloaters = [];
    
    // Återställ combo
    combo = 0;
    comboTimer = 0;
    comboMultiplier = 1;
    
    // Återställ räknare
    powerupCount = 0;
    killCount = 0;
    
    // Återställ UI-flaggor
    showingFact = false;
    factTimer = 0;
    showAchievement = false;
    achievementTimer = 0;
    
    // Starta fiendespawning igen
    clearInterval(window.enemySpawnInterval);
    window.enemySpawnInterval = setInterval(spawnEnemy, 2000);
    
    // Dölj highscore-formulär
    let highscoreForm = document.getElementById('highscore-form');
    if (highscoreForm) {
        highscoreForm.classList.add('hidden');
    }
    showingHighscoreForm = false;
}

// Grundläggande klasser som behövs
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
        fill(255);
        noStroke();
        for (let star of this.stars) {
            ellipse(star.x, star.y, star.size, star.size);
        }
    }
}

class Bullet {
    constructor(x, y, angle = 0) {
        this.pos = createVector(x, y);
        this.vel = createVector(sin(angle) * 10, -cos(angle) * 10);
        this.size = 8;
        this.damage = 1;
        this.penetrating = false;
    }
}

class Enemy {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 1);
        this.size = 20;
        this.health = 1;
        this.points = 10;
        this.color = color(255, 0, 0);
        this.isBoss = false;
    }
    
    update() {
        this.pos.add(this.vel);
    }
    
    display() {
        fill(this.color);
        stroke(255);
        strokeWeight(2);
        ellipse(this.pos.x, this.pos.y, this.size * 2, this.size * 2);
    }
    
    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }
}

// Uppdatera eller lägg till handleInput-funktionen
function handleInput() {
    // Hantera tangentbordsinmatning för rörelse
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Vänsterpil eller A
        player.pos.x -= player.speed;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Högerpil eller D
        player.pos.x += player.speed;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { // Uppåtpil eller W
        player.pos.y -= player.speed;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { // Nedåtpil eller S
        player.pos.y += player.speed;
    }
    
    // Begränsa spelaren till skärmen
    player.pos.x = constrain(player.pos.x, player.size, width - player.size);
    player.pos.y = constrain(player.pos.y, player.size, height - player.size);
    
    // Automatisk skjutning
    if (frameCount % 15 === 0) {
        player.shoot();
    }
}

// Uppdatera eller lägg till handlePowerUps-funktionen
function handlePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        let powerUp = powerUps[i];
        
        // Uppdatera position
        powerUp.pos.x += powerUp.vel.x;
        powerUp.pos.y += powerUp.vel.y;
        
        // Pulseffekt
        powerUp.pulseRadius = 20 + sin(frameCount * 0.1) * 5;
        
        // Rita power-up
        push();
        // Yttre glöd
        noFill();
        stroke(powerUp.displayColor);
        strokeWeight(2);
        ellipse(powerUp.pos.x, powerUp.pos.y, powerUp.pulseRadius, powerUp.pulseRadius);
        
        // Inre cirkel
        fill(powerUp.displayColor);
        noStroke();
        ellipse(powerUp.pos.x, powerUp.pos.y, powerUp.size, powerUp.size);
        pop();
        
        // Kolla kollision med spelaren
        if (!powerUp.collected && dist(powerUp.pos.x, powerUp.pos.y, player.pos.x, player.pos.y) < player.size + powerUp.size) {
            // Samla power-up
            powerUp.collected = true;
            collectPowerUp(powerUp);
            powerUps.splice(i, 1);
        }
        
        // Ta bort power-ups som lämnar skärmen
        if (powerUp.pos.y > height + 20) {
            powerUps.splice(i, 1);
        }
    }
}

// Lägg till i p5.js sketch-object
function windowResized() {
    // Bevara canvas vid fönsterändring
    if (canvas) {
        // Justera storlek vid behov
        console.log("Window resized, maintaining canvas");
    }
}

// Skapa en separat reset-funktion för canvas
function resetCanvas() {
    console.log("Attempting canvas reset");
    
    // Ta bort existerande canvas
    let existingCanvas = document.querySelector('canvas');
    if (existingCanvas) {
        existingCanvas.remove();
        console.log("Removed existing canvas");
    }
    
    // Skapa ny canvas
    canvas = createCanvas(800, 600);
    canvas.parent('game-container');
    console.log("Canvas reset complete");
    
    // Återstarta spel
    bootScene = new BootScene();
    bootScene.preload();
    setTimeout(() => bootScene.start(), 200);
}