// Fiender - Olika typer av fiender i spelet
class BasicEnemy {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 2);
        this.size = 20;
        this.rotationSpeed = random(-0.02, 0.02);
        this.rotation = 0;
    }
    
    update() {
        this.pos.add(this.vel);
        this.rotation += this.rotationSpeed;
    }
    
    display() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);
        
        // Grundläggande fiendekropp (hexagon)
        fill(0, 191, 99);
        beginShape();
        for (let i = 0; i < 6; i++) {
            let angle = TWO_PI / 6 * i;
            let x = cos(angle) * this.size / 2;
            let y = sin(angle) * this.size / 2;
            vertex(x, y);
        }
        endShape(CLOSE);
        
        // Ögon (röda cirklar)
        fill(255, 0, 0);
        ellipse(-4, -2, 4, 4);
        ellipse(4, -2, 4, 4);
        
        // Antenn
        fill(0, 191, 99);
        rect(0, -15, 2, 10);
        fill(255, 51, 51);
        ellipse(0, -20, 6, 6);
        
        pop();
    }
    
    collidesWith(entity) {
        let distance = dist(this.pos.x, this.pos.y, entity.pos.x, entity.pos.y);
        return distance < (this.size / 2 + entity.size / 2);
    }
    
    isOffScreen() {
        return this.pos.y > height + this.size;
    }
}

class TankEnemy {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 1.5);
        this.size = 30;
        this.health = 3;
        this.fireTimer = 0;
        this.fireRate = 120; // Frames mellan skott
    }
    
    update() {
        this.pos.add(this.vel);
        
        // Slumpmässig rörelse i x-led
        if (frameCount % 60 === 0) {
            this.vel.x = random(-1, 1);
        }
        
        // Begränsa x-position till skärmen
        this.pos.x = constrain(this.pos.x, this.size, width - this.size);
        
        // Öka timer
        this.fireTimer++;
        
        // Skjut om tiden är rätt
        if (this.fireTimer >= this.fireRate) {
            this.fireTimer = 0;
            this.fire();
        }
    }
    
    fire() {
        // Skjut mot spelaren
        if (player) {
            // Vi lägger till enemy bullets i global bullets-array
            bullets.push(new EnemyBullet(this.pos.x, this.pos.y + 20, player.pos.x, player.pos.y));
        }
    }
    
    display() {
        push();
        translate(this.pos.x, this.pos.y);
        
        // Tankfiende (tjockare, rektangulär)
        fill(142, 68, 173);
        rectMode(CENTER);
        rect(0, 0, 30, 20);
        
        // Kanontorn
        fill(125, 60, 152);
        ellipse(0, 0, 16, 16);
        
        // Kanonpipa
        rect(0, 15, 4, 15);
        
        // Detaljer
        fill(255, 51, 51);
        rect(-10, -5, 5, 5);
        rect(10, -5, 5, 5);
        
        pop();
    }
    
    collidesWith(entity) {
        let distance = dist(this.pos.x, this.pos.y, entity.pos.x, entity.pos.y);
        return distance < (this.size / 2 + entity.size / 2);
    }
    
    isOffScreen() {
        return this.pos.y > height + this.size;
    }
}

class Boss {
    constructor(x, y, level) {
        this.pos = createVector(x, y);
        this.vel = createVector(1, 0);
        this.size = 80;
        this.health = 20 + (level * 10);
        this.maxHealth = this.health;
        this.fireTimer = 0;
        this.fireRate = 60;
        this.angle = 0;
        this.level = level;
    }
    
    update() {
        // Rörelse fram och tillbaka
        this.pos.add(this.vel);
        
        if (this.pos.x > width - this.size / 2 || this.pos.x < this.size / 2) {
            this.vel.x *= -1;
        }
        
        // Rotera effekter
        this.angle += 0.01;
        
        // Skjut
        this.fireTimer++;
        if (this.fireTimer >= this.fireRate) {
            this.fireTimer = 0;
            this.fire();
        }
    }
    
    fire() {
        // Skjut flera kulor i olika mönster
        if (player) {
            // Beroende på nivå, skjut mer aggressivt
            if (this.level === 1) {
                // Nivå 1: Tre skott i en kon
                bullets.push(new EnemyBullet(this.pos.x, this.pos.y, player.pos.x, player.pos.y));
                bullets.push(new EnemyBullet(this.pos.x - 20, this.pos.y, player.pos.x - 50, player.pos.y));
                bullets.push(new EnemyBullet(this.pos.x + 20, this.pos.y, player.pos.x + 50, player.pos.y));
            } else {
                // Högre nivåer: Cirkulärt mönster
                for (let i = 0; i < this.level + 2; i++) {
                    let angle = TWO_PI / (this.level + 2) * i;
                    let targetX = this.pos.x + cos(angle) * 100;
                    let targetY = this.pos.y + sin(angle) * 100;
                    bullets.push(new EnemyBullet(this.pos.x, this.pos.y, targetX, targetY));
                }
            }
        }
    }
    
    display() {
        push();
        translate(this.pos.x, this.pos.y);
        
        // Yttre ring (roterar)
        push();
        rotate(this.angle);
        noFill();
        stroke(153, 0, 0, 128);
        strokeWeight(3);
        ellipse(0, 0, this.size * 1.2, this.size * 1.2);
        pop();
        
        // Huvudkärna
        fill(204, 0, 0);
        ellipse(0, 0, this.size * 0.8, this.size * 0.8);
        
        // Inre kärna (pulserande)
        let pulseSize = this.size * 0.4 + sin(frameCount * 0.1) * 5;
        fill(255, 51, 51);
        ellipse(0, 0, pulseSize, pulseSize);
        
        // Vapenpunkter
        for (let i = 0; i < 8; i++) {
            let angle = i * PI / 4;
            let x = cos(angle) * this.size * 0.5;
            let y = sin(angle) * this.size * 0.5;
            
            let colors = [color(255, 204, 0), color(255, 102, 0), color(0, 204, 255)];
            fill(colors[i % 3]);
            ellipse(x, y, 12, 12);
        }
        
        // Visa hälsa
        let healthPercentage = this.health / this.maxHealth;
        fill(255);
        rect(0, -this.size / 2 - 15, this.size, 5);
        fill(255, 0, 0);
        rect(0, -this.size / 2 - 15, this.size * healthPercentage, 5);
        
        pop();
    }
    
    collidesWith(entity) {
        let distance = dist(this.pos.x, this.pos.y, entity.pos.x, entity.pos.y);
        return distance < (this.size / 2 + entity.size / 2);
    }
}

class AIModelEnemy extends BasicEnemy {
    constructor(x, y) {
        super(x, y);
        this.modelType = random(['NLP', 'Vision', 'GANs', 'RL']);
        this.size = 30;
        this.health = 3;
        this.maxHealth = 3;
    }
    
    display() {
        // Fienderitning med AI-relaterade symboler/ikoner
        push();
        translate(this.pos.x, this.pos.y);
        
        // Grundform (hexagon, pentagon, etc.)
        fill(0, 150, 200);
        beginShape();
        for (let i = 0; i < 6; i++) {
            let angle = TWO_PI / 6 * i;
            let x = cos(angle) * this.size / 2;
            let y = sin(angle) * this.size / 2;
            vertex(x, y);
        }
        endShape(CLOSE);
        
        // AI-modellnamn
        fill(255);
        textSize(8);
        textAlign(CENTER);
        text(this.modelType, 0, 0);
        
        pop();
    }
} 