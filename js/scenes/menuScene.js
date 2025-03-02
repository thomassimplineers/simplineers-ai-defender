// MenuScene - Visar huvudmenyn med alternativ
class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Bakgrund
        this.add.rectangle(width/2, height/2, width, height, 0x0a1929);
        
        // Titel
        const title = this.add.text(
            width/2, 
            height/4, 
            'SIMPLINEERS\nAI DEFENDER', 
            { 
                fontFamily: 'Arial', 
                fontSize: 48, 
                color: '#1e88e5',
                align: 'center',
                fontWeight: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // Animera titeln
        this.tweens.add({
            targets: title,
            y: title.y - 10,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        // Spela-knapp
        const playButton = this.add.rectangle(
            width/2, 
            height/2, 
            200, 
            50, 
            0x1e88e5
        ).setInteractive();
        
        const playText = this.add.text(
            width/2, 
            height/2, 
            'PLAY', 
            { 
                fontFamily: 'Arial', 
                fontSize: 24, 
                color: '#ffffff',
                fontWeight: 'bold'
            }
        ).setOrigin(0.5);
        
        // Highscore-knapp
        const highscoreButton = this.add.rectangle(
            width/2, 
            height/2 + 70, 
            200, 
            50, 
            0x162b3d
        ).setInteractive();
        
        const highscoreText = this.add.text(
            width/2, 
            height/2 + 70, 
            'HIGHSCORES', 
            { 
                fontFamily: 'Arial', 
                fontSize: 24, 
                color: '#ffffff' 
            }
        ).setOrigin(0.5);
        
        // Ljud-knapp
        const soundButton = this.add.rectangle(
            width - 50, 
            50, 
            40, 
            40, 
            0x162b3d
        ).setInteractive();
        
        const soundIcon = this.add.text(
            width - 50, 
            50, 
            window.audioManager && window.audioManager.isMuted ? '🔇' : '🔊', 
            { 
                fontSize: 24 
            }
        ).setOrigin(0.5);
        
        // Händelsehanterare för knappar
        playButton.on('pointerdown', () => {
            // Starta spelet
            this.scene.start('GameScene');
            
            // Starta bakgrundsmusik
            if (window.audioManager) {
                window.audioManager.playMusic();
            }
        });
        
        playButton.on('pointerover', () => {
            playButton.fillColor = 0x1565c0;
        });
        
        playButton.on('pointerout', () => {
            playButton.fillColor = 0x1e88e5;
        });
        
        highscoreButton.on('pointerdown', () => {
            // Visa highscore-listan
            if (window.highscoreManager) {
                window.highscoreManager.showHighscores();
            }
        });
        
        highscoreButton.on('pointerover', () => {
            highscoreButton.fillColor = 0x1e3a52;
        });
        
        highscoreButton.on('pointerout', () => {
            highscoreButton.fillColor = 0x162b3d;
        });
        
        soundButton.on('pointerdown', () => {
            // Växla ljud på/av
            if (window.audioManager) {
                const isMuted = window.audioManager.toggleMute();
                soundIcon.setText(isMuted ? '🔇' : '🔊');
            }
        });
        
        // Instruktioner
        this.add.text(
            width/2, 
            height - 100, 
            'Use arrow keys to move\nSpace or click to shoot', 
            { 
                fontFamily: 'Arial', 
                fontSize: 16, 
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Copyright
        this.add.text(
            width/2, 
            height - 30, 
            '© 2025 Simplineers', 
            { 
                fontFamily: 'Arial', 
                fontSize: 12, 
                color: '#666666' 
            }
        ).setOrigin(0.5);
        
        // Kommentera bort ljudhanteraren tills vidare
        /*
        if (window.audioManager) {
            window.audioManager.init(this);
        }
        */
    }
}