class Starfield {
    constructor() {
        this.stars = [];
        this.numStars = 200;
        this.layers = 3; // Flera lager med stjärnor
        this.initStars();
        
        // Skapa nebulosa
        this.nebulaX = random(100, width - 100);
        this.nebulaY = random(100, height - 100);
        this.nebulaColor = color(
            random(20, 40),
            random(30, 60),
            random(80, 150),
            50
        );
    }
    
    initStars() {
        for (let i = 0; i < this.numStars; i++) {
            let layer = floor(random(1, this.layers + 1));
            let speedFactor = layer / this.layers; // Djupare lager rör sig långsammare
            
            this.stars.push({
                x: random(width),
                y: random(height),
                size: random(0.5, 2) * speedFactor * 2,
                speed: random(0.5, 2) * speedFactor,
                brightness: random(150, 255),
                twinkle: random(1) > 0.8,
                layer: layer
            });
        }
    }
    
    update() {
        // Uppdatera stjärnpositioner
        for (let i = 0; i < this.stars.length; i++) {
            let star = this.stars[i];
            star.y += star.speed;
            
            // Återställ till toppen när stjärnan når botten
            if (star.y > height) {
                star.y = 0;
                star.x = random(width);
            }
            
            // Blinkeffekt
            if (star.twinkle) {
                star.brightness = 150 + sin(frameCount * 0.05 + i) * 100;
            }
        }
    }
    
    display() {
        // Rita nebulosa först (i bakgrunden)
        this.drawNebula();
        
        // Rita stjärnor
        noStroke();
        for (let i = 0; i < this.stars.length; i++) {
            let star = this.stars[i];
            fill(star.brightness);
            let size = star.size * (star.layer/3);
            ellipse(star.x, star.y, size, size);
        }
    }
    
    drawNebula() {
        // Rita flera lager av transparenta cirklar för nebulosaeffekt
        noStroke();
        let layers = 5;
        
        for (let i = 0; i < layers; i++) {
            let size = 100 + (i * 50);
            let alpha = 0.05 - (i * 0.008);
            fill(
                red(this.nebulaColor),
                green(this.nebulaColor),
                blue(this.nebulaColor),
                alpha * 255
            );
            ellipse(this.nebulaX, this.nebulaY, size, size);
        }
    }
} 