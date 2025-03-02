/**
 * Robust Supabase-konfiguration som fungerar i både produktion och utveckling
 */
(function() {
    console.log("SUPABASE-CONFIG: Initiering påbörjas");
    
    // STEG 1: Hitta Supabase-biblioteket oavsett hur CDN exponerar det
    const supabaseLib = findSupabaseLibrary();
    
    function findSupabaseLibrary() {
        // Kontrollera alla möjliga exponeringar av biblioteket
        if (window.supabaseJs && typeof window.supabaseJs.createClient === 'function') {
            console.log("Hittade Supabase via window.supabaseJs");
            return window.supabaseJs;
        }
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            console.log("Hittade Supabase via window.supabase");
            return window.supabase;
        }
        if (typeof createClient === 'function') {
            console.log("Hittade createClient direkt i global scope");
            return { createClient: createClient };
        }
        
        console.error("KRITISKT FEL: Kunde inte hitta Supabase-biblioteket!");
        console.log("Tillgängliga globala variabler:", 
            Object.keys(window).filter(k => k.toLowerCase().includes('supa')));
        return null;
    }
    
    // Avbryt om vi inte hittade biblioteket
    if (!supabaseLib) {
        console.error("Kan inte fortsätta utan Supabase-biblioteket");
        return;
    }
    
    // STEG 2: Hämta miljövariabler från alla möjliga källor
    const supabaseUrl = window.ENV_SUPABASE_URL || 
                       window.SUPABASE_URL || 
                       "";
    const supabaseKey = window.ENV_SUPABASE_KEY || 
                        window.SUPABASE_KEY || 
                        "";
    
    // Logg miljövariabler (censurerade)
    console.log("Miljövariabler:", {
        url_exists: !!supabaseUrl,
        key_exists: !!supabaseKey,
        url_preview: supabaseUrl ? supabaseUrl.substring(0, 10) + "..." : "saknas",
    });
    
    // Validera att vi har nödvändiga värden
    if (!supabaseUrl || !supabaseKey) {
        console.error("KRITISKT: Supabase URL eller KEY saknas!");
        return;
    }
    
    // STEG 3: Initiera Supabase-klienten
    try {
        // Skapa klienten med det identifierade biblioteket
        window.supabase = supabaseLib.createClient(supabaseUrl, supabaseKey);
        console.log("Supabase initialiserat framgångsrikt ✅");
        
        // Test-anrop för att verifiera anslutningen
        window.supabase.from('highscores').select('count').then(result => {
            console.log("Supabase anslutningstest: OK", result);
        }).catch(err => {
            console.error("Supabase anslutningstest: MISSLYCKADES", err);
        });
    } catch (error) {
        console.error("Fel vid initiering av Supabase:", error);
    }
    
    // STEG 4: Exportera hjälpfunktioner
    window.saveScoreToDatabase = async function(scoreData) {
        try {
            console.log('Sparar poäng:', scoreData);
            
            if (!window.supabase || typeof window.supabase.from !== 'function') {
                console.error('Supabase-klienten är inte korrekt initialiserad!');
                return null;
            }
            
            const { data, error } = await window.supabase
                .from('highscores')
                .insert([scoreData])
                .select();
                
            if (error) throw error;
            console.log('Poäng sparad:', data);
            return data;
        } catch (error) {
            console.error('Fel vid sparande av poäng:', error);
            throw error;
        }
    };
    
    window.loadHighscoresFromDatabase = async function() {
        try {
            console.log('Hämtar highscores...');
            
            if (!window.supabase || typeof window.supabase.from !== 'function') {
                console.error('Supabase-klienten är inte korrekt initialiserad!');
                return [];
            }
            
            const { data, error } = await window.supabase
                .from('highscores')
                .select('name, score, created_at')
                .order('score', { ascending: false })
                .limit(10);
                
            if (error) throw error;
            console.log('Highscores hämtade:', data);
            return data;
        } catch (error) {
            console.error('Fel vid hämtning av highscores:', error);
            return [];
        }
    };
})();

// Exportera hjälpfunktioner
async function saveScoreToDatabase(scoreData) {
    try {
        console.log('Sparar poäng:', scoreData);
        
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            console.error('Supabase-klienten är inte korrekt initialiserad!');
            return null;
        }
        
        const { data, error } = await window.supabase
            .from('highscores')
            .insert([scoreData])
            .select();
            
        if (error) throw error;
        console.log('Poäng sparad:', data);
        return data;
    } catch (error) {
        console.error('Fel vid sparande av poäng:', error);
        throw error;
    }
}

async function loadHighscoresFromDatabase() {
    try {
        console.log('Hämtar highscores...');
        
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            console.error('Supabase-klienten är inte korrekt initialiserad!');
            return [];
        }
        
        const { data, error } = await window.supabase
            .from('highscores')
            .select('name, score, created_at')
            .order('score', { ascending: false })
            .limit(10);
            
        if (error) throw error;
        console.log('Highscores hämtade:', data);
        return data;
    } catch (error) {
        console.error('Fel vid hämtning av highscores:', error);
        return [];
    }
}

// Exportera funktionerna globalt med felhantering
window.saveScoreToDatabase = saveScoreToDatabase;
window.loadHighscoresFromDatabase = loadHighscoresFromDatabase;

// Förbättrad testfunktion med detaljerad felhantering
async function testSupabaseConnection() {
    try {
        if (!window.supabase) {
            console.error("Supabase-klienten är inte initialiserad vid test");
            return false;
        }
        
        // Logga URL för felsökning (censurerad för säkerhet)
        const url = window.ENV_SUPABASE_URL || window.SUPABASE_URL || "";
        console.log("Ansluter till Supabase:", 
            url ? (url.substring(0, 15) + "...") : "URL SAKNAS!");
        
        // Testa med en enkel anslutning först
        const { data, error } = await window.supabase
            .from('highscores')
            .select('count');
            
        if (error) throw error;
        console.log("Supabase-anslutning fungerar! Result:", data);
        return true;
    } catch (err) {
        console.error("Fel vid test av Supabase-koppling:", err);
        
        // Mer specifik feldiagnostik
        if (err.message && err.message.includes('Failed to fetch')) {
            console.error("NÄTVERKSFEL: Kan inte nå Supabase-servern. Möjliga orsaker:");
            console.error("1. Fel URL/nyckel");
            console.error("2. CORS-problem");
            console.error("3. Nätverksproblem");
            console.error("Aktuell URL:", window.ENV_SUPABASE_URL || window.SUPABASE_URL || "SAKNAS");
        }
        
        return false;
    }
}

// Kör testet vid sidladdning
document.addEventListener('DOMContentLoaded', function() {
    testSupabaseConnection();
}); 