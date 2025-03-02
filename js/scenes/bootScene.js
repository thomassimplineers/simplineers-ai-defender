// BootScene - Hanterar laddning och initiering
class BootScene {
    constructor() {
        this.loaded = false;
        this.assets = {
            images: 0,
            sounds: 0,
            total: 0
        };
    }
    
    preload() {
        console.log("BootScene preload");
        // p5.js-sättet att ladda resurser
        // Obs: p5.js hanterar resursladdning annorlunda än Phaser
        
        // Vi kan ladda bilder så här
        // loadImage('assets/images/player.png', img => {
        //     this.playerImage = img;
        //     this.assets.images++;
        //     this.checkLoading();
        // });
        
        // För att förenkla kan vi markera att allt är laddat direkt
        this.loaded = true;
        
        console.log("BootScene preload complete");
    }
    
    checkLoading() {
        // Enkel laddningskontroll
        if (this.assets.images >= this.assets.total) {
            this.loaded = true;
        }
    }
    
    start() {
        if (this.loaded) {
            console.log("BootScene starting game");
            // Starta spelet
            gameScene = new GameScene();
            gameScene.setup();
        } else {
            console.log("BootScene still loading...");
            // Vänta lite och försök igen
            setTimeout(() => this.start(), 100);
        }
    }
}

// Skapa en global bootScene-instans
let bootScene;