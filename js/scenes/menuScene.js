// MenuScene - Visar huvudmenyn med alternativ
class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Titel
        const title = this.add.text(width / 2, height / 4, 'SIMPLINEERS AI DEFENDER', {
            font: '36px monospace',
            fill: '#1e88e5',
            stroke: '#ffffff',
            strokeThickness: 1
        });
        title.setOrigin(0.5);
        
        // Undertitel
        const subtitle = this.add.text(width / 2, height / 4 + 50, 'Försvara AI-galaxen', {
            font: '24px monospace',
            fill: '#ffffff'
        });
        subtitle.setOrigin(0.5);
        
        // Start-knapp
        const startButton = this.add.text(width / 2, height / 2, 'STARTA SPELET', {
            font: '26px monospace',
            fill: '#ffffff',
            backgroundColor: '#1e88e5',
            padding: {
                x: 20,
                y: 10
            }
        });
        startButton.setOrigin(0.5);
        startButton.setInteractive({ useHandCursor: true });
        
        // Instruktioner-knapp
        const instructionsButton = this.add.text(width / 2, height / 2 + 80, 'INSTRUKTIONER', {
            font: '26px monospace',
            fill: '#ffffff',
            backgroundColor: '#1e88e5',
            padding: {
                x: 20,
                y: 10
            }
        });
        instructionsButton.setOrigin(0.5);
        instructionsButton.setInteractive({ useHandCursor: true });
        
        // Topplista-knapp
        const highscoreButton = this.add.text(width / 2, height / 2 + 160, 'TOPPLISTA', {
            font: '26px monospace',
            fill: '#ffffff',
            backgroundColor: '#1e88e5',
            padding: {
                x: 20,
                y: 10
            }
        });
        highscoreButton.setOrigin(0.5);
        highscoreButton.setInteractive({ useHandCursor: true });
        
        // Hover-effekt på knapparna
        this.input.on('gameobjectover', function (pointer, gameObject) {
            gameObject.setTint(0x90caf9);
        });
        
        this.input.on('gameobjectout', function (pointer, gameObject) {
            gameObject.clearTint();
        });
        
        // Klick-händelser
        startButton.on('pointerdown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene');
            });
        });
        
        instructionsButton.on('pointerdown', () => {
            this.showInstructions();
        });
        
        highscoreButton.on('pointerdown', () => {
            this.showHighscores();
        });
        
        // Bakgrundsanimation med några "stjärnor" som rör sig
        this.createBackgroundStars();
    }
    
    createBackgroundStars() {
        // Skapa 100 stjärnor (små prickar) som rör sig uppåt
        const stars = [];
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const speed = Phaser.Math.Between(20, 100) / 100;
            
            const star = this.add.circle(x, y, Phaser.Math.Between(1, 2), 0xffffff, 0.5);
            stars.push({ obj: star, speed: speed });
        }
        
        // Uppdatera stjärnorna varje frame
        this.events.on('update', () => {
            stars.forEach(star => {
                star.obj.y -= star.speed;
                
                if (star.obj.y < 0) {
                    star.obj.y = this.cameras.main.height;
                    star.obj.x = Phaser.Math.Between(0, this.cameras.main.width);
                }
            });
        });
    }
    
    showInstructions() {
        // Skapa en modal ruta med instruktioner
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Bakgrund
        const bg = this.add.rectangle(width / 2, height / 2, 600, 400, 0x0a1929, 0.9);
        bg.setStrokeStyle(2, 0x1e88e5);
        
        // Titel
        const title = this.add.text(width / 2, height / 2 - 150, 'INSTRUKTIONER', {
            font: '28px monospace',
            fill: '#1e88e5'
        });
        title.setOrigin(0.5);
        
        // Instruktioner
        const instructions = [
            '- Använd piltangenterna för att röra dig ⬅️ ➡️',
            '- Mellanslag eller musklick för att skjuta 🔫',
            '- Samla power-ups för uppgraderingar',
            '- Undvik eller förstör fiendeskepp',
            '- Besegra bossar för att avancera till nästa nivå',
            '- Varje nivå blir svårare med fler fiender'
        ];
        
        let yPos = height / 2 - 80;
        instructions.forEach(instruction => {
            this.add.text(width / 2 - 250, yPos, instruction, {
                font: '16px monospace',
                fill: '#ffffff'
            });
            yPos += 30;
        });
        
        // Stäng-knapp
        const closeButton = this.add.text(width / 2, height / 2 + 150, 'STÄNG', {
            font: '20px monospace',
            fill: '#ffffff',
            backgroundColor: '#1e88e5',
            padding: {
                x: 15,
                y: 8
            }
        });
        closeButton.setOrigin(0.5);
        closeButton.setInteractive({ useHandCursor: true });
        
        // Samla alla objekt i en grupp
        const modalGroup = this.add.group();
        modalGroup.add(bg);
        modalGroup.add(title);
        modalGroup.add(closeButton);
        
        // Stäng modal vid klick
        closeButton.on('pointerdown', () => {
            modalGroup.clear(true, true);
        });
    }
    
    showHighscores() {
        // Hämta och visa topplistan i ett modalt fönster
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Bakgrund
        const bg = this.add.rectangle(width / 2, height / 2, 600, 400, 0x0a1929, 0.9);
        bg.setStrokeStyle(2, 0x1e88e5);
        
        // Titel
        const title = this.add.text(width / 2, height / 2 - 150, 'TOPPLISTA', {
            font: '28px monospace',
            fill: '#1e88e5'
        });
        title.setOrigin(0.5);
        
        // Om vi har highscores, visa dem
        if (window.gameState.highScores && window.gameState.highScores.length > 0) {
            let yPos = height / 2 - 100;
            
            // Rubriker
            this.add.text(width / 2 - 250, yPos, 'POSITION', {
                font: '18px monospace',
                fill: '#1e88e5'
            });
            
            this.add.text(width / 2 - 120, yPos, 'NAMN', {
                font: '18px monospace',
                fill: '#1e88e5'
            });
            
            this.add.text(width / 2 + 100, yPos, 'POÄNG', {
                font: '18px monospace',
                fill: '#1e88e5'
            });
            
            yPos += 30;
            
            // Visa de 10 bästa poängen
            window.gameState.highScores.slice(0, 10).forEach((score, index) => {
                this.add.text(width / 2 - 250, yPos, `${index + 1}.`, {
                    font: '16px monospace',
                    fill: '#ffffff'
                });
                
                this.add.text(width / 2 - 120, yPos, score.name, {
                    font: '16px monospace',
                    fill: '#ffffff'
                });
                
                this.add.text(width / 2 + 100, yPos, score.score, {
                    font: '16px monospace',
                    fill: '#ffffff'
                });
                
                yPos += 30;
            });
        } else {
            // Om det inte finns några highscores
            this.add.text(width / 2, height / 2, 'Inga resultat ännu. Bli den första!', {
                font: '18px monospace',
                fill: '#ffffff'
            }).setOrigin(0.5);
        }
        
        // Stäng-knapp
        const closeButton = this.add.text(width / 2, height / 2 + 150, 'STÄNG', {
            font: '20px monospace',
            fill: '#ffffff',
            backgroundColor: '#1e88e5',
            padding: {
                x: 15,
                y: 8
            }
        });
        closeButton.setOrigin(0.5);
        closeButton.setInteractive({ useHandCursor: true });
        
        // Samla alla objekt i en grupp
        const modalGroup = this.add.group();
        modalGroup.add(bg);
        modalGroup.add(title);
        modalGroup.add(closeButton);
        
        // Stäng modal vid klick
        closeButton.on('pointerdown', () => {
            modalGroup.clear(true, true);
        });
    }
}