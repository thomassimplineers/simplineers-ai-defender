// Explosion - Visuell effekt när fiender eller spelaren förstörs

class Explosion {
    constructor(x, y, scale = 1) {
        this.pos = createVector(x, y);
        this.scale = scale;
        this.particles = [];
        this.lifetime = 0;
        this.maxLifetime = 30; // Halv sekund vid 60 FPS
        this.color = color(255, 150, 50);
        
        // Skapa explosionspartiklar
        this.createParticles();
    }
    
    createParticles() {
        // Centrumcirkel
        this.coreSize = 20 * this.scale;
        
        // Yttre partiklar
        const numParticles = floor(10 * this.scale);
        
        for (let i = 0; i < numParticles; i++) {
            const angle = random(TWO_PI);
            const speed = random(1, 4) * this.scale;
            const size = random(3, 10) * this.scale;
            const distance = random(5, 15) * this.scale;
            
            this.particles.push({
                pos: createVector(
                    this.pos.x + cos(angle) * distance,
                    this.pos.y + sin(angle) * distance
                ),
                vel: createVector(cos(angle) * speed, sin(angle) * speed),
                size: size,
                alpha: random(0.7, 1),
                color: lerpColor(
                    color(255, 150, 0),
                    color(255, 50, 0),
                    random(1)
                )
            });
        }
        
        // Ljusblixt
        this.flash = true;
        this.flashSize = 50 * this.scale;
        this.flashAlpha = 0.8;
        
        // Lägg till vågeffekt
        this.wave = {
            size: 5,
            maxSize: 80 * this.scale,
            alpha: 0.7
        };
    }
    
    update() {
        // Uppdatera alla partiklar
        for (let particle of this.particles) {
            particle.pos.add(particle.vel);
            particle.vel.mult(0.94); // Sakta ner
            particle.size *= 0.95;   // Krympa
            particle.alpha *= 0.95;  // Tona ut
        }
        
        // Uppdatera kärnstorlek
        this.coreSize *= 0.9;
        
        // Uppdatera blixt
        if (this.flash) {
            this.flashAlpha *= 0.8;
            this.flashSize *= 1.1;
            
            if (this.flashAlpha < 0.1) {
                this.flash = false;
            }
        }
        
        // Uppdatera livstid
        this.lifetime++;
        
        // Uppdatera vågeffekt
        this.wave.size *= 1.1;
        this.wave.alpha *= 0.95;
        
        // Returnera true om explosionen är klar
        return this.lifetime >= this.maxLifetime;
    }
    
    display() {
        // Rita vågeffekt först
        noFill();
        strokeWeight(2);
        stroke(255, 200, 50, this.wave.alpha * 255);
        ellipse(this.pos.x, this.pos.y, this.wave.size, this.wave.size);
        
        // Rita blixt
        if (this.flash) {
            noStroke();
            fill(255, 255, 200, this.flashAlpha * 255);
            ellipse(this.pos.x, this.pos.y, this.flashSize, this.flashSize);
        }
        
        // Rita partiklar
        noStroke();
        for (let particle of this.particles) {
            fill(
                red(particle.color),
                green(particle.color),
                blue(particle.color),
                particle.alpha * 255
            );
            ellipse(particle.pos.x, particle.pos.y, particle.size, particle.size);
        }
        
        // Rita kärnan
        let coreAlpha = map(this.lifetime, 0, this.maxLifetime, 1, 0);
        fill(255, 200, 50, coreAlpha * 255);
        ellipse(this.pos.x, this.pos.y, this.coreSize, this.coreSize);
    }
    
    isFinished() {
        return this.lifetime >= this.maxLifetime;
    }
} 