/**
 * Simplineers AI Defender - Audio Manager
 * Hanterar ljudeffekter och bakgrundsmusik för spelet
 */

let sounds = {};
let musicPlaying = false;

// Ladda alla ljud
function preloadSounds() {
    // Grundläggande spelarljud
    sounds.playerShoot = loadSound('sounds/player-shoot.mp3');
    sounds.playerHit = loadSound('sounds/player-hit.mp3');
    
    // Fiendeljud
    sounds.enemyExplode = loadSound('sounds/enemy-explode.mp3');
    sounds.bossWarning = loadSound('sounds/boss-warning.mp3');
    
    // Spelmekanikljud
    sounds.powerUp = loadSound('sounds/power-up.mp3');
    sounds.shieldUp = loadSound('sounds/shield-up.mp3');
    sounds.speedUp = loadSound('sounds/speed-up.mp3');
    sounds.weaponUp = loadSound('sounds/weapon-up.mp3');
    sounds.lifeUp = loadSound('sounds/life-up.mp3');
    
    // UI-ljud
    sounds.gameOver = loadSound('sounds/game-over.mp3');
    sounds.levelUp = loadSound('sounds/level-up.mp3');
    
    // Bakgrundsmusik
    sounds.bgMusic = loadSound('sounds/background-music.mp3');
}

// Spela ett ljud
function playSound(soundName, volume = 1.0) {
    if (sounds[soundName]) {
        sounds[soundName].setVolume(volume);
        sounds[soundName].play();
    }
}

// Starta bakgrundsmusik
function startMusic() {
    if (sounds.bgMusic && !musicPlaying) {
        sounds.bgMusic.setVolume(0.4);
        sounds.bgMusic.loop();
        musicPlaying = true;
    }
}

// Stoppa bakgrundsmusik
function stopMusic() {
    if (sounds.bgMusic && musicPlaying) {
        sounds.bgMusic.stop();
        musicPlaying = false;
    }
}

// Istället för export { ... } i slutet, gör funktionerna globala:
window.preloadSounds = preloadSounds;
window.playSound = playSound;
window.startMusic = startMusic;
window.stopMusic = stopMusic; 