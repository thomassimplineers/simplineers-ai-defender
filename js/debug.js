/**
 * Debug.js - Ett enkelt men kraftfullt debug-verktyg för AI Defender
 * Lägg till denna fil och inkludera den i index.html
 */

// Debug-system med olika nivåer
const DEBUG = {
    // Inställningar
    ENABLED: true,
    VISUAL_HELPERS: true,
    LOG_LEVEL: 'info', // 'error', 'warning', 'info', 'debug'
    
    // Färger för visuell debugging
    COLORS: {
        error: '#FF5555',
        warning: '#FFAA00',
        info: '#55AAFF',
        debug: '#AAAAAA',
        player: '#00FF00',
        enemy: '#FF0000',
        bullet: '#FFFF00',
        powerup: '#FF00FF',
        boundary: '#00FFFF'
    },
    
    // Statusspårning
    status: {
        frame: 0,
        playerCreated: false,
        playerUpdated: false, 
        playerDisplayed: false,
        playerHealth: 0,
        enemiesCreated: 0,
        bulletsCreated: 0,
        lastError: null,
        objectCounts: {},
        renderSuccess: false,
        gameLoopRunning: false
    },
    
    // Metoder
    log: function(level, message, data) {
        if (!this.ENABLED) return;
        
        const levels = {
            'error': 0,
            'warning': 1,
            'info': 2,
            'debug': 3
        };
        
        const logLevelValue = levels[this.LOG_LEVEL] || 2;
        const msgLevelValue = levels[level] || 3;
        
        if (msgLevelValue <= logLevelValue) {
            let style = `color: ${this.COLORS[level] || '#FFFFFF'}; font-weight: bold;`;
            
            if (data) {
                console.groupCollapsed(`%c[${level.toUpperCase()}] ${message}`, style);
                console.log(data);
                console.groupEnd();
            } else {
                console.log(`%c[${level.toUpperCase()}] ${message}`, style);
            }
            
            if (level === 'error') {
                this.status.lastError = { message, timestamp: Date.now() };
            }
        }
    },
    
    error: function(message, data) {
        this.log('error', message, data);
    },
    
    warning: function(message, data) {
        this.log('warning', message, data);
    },
    
    info: function(message, data) {
        this.log('info', message, data);
    },
    
    debug: function(message, data) {
        this.log('debug', message, data);
    },
    
    // Visuella hjälpmedel
    drawDebugInfo: function() {
        if (!this.ENABLED || !this.VISUAL_HELPERS) return;
        
        push();
        
        // Rita grundläggande information
        fill(0, 0, 0, 180);
        noStroke();
        rect(10, 10, 250, 140);
        
        fill(255);
        textSize(14);
        textAlign(LEFT, TOP);
        text(`Frame: ${this.status.frame}`, 20, 20);
        text(`Player: ${this.status.playerCreated ? '✅' : '❌'}`, 20, 40);
        text(`Player Updated: ${this.status.playerUpdated ? '✅' : '❌'}`, 20, 60);
        text(`Player Displayed: ${this.status.playerDisplayed ? '✅' : '❌'}`, 20, 80);
        text(`Enemies: ${this.status.objectCounts.enemies || 0}`, 20, 100);
        text(`Bullets: ${this.status.objectCounts.bullets || 0}`, 20, 120);
        
        // Visa senaste fel
        if (this.status.lastError) {
            fill(this.COLORS.error);
            text(`Error: ${this.status.lastError.message}`, 20, 150);
            
            // Visa om felet är färskt (mindre än 5 sekunder)
            const errorAge = Date.now() - this.status.lastError.timestamp;
            if (errorAge < 5000) {
                fill(this.COLORS.error);
                rect(0, 0, width, 5);
                rect(0, height-5, width, 5);
                rect(0, 0, 5, height);
                rect(width-5, 0, 5, height);
            }
        }
        
        // Rita hjälplinjer för spelgränser
        stroke(this.COLORS.boundary);
        strokeWeight(1);
        noFill();
        rect(0, 0, width, height);
        
        pop();
    },
    
    // Hjälpfunktioner för vanliga operationer
    trackObject: function(type, obj) {
        this.status.objectCounts[type] = (this.status.objectCounts[type] || 0) + 1;
        return obj;
    },
    
    watchFunction: function(name, fn, context, ...args) {
        try {
            this.debug(`Calling ${name}`);
            const result = fn.apply(context, args);
            this.debug(`${name} completed`);
            return result;
        } catch (error) {
            this.error(`Error in ${name}:`, error);
            throw error;
        }
    },
    
    resetStatus: function() {
        this.status.playerUpdated = false;
        this.status.playerDisplayed = false;
        this.status.renderSuccess = false;
        this.status.objectCounts = {};
    },
    
    // Starta en ny frame
    startFrame: function() {
        this.resetStatus();
        this.status.frame++;
        this.status.gameLoopRunning = true;
    },
    
    endFrame: function() {
        this.status.renderSuccess = true;
    },
    
    // Skapa ett objekt-prövarwrapper
    wrap: function(obj, name) {
        if (!this.ENABLED) return obj;
        
        const debug = this;
        const handler = {
            get: function(target, prop, receiver) {
                const origValue = Reflect.get(target, prop, receiver);
                
                if (typeof origValue === 'function') {
                    return function(...args) {
                        try {
                            debug.debug(`${name}.${prop} called`);
                            const result = origValue.apply(this === receiver ? target : this, args);
                            
                            if (prop === 'update') {
                                if (name === 'player') debug.status.playerUpdated = true;
                            } else if (prop === 'display') {
                                if (name === 'player') debug.status.playerDisplayed = true;
                            }
                            
                            return result;
                        } catch (error) {
                            debug.error(`Error in ${name}.${prop}:`, error);
                            throw error;
                        }
                    };
                }
                
                return origValue;
            }
        };
        
        return new Proxy(obj, handler);
    }
};

// Patcha p5.js-funktioner för att lägga till bättre felhantering
window.addEventListener('load', function() {
    if (!DEBUG.ENABLED) return;
    
    // Patcha setup för att spåra initialisering
    const origSetup = window.setup;
    window.setup = function() {
        try {
            DEBUG.info("Running setup()");
            const result = origSetup.apply(this, arguments);
            DEBUG.info("Setup completed successfully");
            return result;
        } catch (error) {
            DEBUG.error("Error in setup():", error);
            displaySetupError(error);
            throw error;
        }
    };
    
    // Patcha draw för att spåra rendering
    const origDraw = window.draw;
    window.draw = function() {
        try {
            DEBUG.startFrame();
            const result = origDraw.apply(this, arguments);
            DEBUG.endFrame();
            return result;
        } catch (error) {
            DEBUG.error("Error in draw():", error);
            displayRenderError(error);
            throw error;
        } finally {
            if (DEBUG.VISUAL_HELPERS) {
                DEBUG.drawDebugInfo();
            }
        }
    };
    
    // Hjälpfunktioner för att visa fel direkt på canvas
    function displaySetupError(error) {
        if (window.canvas) {
            push();
            background(40, 0, 0);
            fill(255);
            textSize(16);
            textAlign(CENTER, CENTER);
            text("SETUP ERROR", width/2, height/2 - 40);
            text(error.message, width/2, height/2);
            text("Check console (F12) for details", width/2, height/2 + 40);
            pop();
        }
    }
    
    function displayRenderError(error) {
        push();
        background(40, 0, 0, 200);
        fill(255);
        textSize(16);
        textAlign(CENTER, CENTER);
        text("RENDER ERROR", width/2, height/2 - 40);
        text(error.message, width/2, height/2);
        text("Check console (F12) for details", width/2, height/2 + 40);
        pop();
    }
    
    DEBUG.info("Debug system initialized");
});

// Test för Supabase anslutning
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Testing Supabase connection...');
    
    // Kontrollera om Supabase-konfigurationen finns
    if (!window.supabaseClient) {
        console.warn('Supabase client not found. Using local storage fallback.');
        setupLocalStorageFallback();
        return;
    }
    
    try {
        // Enkelt test för att kolla anslutningen
        const { data, error } = await window.supabaseClient
            .from('highscores')
            .select('count()', { count: 'exact', head: true });
            
        if (error) throw error;
        
        console.log('Supabase connection successful!');
        console.log('Number of highscore entries:', data);
        
        // Ladda highscores om anslutningen fungerar
        await loadHighscoresFromDatabase();
        
    } catch (e) {
        console.error('Supabase connection failed:', e);
        console.warn('Switching to local storage fallback');
        setupLocalStorageFallback();
    }
});

// Fallback till localStorage om Supabase inte fungerar
function setupLocalStorageFallback() {
    window.saveScoreToDatabase = async function(scoreData) {
        const scores = JSON.parse(localStorage.getItem('simplineers_scores') || '[]');
        scores.push({...scoreData, id: Date.now()});
        localStorage.setItem('simplineers_scores', JSON.stringify(scores));
        return [scoreData];
    };
    
    window.loadHighscoresFromDatabase = async function() {
        const scores = JSON.parse(localStorage.getItem('simplineers_scores') || '[]');
        return scores.sort((a, b) => b.score - a.score).slice(0, 10);
    };
}

async function testHighscoreData() {
    console.log("Testing highscore data retrieval...");
    
    try {
        const data = await loadHighscoresFromDatabase();
        console.log("Raw highscore data:", data);
        
        // Kontrollera datastrukturen
        if (data && data.length > 0) {
            console.log("First highscore entry:", data[0]);
            console.log("Has name property:", 'name' in data[0]);
            console.log("Name value:", data[0].name);
        } else {
            console.log("No highscore data found");
        }
    } catch (error) {
        console.error("Error testing highscore data:", error);
    }
}

// Anropa testfunktionen när sidan laddas
document.addEventListener('DOMContentLoaded', function() {
    testHighscoreData();
});

// Lägg till en funktion för att återställa allt
window.resetEverything = async function() {
    // Rensa localStorage
    localStorage.clear();
    
    // Radera data från Supabase (om du har admin-rättigheter)
    if (window.supabaseClient && confirm('Är du säker på att du vill radera ALL highscore-data?')) {
        try {
            const { error } = await window.supabaseClient
                .from('highscores')
                .delete()
                .neq('id', 0); // Raderar alla rader
                
            if (error) throw error;
            console.log('All highscore data deleted from Supabase');
        } catch (e) {
            console.error('Failed to delete data:', e);
        }
    }
    
    // Ladda om sidan
    location.reload();
};

// Använd i konsolen: resetEverything() 