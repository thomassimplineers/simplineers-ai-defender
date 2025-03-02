/**
 * Simplineers AI Defender - Highscore
 * Hanterar lagring och visning av highscore samt insamling av spelardata
 */

// ===== SUPABASE HIGHSCORE SYSTEM =====

// Ladda highscores när DOM är redo
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, setting up highscore system");
    
    // Ladda highscores direkt
    loadHighscores();
    
    // Blockera alla formulär från att orsaka sidnavigering
    document.querySelectorAll('form').forEach(form => {
        form.setAttribute('method', 'POST');
        form.onsubmit = function(e) {
            e.preventDefault();
            console.log("Form submission intercepted");
            
            // För score-form, anropa vår specifika hanterare
            if (this.id === 'score-form') {
                handleScoreSubmission(this);
            }
            
            return false;
        };
    });
});

// Hämta och visa highscores
async function loadHighscores() {
    try {
        const { data, error } = await supabase
            .from('highscores')
            .select('*')
            .gte('score', 0)  // Hämta bara riktiga highscores (inte leads med negativ poäng)
            .order('score', { ascending: false })
            .limit(10);
            
        if (error) {
            console.error('Error loading highscores:', error);
            return;
        }
        
        displayHighscores(data || []);
    } catch (e) {
        console.error('Unexpected error loading highscores:', e);
    }
}

// Funktion för att visa highscores
function displayHighscores(highscores) {
    const highscoreList = document.getElementById('highscore-list');
    highscoreList.innerHTML = '';
    
    if (highscores.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="3">Inga highscores än. Bli först!</td>`;
        highscoreList.appendChild(emptyRow);
        return;
    }
    
    highscores.forEach((score, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.name}</td>
            <td>${score.score}</td>
        `;
        highscoreList.appendChild(row);
    });
}

// Funktion för att spara highscore
async function saveHighscore(name, email, score) {
    try {
        console.log('Sparar highscore:', { name, email, score });
        
        // Kontrollera vilka kolumner som finns i highscores-tabellen
        const { data: existingData, error: fetchError } = await supabase
            .from('highscores')
            .select('*')
            .limit(1);
            
        if (fetchError) {
            console.error('Kunde inte hämta highscores-struktur:', fetchError);
            throw fetchError;
        }
        
        // Skapa ett objekt med endast de kolumner vi vet finns
        const scoreData = { 
            name: name, 
            email: email, 
            score: score  // Detta är en score, inte en lead
        };
        
        // Lägg till campaign_ref om det finns
        if (existingData && existingData.length > 0) {
            // Snake_case-variant
            if ('campaign_ref' in existingData[0]) {
                scoreData.campaign_ref = 'GAME_SCORE';
            } 
            // CamelCase-variant
            else if ('campaignRef' in existingData[0]) {
                scoreData.campaignRef = 'GAME_SCORE';
            }
        }
        
        // Spara highscore till Supabase
        const { data, error } = await supabase
            .from('highscores')
            .insert([scoreData]);
            
        if (error) {
            console.error('Error saving highscore:', error);
            throw error;
        }
        
        console.log('Highscore sparad:', data);
        return { success: true };
    } catch (e) {
        console.error('Unexpected error saving highscore:', e);
        return { success: false, error: e };
    }
}

// Funktion för att hantera highscore-formulär
function setupHighscoreForm() {
    const scoreForm = document.getElementById('score-form');
    if (!scoreForm) return;
    
    scoreForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('player-name');
        const emailInput = document.getElementById('player-email');
        const scoreInput = document.getElementById('player-score');
        
        if (!nameInput || !emailInput || !scoreInput) {
            console.error('Missing form inputs');
            return;
        }
        
        const name = nameInput.value;
        const email = emailInput.value;
        const score = parseInt(scoreInput.value);
        
        if (!name || !email || isNaN(score)) {
            alert('Vänligen fyll i alla fält korrekt');
            return;
        }
        
        const submitButton = scoreForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Sparar...';
        
        try {
            const result = await saveHighscore(name, email, score);
            
            if (result.success) {
                // Visa bekräftelse
                alert('Din poäng har sparats!');
                
                // Återställ formuläret
                scoreForm.reset();
                
                // Uppdatera highscorelistan
                loadHighscores();
                
                // Stäng modalen om den finns
                const modal = document.getElementById('highscore-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            } else {
                alert('Ett fel uppstod. Försök igen senare.');
            }
        } catch (e) {
            console.error('Error in highscore submission:', e);
            alert('Ett tekniskt fel uppstod. Försök igen senare.');
        } finally {
            // Återställ knappen
            submitButton.disabled = false;
            submitButton.textContent = 'Spara poäng';
        }
    });
}

// Initiera highscore-funktioner när sidan laddas
document.addEventListener('DOMContentLoaded', function() {
    loadHighscores();
    setupHighscoreForm();
    
    // Återuppladdning av highscores varje minut
    setInterval(loadHighscores, 60000);
});

// Skicka poäng till databasen
async function submitScore(event) {
    event.preventDefault();
    console.log("Score form submitted");
    
    const form = event.target;
    const name = form.elements.name.value;
    const email = form.elements.email ? form.elements.email.value : null;
    const score = parseInt(form.elements.score.value);
    const consent = form.elements.consent ? form.elements.consent.checked : false;
    
    if (!name || !score) {
        alert('Vänligen fyll i ditt namn.');
        return;
    }
    
    if (email && !consent) {
        alert('Du måste godkänna villkoren om du anger en e-postadress.');
        return;
    }
    
    try {
        console.log(`Saving score for ${name}: ${score} points`);
        
        // Skapa data-objekt
        const scoreData = {
            name: name,
            score: score,
            created_at: new Date().toISOString()
        };
        
        // Lägg bara till e-post om den anges och samtycke ges
        if (email && consent) {
            scoreData.email = email;
            scoreData.consent = true;
        }
        
        // Spara till Supabase
        if (window.saveScoreToDatabase) {
            await saveScoreToDatabase(scoreData);
            console.log("Score saved to database");
        } else {
            console.warn("Database save function not available");
        }
        
        // Uppdatera highscore-listan
        await loadHighscores();
        
        // Återställ formuläret och dölj det
        form.reset();
        const highscoreForm = document.getElementById('highscore-form');
        if (highscoreForm) {
            highscoreForm.classList.add('hidden');
        }
        
        // Återställ spelet om funktionen finns
        if (typeof resetGame === 'function') {
            resetGame();
        }
        
        alert('Din poäng har sparats!');
        
    } catch (error) {
        console.error('Error submitting score:', error);
        alert('Det uppstod ett fel när poängen skulle sparas. Försök igen.');
    }
}

// Rendera highscores i tabellen
function renderHighscores(scores) {
    console.log("Rendering highscores:", scores);
    
    // Hitta tabellen
    const highscoreTable = document.getElementById('highscore-table');
    if (!highscoreTable) {
        console.error("Highscore table element not found in DOM!");
        
        // Lista alla tabeller i DOM för debugging
        const tables = document.querySelectorAll('table, tbody');
        console.log("Available tables/tbody elements:", tables);
        return;
    }
    
    // Rensa tidigare innehåll
    highscoreTable.innerHTML = '';
    
    // Visa meddelande om inga poäng finns
    if (!scores || scores.length === 0) {
        console.log("No scores to display");
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="3">Inga highscores ännu</td>';
        highscoreTable.appendChild(row);
        return;
    }
    
    // Skapa rader för varje poäng
    scores.forEach((score, index) => {
        console.log(`Rendering score ${index}:`, score);
        
        const row = document.createElement('tr');
        
        // Rank
        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;
        
        // Namn
        const nameCell = document.createElement('td');
        nameCell.textContent = score.name || 'Anonym';
        console.log(`Name for row ${index}:`, nameCell.textContent);
        
        // Poäng
        const scoreCell = document.createElement('td');
        scoreCell.textContent = score.score;
        
        // Lägg till celler i raden
        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        
        // Lägg till raden i tabellen
        highscoreTable.appendChild(row);
    });
    
    console.log("Finished rendering highscores");
}

// Ta bort all tidigare HighscoreManager-kod och exportering
// window.highscoreManager = null; // Ta bort den gamla instansen

// Lägg till i början av submitScore-funktionen eller liknande
document.getElementById('score-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Förhindra omladdning
    // Hämta data och skicka via AJAX istället
    const formData = new FormData(this);
    // Hantera formuläret här...
});

// Helt ny funktion för score-hantering
function handleScoreSubmission(form) {
    console.log("Processing score submission");
    
    // Samla formulärdata
    const formData = {
        name: form.elements.name ? form.elements.name.value : 'Anonym',
        email: form.elements.email ? form.elements.email.value : '',
        score: form.elements.score ? form.elements.score.value : gameState.score,
        consent: form.elements.consent ? form.elements.consent.checked : false
    };
    
    console.log("Score data:", formData);
    
    // Använd async/await för att undvika att blockera UI
    (async function() {
        try {
            // Spara poäng i databasen om Supabase är tillgängligt
            if (window.saveScoreToDatabase) {
                await saveScoreToDatabase({
                    name: formData.name,
                    score: parseInt(formData.score),
                    email: formData.email && formData.consent ? formData.email : null,
                    consent: formData.consent,
                    created_at: new Date().toISOString()
                });
                
                console.log("Score saved successfully");
                
                // Ladda om highscores utan att ladda om sidan
                if (window.loadHighscores) {
                    await loadHighscores();
                }
                
                // Återställ spelet och dölj formuläret
                if (typeof resetGame === 'function') {
                    resetGame();
                }
                
                // Dölj highscore-formuläret
                document.getElementById('highscore-form').classList.add('hidden');
                
                alert("Din poäng har sparats!");
            }
        } catch (error) {
            console.error("Failed to save score:", error);
            alert("Ett fel uppstod när poängen skulle sparas.");
        }
    })();
}