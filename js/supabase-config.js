// Konfiguration för Supabase
// Hämta nycklar från miljövariabler när tillgängliga, annars använd fallback-värden
const supabaseUrl = typeof window !== 'undefined' && window.ENV_SUPABASE_URL 
  ? window.ENV_SUPABASE_URL 
  : 'https://wnfkoluezjprqphbirgo.supabase.co';
  
const supabaseKey = typeof window !== 'undefined' && window.ENV_SUPABASE_KEY 
  ? window.ENV_SUPABASE_KEY 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZmtvbHVlempwcnFwaGJpcmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NTE3OTcsImV4cCI6MjA1NjMyNzc5N30.SjRb-sHqiSf_-ud5VSwXNqCZurqDrMwwq_S-aFVO9H0';

// Logga information (ta bort i produktion)
console.log('Använder Supabase URL:', supabaseUrl.substring(0, 30) + '...');
console.log('Miljövariabler tillgängliga:', !!window.ENV_SUPABASE_URL);

// Initiera Supabase-klienten
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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