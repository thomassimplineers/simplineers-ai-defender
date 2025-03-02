/**
 * Simplineers AI Defender - Main Controller
 * Ansvarar för integration mellan spel och marknadsföringssida
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialisera sidan
    initPage();
    
    // Ladda highscore
    loadHighscores();
});

// Huvudinitialisering
function initPage() {
    // Knapp-eventlisteners
    setupButtons();
    
    // Formulärhantering
    setupForms();
    
    // Kontrollera om spelet ska starta direkt (från URL-parameter)
    checkAutoStart();
}

// Konfigurera knappar
function setupButtons() {
    // Start Game-knapp
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            document.getElementById('intro-section').classList.add('hidden');
            document.getElementById('game-section').classList.remove('hidden');
            startGame();
        });
    }
    
    // Tillbaka till meny-knapp
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', function() {
            document.getElementById('game-section').classList.add('hidden');
            document.getElementById('intro-section').classList.remove('hidden');
            // Här kan du lägga till kod för att pausa eller stänga av spelet
        });
    }
    
    // Läs mer-knapp
    const learnMoreBtn = document.getElementById('learn-more-btn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            document.getElementById('courses-section').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    }
}

// Konfigurera formulär
function setupForms() {
    // Score form
    const scoreForm = document.getElementById('score-form');
    if (scoreForm) {
        scoreForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Samla in data
            const formData = {
                name: this.elements.name.value,
                score: parseInt(this.elements.score.value),
                email: this.elements.email ? this.elements.email.value : null,
                consent: this.elements.consent ? this.elements.consent.checked : false
            };
            
            // Validera
            if (!formData.name) {
                alert('Vänligen ange ditt namn');
                return;
            }
            
            if (formData.email && !formData.consent) {
                alert('Du måste godkänna villkoren om du anger e-post');
                return;
            }
            
            // Skicka till Supabase
            if (window.saveScoreToDatabase) {
                saveScoreToDatabase({
                    name: formData.name,
                    score: formData.score,
                    email: formData.email && formData.consent ? formData.email : null,
                    consent: formData.consent,
                    created_at: new Date().toISOString()
                }).then(() => {
                    // Uppdatera highscore-listan
                    loadHighscores();
                    
                    // Stäng formuläret
                    document.getElementById('highscore-form').classList.add('hidden');
                    
                    // Visa bekräftelse
                    alert('Tack! Din poäng har sparats.');
                    
                    // Återställ spelet om det behövs
                    if (typeof resetGame === 'function') {
                        resetGame();
                    }
                }).catch(error => {
                    console.error('Error saving score:', error);
                    alert('Det uppstod ett fel när poängen skulle sparas.');
                });
            }
        });
    }
    
    // Kontaktformulär
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Samla in data
            const formData = {
                name: this.elements['contact-name'].value,
                email: this.elements['contact-email'].value,
                company: this.elements['contact-company'].value,
                message: this.elements['contact-message'].value
            };
            
            // Validera
            if (!formData.name || !formData.email) {
                alert('Vänligen fyll i namn och e-post');
                return;
            }
            
            // Här kan du lägga till kod för att spara kontaktuppgifterna
            // Till exempel genom att skicka till en API-endpoint
            
            // För demo-syften:
            alert('Tack för ditt intresse! Vi kommer att kontakta dig inom kort.');
            this.reset();
        });
    }
}

// Automatisk start från URL
function checkAutoStart() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('play') === 'true') {
        document.getElementById('intro-section').classList.add('hidden');
        document.getElementById('game-section').classList.remove('hidden');
        startGame();
    }
}

// Starta spelet
function startGame() {
    console.log('Starting game...');
    
    // Här kan du lägga till kod för att initiera spelet
    // För enkel integration kan du inkludera hela index.html i en iframe
    // eller använda en anpassad inladdningsmetod
    
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        // Alternativ 1: Lägg till spelets script dynamiskt
        const gameScript = document.createElement('script');
        gameScript.src = 'index.html';
        document.body.appendChild(gameScript);
        
        // Alternativ 2: Om spelet redan är inläst, visa det
        // gameContainer.classList.remove('hidden');
    }
}

// Exponera globala funktioner för användning från spelet
window.showHighscoreForm = function(score) {
    const highscoreForm = document.getElementById('highscore-form');
    if (highscoreForm) {
        // Sätt aktuell poäng
        document.getElementById('score').value = score;
        
        // Visa formuläret
        highscoreForm.classList.remove('hidden');
    }
};

// Hantera "Game Over" från spelet
window.handleGameOver = function(finalScore) {
    console.log('Game over! Final score:', finalScore);
    
    // Kontrollera om poängen är tillräckligt hög för highscore
    if (isHighScore(finalScore)) {
        showHighscoreForm(finalScore);
    } else {
        // Visa enkelt meddelande
        alert(`Game Over! Din poäng: ${finalScore}`);
        
        // Återställ spelet
        if (typeof resetGame === 'function') {
            resetGame();
        }
    }
};

// Kontrollera om en poäng är bland de 10 bästa
function isHighScore(score) {
    // Hämta highscores från DOM
    const rows = document.querySelectorAll('#highscore-table tbody tr');
    
    // Om vi har mindre än 10 highscores, är det automatiskt ett highscore
    if (rows.length < 10) return true;
    
    // Kolla annars den lägsta poängen i listan
    const lowestScore = parseInt(rows[rows.length - 1].querySelector('td:last-child').textContent);
    return score > lowestScore;
} 