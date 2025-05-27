// Neural Network Boss - Level 10 Epic Boss
class NeuralNetworkBoss extends Boss {
    constructor(x, y) {
        super(x, y, 10);
        this.size = 120;
        this.health = 150;
        this.maxHealth = 150;
        this.phase = 1;
        
        // Satellites that orbit around the boss
        this.satellites = [
            {angle: 0, distance: 80, health: 20, maxHealth: 20, color: color(52, 152, 219), type: 'blue'},
            {angle: 2*PI/3, distance: 80, health: 20, maxHealth: 20, color: color(231, 76, 60), type: 'red'},
            {angle: 4*PI/3, distance: 80, health: 20, maxHealth: 20, color: color(39, 174, 96), type: 'green'}
        ];
        
        // Neural network effects
        this.neuralPulse = 0;
        this.nodes = [];
        this.initializeNodes();
        
        // Attack timers
        this.specialAttackTimer = 0;
        this.specialAttackCooldown = 180; // 3 seconds at 60 FPS
        this.predictiveTargeting = false;
        this.playerPositionHistory = [];
        
        // Phase transition effects
        this.phaseTransition = false;
        this.transitionTimer = 0;
        
        // Environmental hazards
        this.dataCorruptionZones = [];
        this.firewallBarriers = [];
        
        // Dialog
        this.currentDialog = "INITIATING NEURAL NETWORK...";
        this.dialogTimer = 120;
    }
    
    initializeNodes() {
        // Create neural network nodes for visual effect
        for (let i = 0; i < 8; i++) {
            let angle = (TWO_PI / 8) * i;
            let distance = random(30, 50);
            this.nodes.push({
                angle: angle,
                distance: distance,
                pulseOffset: random(TWO_PI)
            });
        }
    }
    
    update() {
        // Update neural pulse effect
        this.neuralPulse += 0.05;
        
        // Update phase based on health
        let healthPercentage = this.health / this.maxHealth;
        if (healthPercentage <= 0.33 && this.phase !== 3) {
            this.enterPhase(3);
        } else if (healthPercentage <= 0.66 && healthPercentage > 0.33 && this.phase !== 2) {
            this.enterPhase(2);
        }
        
        // Phase transition handling
        if (this.phaseTransition) {
            this.transitionTimer++;
            if (this.transitionTimer > 60) {
                this.phaseTransition = false;
                this.transitionTimer = 0;
            }
            return; // Don't attack during transition
        }
        
        // Movement pattern based on phase
        this.updateMovement();
        
        // Update satellites
        this.updateSatellites();
        
        // Track player position for predictive targeting
        if (player && frameCount % 5 === 0) {
            this.playerPositionHistory.push({x: player.pos.x, y: player.pos.y});
            if (this.playerPositionHistory.length > 20) {
                this.playerPositionHistory.shift();
            }
        }
        
        // Enable predictive targeting after 10 seconds
        if (frameCount % 600 === 0 && this.phase >= 2) {
            this.predictiveTargeting = true;
        }
        
        // Update environmental hazards
        this.updateEnvironmentalHazards();
        
        // Special attacks based on phase
        this.specialAttackTimer++;
        if (this.specialAttackTimer >= this.specialAttackCooldown) {
            this.executeSpecialAttack();
            this.specialAttackTimer = 0;
        }
        
        // Regular attacks
        this.fireTimer++;
        if (this.fireTimer >= this.fireRate) {
            this.fire();
            this.fireTimer = 0;
        }
        
        // Update dialog
        if (this.dialogTimer > 0) {
            this.dialogTimer--;
        }
    }
    
    updateMovement() {
        switch(this.phase) {
            case 1:
                // Slow horizontal movement
                this.vel.x = sin(frameCount * 0.02) * 2;
                break;
            case 2:
                // Figure-8 pattern
                this.vel.x = sin(frameCount * 0.03) * 3;
                this.vel.y = sin(frameCount * 0.06) * 0.5;
                break;
            case 3:
                // Erratic movement
                if (frameCount % 30 === 0) {
                    this.vel.x = random(-4, 4);
                    this.vel.y = random(-1, 1);
                }
                break;
        }
        
        this.pos.add(this.vel);
        this.pos.x = constrain(this.pos.x, this.size/2, width - this.size/2);
        this.pos.y = constrain(this.pos.y, 50, 150);
    }
    
    updateSatellites() {
        this.satellites.forEach((satellite, index) => {
            satellite.angle += 0.02;
            
            // Satellite attacks
            if (satellite.health > 0 && frameCount % 90 === 0) {
                let satX = this.pos.x + cos(satellite.angle) * satellite.distance;
                let satY = this.pos.y + sin(satellite.angle) * satellite.distance;
                
                switch(satellite.type) {
                    case 'blue':
                        // Homing missile
                        bullets.push(new HomingBullet(satX, satY, player));
                        break;
                    case 'red':
                        // Rapid fire
                        for (let i = 0; i < 3; i++) {
                            setTimeout(() => {
                                bullets.push(new EnemyBullet(satX, satY, player.pos.x, player.pos.y));
                            }, i * 100);
                        }
                        break;
                    case 'green':
                        // Heal the boss
                        if (this.health < this.maxHealth) {
                            this.health += 2;
                            // Visual healing effect would go here
                        }
                        break;
                }
            }
        });
    }
    
    updateEnvironmentalHazards() {
        // Update data corruption zones
        this.dataCorruptionZones = this.dataCorruptionZones.filter(zone => {
            zone.lifetime--;
            return zone.lifetime > 0;
        });
        
        // Create new corruption zones in phase 3
        if (this.phase === 3 && frameCount % 120 === 0) {
            this.dataCorruptionZones.push({
                x: random(50, width - 50),
                y: random(200, height - 100),
                radius: 40,
                lifetime: 180
            });
        }
    }
    
    executeSpecialAttack() {
        switch(this.phase) {
            case 1:
                this.trainingDataAttack();
                break;
            case 2:
                this.neuralSpikeAttack();
                break;
            case 3:
                if (frameCount % 2 === 0) {
                    this.recursiveLoopAttack();
                } else {
                    this.systemOverloadAttack();
                }
                break;
        }
    }
    
    trainingDataAttack() {
        // Shoots data symbols (1s and 0s) in waves
        for (let i = 0; i < 8; i++) {
            let angle = (TWO_PI / 8) * i + this.neuralPulse;
            let startX = this.pos.x + cos(angle) * 40;
            let startY = this.pos.y + sin(angle) * 40;
            
            bullets.push(new DataBullet(startX, startY, angle));
        }
    }
    
    neuralSpikeAttack() {
        // Lightning that branches when hitting screen edges
        let targetPos = this.getPredictedPlayerPosition();
        bullets.push(new NeuralSpike(this.pos.x, this.pos.y, targetPos.x, targetPos.y));
    }
    
    recursiveLoopAttack() {
        // Create mini copies
        if (!this.miniCopies || this.miniCopies.length === 0) {
            this.miniCopies = [];
            for (let i = 0; i < 3; i++) {
                let angle = (TWO_PI / 3) * i;
                let x = this.pos.x + cos(angle) * 100;
                let y = this.pos.y + sin(angle) * 100;
                enemies.push(new MiniBoss(x, y, this));
            }
        }
    }
    
    systemOverloadAttack() {
        // Chaotic projectile patterns
        for (let i = 0; i < 20; i++) {
            let angle = random(TWO_PI);
            let speed = random(1, 3);
            let startX = this.pos.x + cos(angle) * 50;
            let startY = this.pos.y + sin(angle) * 50;
            
            bullets.push(new ChaosBullet(startX, startY, angle, speed));
        }
    }
    
    fire() {
        if (!player) return;
        
        let targetPos = this.predictiveTargeting ? 
            this.getPredictedPlayerPosition() : 
            {x: player.pos.x, y: player.pos.y};
        
        // Phase-specific firing patterns
        switch(this.phase) {
            case 1:
                // Triple shot
                for (let i = -1; i <= 1; i++) {
                    bullets.push(new EnemyBullet(
                        this.pos.x + i * 20, 
                        this.pos.y + 30, 
                        targetPos.x + i * 30, 
                        targetPos.y
                    ));
                }
                break;
            case 2:
                // Spiral pattern
                for (let i = 0; i < 5; i++) {
                    let angle = (TWO_PI / 5) * i + frameCount * 0.05;
                    let targetX = this.pos.x + cos(angle) * 200;
                    let targetY = this.pos.y + sin(angle) * 200;
                    bullets.push(new EnemyBullet(this.pos.x, this.pos.y, targetX, targetY));
                }
                break;
            case 3:
                // Omnidirectional burst
                for (let i = 0; i < 12; i++) {
                    let angle = (TWO_PI / 12) * i;
                    let targetX = this.pos.x + cos(angle) * 300;
                    let targetY = this.pos.y + sin(angle) * 300;
                    bullets.push(new EnemyBullet(this.pos.x, this.pos.y, targetX, targetY));
                }
                break;
        }
    }
    
    getPredictedPlayerPosition() {
        if (this.playerPositionHistory.length < 2) {
            return {x: player.pos.x, y: player.pos.y};
        }
        
        // Simple linear prediction
        let recent = this.playerPositionHistory[this.playerPositionHistory.length - 1];
        let previous = this.playerPositionHistory[this.playerPositionHistory.length - 2];
        
        let dx = recent.x - previous.x;
        let dy = recent.y - previous.y;
        
        return {
            x: recent.x + dx * 10, // Predict 10 frames ahead
            y: recent.y + dy * 10
        };
    }
    
    enterPhase(newPhase) {
        this.phase = newPhase;
        this.phaseTransition = true;
        
        // Update dialog
        switch(newPhase) {
            case 2:
                this.currentDialog = "DEEP LEARNING PROTOCOLS ENGAGED";
                this.fireRate = 45; // Faster firing
                break;
            case 3:
                this.currentDialog = "WARNING: SINGULARITY IMMINENT";
                this.fireRate = 30; // Even faster
                // Screen shake effect would go here
                break;
        }
        this.dialogTimer = 120;
    }
    
    takeDamage(amount) {
        // Check if satellites are still alive
        let activeSatellites = this.satellites.filter(s => s.health > 0);
        
        if (activeSatellites.length > 0 && this.phase === 1) {
            // Damage satellites first in phase 1
            let satellite = activeSatellites[Math.floor(Math.random() * activeSatellites.length)];
            satellite.health -= amount;
            return false;
        }
        
        // Phase 2 prediction shield
        if (this.phase === 2 && frameCount % 3 === 0) {
            // Block every third hit
            return false;
        }
        
        this.health -= amount;
        return this.health <= 0;
    }
    
    display() {
        push();
        translate(this.pos.x, this.pos.y);
        
        // Phase transition effect
        if (this.phaseTransition) {
            push();
            noFill();
            stroke(255, 255, 255, 255 - this.transitionTimer * 4);
            strokeWeight(3);
            ellipse(0, 0, this.size + this.transitionTimer * 2, this.size + this.transitionTimer * 2);
            pop();
        }
        
        // Neural network connections
        stroke(100, 150, 255, 100);
        strokeWeight(1);
        this.nodes.forEach((node, i) => {
            let x1 = cos(node.angle) * node.distance;
            let y1 = sin(node.angle) * node.distance;
            
            // Connect to adjacent nodes
            let nextNode = this.nodes[(i + 1) % this.nodes.length];
            let x2 = cos(nextNode.angle) * nextNode.distance;
            let y2 = sin(nextNode.angle) * nextNode.distance;
            
            // Pulsing connection
            let pulse = sin(this.neuralPulse + node.pulseOffset) * 0.5 + 0.5;
            stroke(100, 150, 255, 100 + pulse * 155);
            line(x1, y1, x2, y2);
        });
        
        // Main body - brain-like structure
        let coreColor = lerpColor(
            color(0, 100, 200), 
            color(255, 100, 0), 
            1 - (this.health / this.maxHealth)
        );
        
        fill(coreColor);
        noStroke();
        
        // Organic brain shape
        beginShape();
        for (let i = 0; i < 20; i++) {
            let angle = (TWO_PI / 20) * i;
            let r = this.size / 2 + sin(angle * 3 + this.neuralPulse) * 10;
            let x = cos(angle) * r;
            let y = sin(angle) * r;
            vertex(x, y);
        }
        endShape(CLOSE);
        
        // Neural nodes
        this.nodes.forEach(node => {
            let x = cos(node.angle) * node.distance;
            let y = sin(node.angle) * node.distance;
            let pulse = sin(this.neuralPulse + node.pulseOffset) * 0.5 + 0.5;
            
            fill(150, 200, 255, 200);
            ellipse(x, y, 10 + pulse * 5, 10 + pulse * 5);
        });
        
        // Central core
        let corePulse = sin(this.neuralPulse * 2) * 0.3 + 0.7;
        fill(255, 255, 255, 200 * corePulse);
        ellipse(0, 0, 30, 30);
        
        // Draw satellites
        this.satellites.forEach(satellite => {
            if (satellite.health > 0) {
                let satX = cos(satellite.angle) * satellite.distance;
                let satY = sin(satellite.angle) * satellite.distance;
                
                push();
                translate(satX, satY);
                
                // Satellite body
                fill(satellite.color);
                ellipse(0, 0, 25, 25);
                
                // Satellite health indicator
                let healthPercent = satellite.health / satellite.maxHealth;
                fill(255, 255, 255, 100);
                arc(0, 0, 25, 25, 0, TWO_PI * healthPercent);
                
                pop();
            }
        });
        
        // Health bar
        let healthPercentage = this.health / this.maxHealth;
        fill(0, 0, 0, 150);
        rect(0, -this.size/2 - 25, this.size + 20, 8);
        
        let healthColor = healthPercentage > 0.5 ? color(0, 255, 0) : 
                         healthPercentage > 0.25 ? color(255, 255, 0) : 
                         color(255, 0, 0);
        fill(healthColor);
        rect(0, -this.size/2 - 25, (this.size + 20) * healthPercentage, 8);
        
        pop();
        
        // Draw environmental hazards
        this.drawEnvironmentalHazards();
        
        // Draw dialog
        if (this.dialogTimer > 0) {
            push();
            fill(255, 255, 255, this.dialogTimer * 2);
            textAlign(CENTER);
            textSize(16);
            text(this.currentDialog, width/2, 50);
            pop();
        }
    }
    
    drawEnvironmentalHazards() {
        // Data corruption zones
        this.dataCorruptionZones.forEach(zone => {
            push();
            let alpha = (zone.lifetime / 180) * 100;
            fill(255, 0, 0, alpha);
            noStroke();
            
            // Glitchy effect
            for (let i = 0; i < 5; i++) {
                let offset = random(-5, 5);
                ellipse(zone.x + offset, zone.y + offset, zone.radius * 2, zone.radius * 2);
            }
            pop();
        });
    }
    
    onDefeat() {
        // Epic defeat sequence
        this.currentDialog = "SYSTEM DEFEATED - HUMAN INTELLIGENCE PREVAILS!";
        this.dialogTimer = 300;
        
        // Massive explosion effect
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle(
                this.pos.x + random(-50, 50),
                this.pos.y + random(-50, 50),
                random(TWO_PI),
                random(2, 5),
                color(random(200, 255), random(100, 200), random(0, 100))
            ));
        }
        
        // Bonus points
        score += 10000;
        
        // Trigger marketing message after delay
        setTimeout(() => {
            showVictoryDialog();
        }, 3000);
    }
}

// Special bullet types for the boss
class DataBullet extends EnemyBullet {
    constructor(x, y, angle) {
        super(x, y, x + cos(angle) * 500, y + sin(angle) * 500);
        this.symbol = random() > 0.5 ? '1' : '0';
    }
    
    display() {
        push();
        fill(0, 255, 0);
        textAlign(CENTER, CENTER);
        textSize(14);
        text(this.symbol, this.pos.x, this.pos.y);
        pop();
    }
}

class HomingBullet extends EnemyBullet {
    constructor(x, y, target) {
        super(x, y, target.pos.x, target.pos.y);
        this.target = target;
        this.speed = 2;
        this.maxSpeed = 4;
    }
    
    update() {
        if (this.target) {
            let desired = p5.Vector.sub(this.target.pos, this.pos);
            desired.setMag(this.speed);
            
            let steer = p5.Vector.sub(desired, this.vel);
            steer.limit(0.1);
            
            this.vel.add(steer);
            this.vel.limit(this.maxSpeed);
        }
        
        this.pos.add(this.vel);
    }
    
    display() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        fill(52, 152, 219);
        triangle(-5, -3, -5, 3, 5, 0);
        pop();
    }
}

class NeuralSpike extends EnemyBullet {
    constructor(x, y, targetX, targetY) {
        super(x, y, targetX, targetY);
        this.branches = [];
        this.lifetime = 0;
    }
    
    update() {
        super.update();
        this.lifetime++;
        
        // Create branches when hitting edges
        if ((this.pos.x <= 10 || this.pos.x >= width - 10 || 
             this.pos.y <= 10 || this.pos.y >= height - 10) && 
             this.branches.length === 0) {
            
            for (let i = 0; i < 3; i++) {
                let angle = random(TWO_PI);
                this.branches.push(new EnemyBullet(
                    this.pos.x, 
                    this.pos.y,
                    this.pos.x + cos(angle) * 200,
                    this.pos.y + sin(angle) * 200
                ));
            }
            
            // Add branches to main bullet array
            bullets.push(...this.branches);
        }
    }
    
    display() {
        push();
        stroke(255, 255, 0);
        strokeWeight(3);
        
        // Lightning effect
        beginShape();
        for (let i = 0; i < 5; i++) {
            let x = lerp(this.pos.x - this.vel.x * 10, this.pos.x, i / 4);
            let y = lerp(this.pos.y - this.vel.y * 10, this.pos.y, i / 4);
            x += random(-3, 3);
            y += random(-3, 3);
            vertex(x, y);
        }
        endShape();
        
        pop();
    }
}

class ChaosBullet extends EnemyBullet {
    constructor(x, y, angle, speed) {
        super(x, y, x + cos(angle) * 500, y + sin(angle) * 500);
        this.vel = p5.Vector.fromAngle(angle).mult(speed);
        this.color = color(random(255), random(255), random(255));
    }
    
    display() {
        push();
        fill(this.color);
        noStroke();
        ellipse(this.pos.x, this.pos.y, 8, 8);
        pop();
    }
}

class MiniBoss {
    constructor(x, y, parent) {
        this.pos = createVector(x, y);
        this.vel = createVector(random(-2, 2), random(-2, 2));
        this.size = 30;
        this.health = 10;
        this.parent = parent;
        this.angle = 0;
    }
    
    update() {
        this.pos.add(this.vel);
        
        // Bounce off edges
        if (this.pos.x <= this.size/2 || this.pos.x >= width - this.size/2) {
            this.vel.x *= -1;
        }
        if (this.pos.y <= this.size/2 || this.pos.y >= height - this.size/2) {
            this.vel.y *= -1;
        }
        
        this.angle += 0.1;
        
        // Shoot occasionally
        if (frameCount % 60 === 0 && player) {
            bullets.push(new EnemyBullet(this.pos.x, this.pos.y, player.pos.x, player.pos.y));
        }
    }
    
    display() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.angle);
        
        // Mini version of the boss
        fill(100, 150, 200);
        beginShape();
        for (let i = 0; i < 6; i++) {
            let angle = (TWO_PI / 6) * i;
            let x = cos(angle) * this.size/2;
            let y = sin(angle) * this.size/2;
            vertex(x, y);
        }
        endShape(CLOSE);
        
        fill(255);
        ellipse(0, 0, 10, 10);
        
        pop();
    }
    
    collidesWith(entity) {
        let distance = dist(this.pos.x, this.pos.y, entity.pos.x, entity.pos.y);
        return distance < (this.size / 2 + entity.size / 2);
    }
    
    isOffScreen() {
        return false; // Mini bosses don't leave screen
    }
}

// Victory dialog function
function showVictoryDialog() {
    // This would be implemented in the main game file
    // Shows marketing message and course signup
    if (typeof showMarketingDialog === 'function') {
        showMarketingDialog(
            "Du har besegrat AI Overlord!",
            "Men kan du bemästra verklig AI? Upptäck Simplineers AI-kurser och bli en AI-expert på riktigt!",
            10000 // Score bonus
        );
    }
}