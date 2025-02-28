// BootScene - Laddar in resurser och förbereder spelet
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Skapa en laddningsskärm
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Laddar...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        
        // Uppdatera laddningsindikator
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0x1e88e5, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });
        
        // Rensa laddningsskärm när allt är laddat
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        // Ljudeffekter
        this.load.audio('laser', 'assets/sounds/laser.wav');
        this.load.audio('explosion', 'assets/sounds/explosion.wav');
        this.load.audio('powerup', 'assets/sounds/powerup.wav');
        this.load.audio('game-over', 'assets/sounds/game-over.wav');
        this.load.audio('level-up', 'assets/sounds/level-up.wav');
        
        // Bilder för spelarens skepp - vi kommer att rita dem programmatiskt senare
        // Men förbereder resurser här
    }

    create() {
        // Visa en startskärm i 2 sekunder och gå sedan till menyn
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Simplineers AI Defender', {
            font: '32px monospace',
            fill: '#1e88e5'
        }).setOrigin(0.5);
        
        this.time.delayedCall(2000, () => {
            this.scene.start('MenuScene');
        });
    }
}