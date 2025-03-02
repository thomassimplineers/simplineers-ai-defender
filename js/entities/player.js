// Spelaren - Huvudkaraktären som spelaren kontrollerar
class Player {
    constructor(x, y) {
        // Position och rörelse
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.speed = 5;
        
        // Spelaregenskaper
        this.size = 20;
        this.weaponLevel = 1;
        this.hasShield = false;
        this.shieldAlpha = 0.4;
        
        // Övriga egenskaper
        this.fireRate = 15;
        this.fireTimer = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
    }
    
    update() {
        // Exempel på p5.js-kompatibel uppdatering
        this.pos.add(this.vel);
        
        // Begränsa till skärmkanter
        this.pos.x = constrain(this.pos.x, this.size, width - this.size);
        this.pos.y = constrain(this.pos.y, this.size, height - this.size);
        
        // Hantera invincibility
        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
        
        // Uppdatera fire timer
        if (this.fireTimer > 0) {
            this.fireTimer--;
        }
    }
    
    display() {
        push();
        translate(this.pos.x, this.pos.y);
        
        // Rita ett enkelt skepp i p5.js
        if (this.invincible && frameCount % 4 < 2) {
            // Blinka om osårbar
            fill(100, 100, 255, 120);
        } else {
            fill(50, 150, 255);
        }
        
        // Triangelformad spelare
        triangle(0, -15, -10, 10, 10, 10);
        
        // Rita sköld om aktiv
        if (this.hasShield) {
            noFill();
            stroke(100, 200, 255, this.shieldAlpha * 255);
            strokeWeight(2);
            ellipse(0, 0, this.size * 2.5, this.size * 2.5);
        }
        
        pop();
    }
    
    shoot() {
        if (this.fireTimer <= 0) {
            // Skjut baserat på vapennivå
            if (this.weaponLevel === 1) {
                // Enkelt skott
                return [new Bullet(this.pos.x, this.pos.y - 10)];
            } else if (this.weaponLevel === 2) {
                // Dubbla skott
                return [
                    new Bullet(this.pos.x - 5, this.pos.y - 5),
                    new Bullet(this.pos.x + 5, this.pos.y - 5)
                ];
            } else {
                // Trippelskott med vinkling
                return [
                    new Bullet(this.pos.x, this.pos.y - 10),
                    new Bullet(this.pos.x - 5, this.pos.y - 5, -0.2),
                    new Bullet(this.pos.x + 5, this.pos.y - 5, 0.2)
                ];
            }
            
            this.fireTimer = this.fireRate;
        }
        
        return [];
    }
    
    // Hjälpfunktion för kollisionsdetektion
    collidesWith(entity) {
        let distance = dist(this.pos.x, this.pos.y, entity.pos.x, entity.pos.y);
        return distance < (this.size / 2 + entity.size / 2);
    }
} 