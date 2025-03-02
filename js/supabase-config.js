/**
 * Supabase konfiguration - hämtar värden från miljövariabler
 */
(function() {
    // Försök hämta värden från flera möjliga källor
    const supabaseUrl = 
        // Vercel miljövariabler som har exponerats till frontend
        window.SUPABASE_URL || 
        // Försök hitta miljövariabel som kan ha kommit från env.js lokalt
        window.ENV_SUPABASE_URL || 
        // Fallback (tom sträng för att undvika fel, men kommer inte fungera)
        "";
    
    const supabaseKey = 
        window.SUPABASE_KEY || 
        window.ENV_SUPABASE_KEY || 
        "";
    
    // Kontrollera om vi har nödvändiga värden innan vi fortsätter
    if (!supabaseUrl || !supabaseKey) {
        console.error("VARNING: Supabase URL eller KEY saknas!");
        console.log("Tillgängliga globala variabler:", 
                    "SUPABASE_URL:", !!window.SUPABASE_URL, 
                    "ENV_SUPABASE_URL:", !!window.ENV_SUPABASE_URL);
    } else {
        console.log("Supabase-konfiguration laddad. URL börjar med:", 
                    supabaseUrl.substring(0, 15) + "...");
        
        // Initialisera Supabase-klienten
        if (typeof supabaseJs !== 'undefined') {
            window.supabase = supabaseJs.createClient(supabaseUrl, supabaseKey);
        } else {
            console.error("Supabase JS-biblioteket (supabaseJs) är inte laddat!");
        }
    }
})();

// Funktionen för att spara poäng till Supabase
async function saveScoreToDatabase(scoreData) {
    try {
        console.log('Trying to save score:', scoreData);
        
        const { data, error } = await supabase
            .from('highscores')
            .insert([scoreData])
            .select();
            
        if (error) {
            console.error('Supabase error details:', error);
            throw error;
        }
        
        console.log('Score saved successfully:', data);
        return data;
    } catch (error) {
        console.error('Error saving score:', error);
        throw error;
    }
}

// Funktionen för att hämta highscores från Supabase
async function loadHighscoresFromDatabase() {
    try {
        const { data, error } = await supabase
            .from('highscores')
            .select('name, score, created_at')
            .order('score', { ascending: false })
            .limit(10);
            
        if (error) throw error;
        console.log('Highscores loaded:', data);
        return data;
    } catch (error) {
        console.error('Error loading highscores:', error);
        return [];
    }
}

// Exportera funktionerna globalt
window.saveScoreToDatabase = saveScoreToDatabase;
window.loadHighscoresFromDatabase = loadHighscoresFromDatabase;

// Lägg till funktion för att testa koppling till Supabase
async function testSupabaseConnection() {
    try {
        // Testa genom att hämta några poster (om tabellen finns)
        const { data, error } = await supabase
            .from('highscores')
            .select('*')
            .limit(1);
            
        if (error) throw error;
        console.log("Supabase koppling fungerar! Hittade data:", data);
        return true;
    } catch (err) {
        console.error("Fel vid test av Supabase-koppling:", err);
        return false;
    }
}

// Kör testet vid sidladdning
document.addEventListener('DOMContentLoaded', function() {
    testSupabaseConnection();
}); 