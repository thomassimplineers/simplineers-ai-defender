// Funktion för att initiera högscorelistan och hanterare
function initHighscoreHandlers() {
    // Hämta highscores från local storage om de finns
    const storedScores = localStorage.getItem('aiDefenderHighScores');
    if (storedScores) {
        window.gameState.highScores = JSON.parse(storedScores);
    } else {
        window.gameState.highScores = [];
    }
    
    // Visa topplistan
    updateHighscoreTable();
    
    // Sätt upp händelselyssnare för formuläret
    const form = document.getElementById('score-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            submitHighscore();
        });
    }
}

// Funktion för att uppdatera högscoretabellen
function updateHighscoreTable() {
    const tableBody = document.getElementById('highscore-table');
    if (!tableBody) return;
    
    // Rensa tabellen
    tableBody.innerHTML = '';
    
    // Sortera highscores efter poäng (högst först)
    const sortedScores = [...window.gameState.highScores].sort((a, b) => b.score - a.score);
    
    // Visa max 10 highscores
    const topScores = sortedScores.slice(0, 10);
    
    // Skapa rader för varje poäng
    topScores.forEach((score, index) => {
        const row = document.createElement('tr');
        
        const positionCell = document.createElement('td');
        positionCell.textContent = index + 1;
        
        const nameCell = document.createElement('td');
        nameCell.textContent = score.name;
        
        const scoreCell = document.createElement('td');
        scoreCell.textContent = score.score;
        
        row.appendChild(positionCell);
        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        
        tableBody.appendChild(row);
    });
}

// Funktion för att skicka in highscore
function submitHighscore() {
    const nameInput = document.getElementById('player-name');
    const emailInput = document.getElementById('player-email');
    const consentCheckbox = document.getElementById('consent');
    
    if (!nameInput || !emailInput || !consentCheckbox) return;
    
    // Kontrollera att alla fält är ifyllda
    if (!nameInput.value || !emailInput.value || !consentCheckbox.checked) {
        alert('Fyll i alla fält och godkänn villkoren för att skicka in poäng.');
        return;
    }
    
    // Skapa ett nytt highscore-objekt
    const newScore = {
        name: nameInput.value,
        email: emailInput.value,
        score: window.gameState.score,
        date: new Date().toISOString()
    };
    
    // Lägg till i listan av highscores
    window.gameState.highScores.push(newScore);
    
    // Sortera highscores efter poäng (högst först)
    window.gameState.highScores.sort((a, b) => b.score - a.score);
    
    // Spara till local storage
    localStorage.setItem('aiDefenderHighScores', JSON.stringify(window.gameState.highScores));
    
    // Dölj formuläret
    document.getElementById('highscore-form').classList.add('hidden');
    
    // Uppdatera tabellen
    updateHighscoreTable();
    
    // I en riktig implementation skulle du skicka data till en server här
    console.log('Skulle skicka data till server:', newScore);
}

// Funktion för att kontrollera om en poäng är tillräckligt hög för topplistan
function isHighscore(score) {
    // Om vi har färre än 10 highscores, är det automatiskt en highscore
    if (window.gameState.highScores.length < 10) return true;
    
    // Annars kontrollera om poängen är högre än den lägsta poängen i topplistan
    const sortedScores = [...window.gameState.highScores].sort((a, b) => b.score - a.score);
    const lowestTopScore = sortedScores[9].score;
    
    return score > lowestTopScore;
}