// Bullets - Projektiler för både spelare och fiender

class Bullet {
    constructor(x, y, angle = 0) {
        this.pos = createVector(x, y);
        this.speed = 8;
        this.size = 6;
        
        // Beräkna hastighetsvektor baserat på vinkel
        this.vel = createVector(sin(angle) * this.speed, -cos(angle) * this.speed);
        
        // Skottets livstid (frames)
        this.lifetime = 0;
        
        // Eftereffekt-timer
        this.trails = [];
    }
    
    update() {
        // Uppdatera position
        this.pos.add(this.vel);
        
        // Håll reda på lifetiden
        this.lifetime++;
        
        // Skapa trail-effekt var tredje frame
        if (frameCount % 3 === 0) {
            this.trails.push({
                x: this.pos.x,
                y: this.pos.y,
                alpha: 0.7,
                size: this.size * 0.7
            });
        }
        
        // Uppdatera alla trails
        for (let i = this.trails.length - 1; i >= 0; i--) {
            let trail = this.trails[i];
            trail.alpha -= 0.1;
            trail.size *= 0.9;
            
            // Ta bort trails som blivit för små eller transparenta
            if (trail.alpha <= 0 || trail.size <= 0.5) {
                this.trails.splice(i, 1);
            }
        }
    }
    
    display() {
        // Rita alla trails först
        noStroke();
        for (let trail of this.trails) {
            fill(102, 255, 102, trail.alpha * 255);
            ellipse(trail.x, trail.y, trail.size, trail.size * 1.5);
        }
        
        // Rita huvudskottet
        push();
        translate(this.pos.x, this.pos.y);
        
        // Rotation för att matcha rörelseriktningen
        rotate(atan2(this.vel.y, this.vel.x) + PI/2);
        
        // Glödande effekt
        noStroke();
        fill(102, 255, 102, 128);
        ellipse(0, 0, this.size * 1.5, this.size * 2);
        
        // Huvuddelen av skottet
        fill(102, 255, 102);
        ellipse(0, 0, this.size, this.size * 1.2);
        
        // Ljusare topp
        fill(204, 255, 204);
        ellipse(0, -this.size/3, this.size * 0.5, this.size * 0.8);
        
        pop();
    }
    
    isOffScreen() {
        return (
            this.pos.x < 0 ||
            this.pos.x > width ||
            this.pos.y < 0 ||
            this.pos.y > height
        );
    }
    
    collidesWith(entity) {
        let distance = dist(this.pos.x, this.pos.y, entity.pos.x, entity.pos.y);
        return distance < (this.size/2 + entity.size/2);
    }
}

class EnemyBullet extends Bullet {
    constructor(x, y, targetX, targetY) {
        // Beräkna vinkel mot spelare
        let angle = atan2(targetY - y, targetX - x);
        
        // Modifiera vinkel vid behov för att göra det lättare för spelaren
        angle += random(-0.2, 0.2); // Lite slumpmässig spridning
        
        super(x, y, angle + PI/2); // +PI/2 för att justera vinkel
        
        this.speed = 4; // Fiendeskott är långsammare
        this.vel = createVector(cos(angle) * this.speed, sin(angle) * this.speed);
        
        // Röd färg för fiendeskott
        this.color = color(255, 102, 102);
    }
    
    display() {
        // Rita alla trails först
        noStroke();
        for (let trail of this.trails) {
            fill(255, 102, 102, trail.alpha * 255);
            ellipse(trail.x, trail.y, trail.size, trail.size * 1.5);
        }
        
        // Rita huvudskottet
        push();
        translate(this.pos.x, this.pos.y);
        
        // Rotation för att matcha rörelseriktningen
        rotate(atan2(this.vel.y, this.vel.x) + PI/2);
        
        // Glödande effekt
        noStroke();
        fill(255, 102, 102, 128);
        ellipse(0, 0, this.size * 1.5, this.size * 2);
        
        // Huvuddelen av skottet
        fill(255, 102, 102);
        ellipse(0, 0, this.size, this.size * 1.2);
        
        // Ljusare kärna
        fill(255, 204, 204);
        ellipse(0, 0, this.size * 0.5, this.size * 0.5);
        
        pop();
    }
} 