// TEMPLATE - Kopiera denna fil till supabase-config.js och fyll i uppgifterna
// Konfiguration för Supabase
const SUPABASE_CONFIG = {
    url: 'https://din-supabase-url.supabase.co',
    key: 'din-anon-key'
};

// ÄNDRA INTE KODEN NEDANFÖR DENNA LINJE
// ---------------------------------------------------

// Skapa Supabase-klienten
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

// Exportera som globalt objekt
window.supabaseClient = supabase;

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