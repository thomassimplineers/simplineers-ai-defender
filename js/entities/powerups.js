// Power-ups - Uppgraderingar som spelaren kan samla
class PowerUp {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 1); // Faller nedåt
        this.size = 15;
        this.pulse = 0;
        this.lifetime = 0;
        this.maxLifetime = 600; // 10 sekunder vid 60 FPS
        this.hoverOffset = 0;
    }
    
    update() {
        // Rörelse nedåt
        this.pos.add(this.vel);
        
        // Svävande effekt
        this.hoverOffset = sin(frameCount * 0.1) * 3;
        
        // Pulseffekt
        this.pulse += 0.1;
        
        // Livslängd
        this.lifetime++;
        
        // Blinka i slutet av livstiden
        return this.lifetime > this.maxLifetime;
    }
    
    // Basmetod för visning - överskrids av specifika powerups
    display() {
        push();
        translate(this.pos.x, this.pos.y + this.hoverOffset);
        
        // Bakgrund/aura
        noStroke();
        fill(255, 255, 255, 60 + sin(this.pulse) * 20);
        ellipse(0, 0, this.size * 2, this.size * 2);
        
        // Grundläggande form - överskrids av underklasser
        pop();
    }
    
    collidesWith(entity) {
        let distance = dist(this.pos.x, this.pos.y, entity.pos.x, entity.pos.y);
        return distance < (this.size + entity.size / 2);
    }
    
    isOffScreen() {
        return this.pos.y > height + this.size;
    }
}

class SpeedPowerUp extends PowerUp {
    constructor(x, y) {
        super(x, y);
        this.type = 'speed';
        this.color = color(52, 152, 219); // Blå
    }
    
    display() {
        push();
        translate(this.pos.x, this.pos.y + this.hoverOffset);
        
        // Bakgrund/aura
        noStroke();
        fill(52, 152, 219, 60 + sin(this.pulse) * 20);
        ellipse(0, 0, this.size * 2, this.size * 2);
        
        // Innerform
        fill(52, 152, 219);
        ellipse(0, 0, this.size, this.size);
        
        // Hastighetspilar
        fill(255);
        beginShape();
        vertex(-5, 5);
        vertex(0, -5);
        vertex(5, 5);
        endShape(CLOSE);
        
        beginShape();
        vertex(-5, 0);
        vertex(0, -10);
        vertex(5, 0);
        endShape(CLOSE);
        
        pop();
        
        // Blinka i slutet av livstiden
        if (this.lifetime > this.maxLifetime * 0.8 && frameCount % 10 < 5) {
            // Blinka genom att inte rita
            return;
        }
    }
}

class WeaponPowerUp extends PowerUp {
    constructor(x, y) {
        super(x, y);
        this.type = 'weapon';
        this.color = color(231, 76, 60); // Röd
    }
    
    display() {
        push();
        translate(this.pos.x, this.pos.y + this.hoverOffset);
        
        // Bakgrund/aura
        noStroke();
        fill(231, 76, 60, 60 + sin(this.pulse) * 20);
        ellipse(0, 0, this.size * 2, this.size * 2);
        
        // Innerform
        fill(231, 76, 60);
        ellipse(0, 0, this.size, this.size);
        
        // Vapensymbol (tre streck)
        stroke(255);
        strokeWeight(2);
        line(-4, -4, 4, -4);
        line(-6, 0, 6, 0);
        line(-4, 4, 4, 4);
        
        pop();
        
        // Blinka i slutet av livstiden
        if (this.lifetime > this.maxLifetime * 0.8 && frameCount % 10 < 5) {
            // Blinka genom att inte rita
            return;
        }
    }
}

class ShieldPowerUp extends PowerUp {
    constructor(x, y) {
        super(x, y);
        this.type = 'shield';
        this.color = color(155, 89, 182); // Lila
        this.ringSize = this.size * 0.8;
    }
    
    update() {
        super.update();
        // Expandera och krympa ringen
        this.ringSize = this.size * 0.8 + sin(this.pulse) * 2;
    }
    
    display() {
        push();
        translate(this.pos.x, this.pos.y + this.hoverOffset);
        
        // Bakgrund/aura
        noStroke();
        fill(155, 89, 182, 60 + sin(this.pulse) * 20);
        ellipse(0, 0, this.size * 2, this.size * 2);
        
        // Innerform
        fill(155, 89, 182);
        ellipse(0, 0, this.size, this.size);
        
        // Sköldring
        noFill();
        stroke(255);
        strokeWeight(2);
        ellipse(0, 0, this.ringSize, this.ringSize);
        
        pop();
        
        // Blinka i slutet av livstiden
        if (this.lifetime > this.maxLifetime * 0.8 && frameCount % 10 < 5) {
            // Blinka genom att inte rita
            return;
        }
    }
}

class LifePowerUp extends PowerUp {
    constructor(x, y) {
        super(x, y);
        this.type = 'life';
        this.color = color(39, 174, 96); // Grön
    }
    
    display() {
        push();
        translate(this.pos.x, this.pos.y + this.hoverOffset);
        
        // Bakgrund/aura
        noStroke();
        fill(39, 174, 96, 60 + sin(this.pulse) * 20);
        ellipse(0, 0, this.size * 2, this.size * 2);
        
        // Innerform
        fill(39, 174, 96);
        ellipse(0, 0, this.size, this.size);
        
        // Hjärtsymbol
        fill(255);
        beginShape();
        vertex(0, 3);
        bezierVertex(0, 3, 8, -3, 0, -7);
        bezierVertex(0, -7, -8, -3, 0, 3);
        endShape();
        
        pop();
        
        // Blinka i slutet av livstiden
        if (this.lifetime > this.maxLifetime * 0.8 && frameCount % 10 < 5) {
            // Blinka genom att inte rita
            return;
        }
    }
}

class BombPowerUp extends PowerUp {
    constructor(x, y) {
        super(x, y);
        this.type = 'bomb';
        this.color = color(255, 50, 50);
    }
    
    display() {
        // Liknande kod som andra powerups
        // Med en bomb-icon
    }
}

class TimePowerUp extends PowerUp {
    constructor(x, y) {
        super(x, y);
        this.type = 'time';
        this.color = color(100, 200, 255);
    }
    
    display() {
        // Med en klock-icon
    }
} 