/**
 * Simplineers AI Defender - Leads
 * Hanterar insamling och lagring av leads från intresseformulär
 */

// Initialisera leads-system när DOM är klar
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, setting up leads system");
    setupLeadForm();
});

// Funktion för att konfigurera lead-formuläret
function setupLeadForm() {
    const leadForm = document.getElementById('lead-form');
    if (!leadForm) {
        console.warn('Lead-formulär hittades inte på sidan');
        return;
    }
    
    leadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('lead-name').value;
        const email = document.getElementById('lead-email').value;
        const phone = document.getElementById('lead-phone')?.value || null; // Frivilligt fält
        const interest = document.getElementById('lead-interest').value;
        const campaignRef = document.getElementById('campaign-ref').value || 'AI-DEFENDER-2024';
        
        // Visa laddningsindikator
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Skickar...';
        
        try {
            const result = await saveLead(name, email, phone, interest, campaignRef);
            
            if (result.success) {
                // Visa framgångsmeddelande
                showLeadSuccess(leadForm);
                
                // Rensa formuläret
                leadForm.reset();
            } else {
                if (window.showRetroError) {
                    showRetroError('Ett fel uppstod när din intresseanmälan skulle sparas. Försök igen senare.');
                } else {
                    alert('Ett fel uppstod. Försök igen senare.');
                }
            }
        } catch (error) {
            console.error('Oväntat fel vid sparande av lead:', error);
            if (window.showRetroError) {
                showRetroError('Ett tekniskt fel uppstod. Vänligen försök igen senare.');
            } else {
                alert('Ett tekniskt fel uppstod. Försök igen senare.');
            }
        } finally {
            // Återställ knappen
            submitButton.disabled = false;
            submitButton.textContent = 'ANMÄL INTRESSE';
        }
    });
}

// Funktion för att spara lead till Supabase
async function saveLead(name, email, phone, interest, campaignRef) {
    console.log('Sparar lead:', { name, email, phone, interest, campaignRef });
    
    try {
        // Skapa data-objektet med baskonfiguration
        const leadData = { 
            name, 
            email, 
            interest,
            source: 'AI-Defender-Game',
            campaign_ref: campaignRef // Använd snake_case för PostgreSQL
        };
        
        // Lägg till telefonnummer om det finns
        if (phone) {
            leadData.phone = phone;
        }
        
        // Försök spara direkt till leads-tabellen
        const { data, error } = await supabase
            .from('leads')
            .insert([leadData]);
            
        if (error) {
            console.error('Fel vid sparande av lead:', error);
            const fallbackResult = await saveLeadFallback(name, email, phone, interest, campaignRef);
            return fallbackResult;
        }
        
        console.log('Lead sparad:', data);
        return { success: true, data };
    } catch (e) {
        console.error('Oväntat fel vid sparande av lead:', e);
        return await saveLeadFallback(name, email, phone, interest, campaignRef);
    }
}

// Fallback-funktion för att spara lead via highscores-tabellen
async function saveLeadFallback(name, email, phone, interest, campaignRef) {
    console.log('Använder fallback för att spara lead');
    
    try {
        // Hämta struktur genom att först titta på ett befintligt resultat
        const { data: existingData, error: fetchError } = await supabase
            .from('highscores')
            .select('*')
            .limit(1);
            
        if (fetchError) {
            console.error("Kunde inte läsa highscores-struktur:", fetchError);
            return { success: false, error: fetchError };
        }
        
        // Skapa ett objekt med endast de kolumner som faktiskt finns
        const insertData = { 
            name: name, 
            email: email, 
            score: -1  // Använd negativ poäng för att markera det som en lead
        };
        
        // Lägg till extra kolumner om de finns
        if (existingData && existingData.length > 0) {
            if ('notes' in existingData[0]) {
                let notesContent = `LEAD-INTRESSE: ${interest || 'Ingen kurs vald'} | Källa: AI-Defender`;
                if (phone) {
                    notesContent += ` | Tel: ${phone}`;
                }
                insertData.notes = notesContent;
            }
            
            if ('campaign_ref' in existingData[0]) {
                insertData.campaign_ref = 'LEAD_' + campaignRef;
            } else if ('campaignRef' in existingData[0]) {
                insertData.campaignRef = 'LEAD_' + campaignRef;
            }
        }
        
        const { data, error } = await supabase
            .from('highscores')
            .insert([insertData]);
            
        if (error) {
            console.error('Fel vid fallback-sparande:', error);
            return { success: false, error };
        }
        
        console.log('Lead sparad via fallback:', data);
        return { success: true, data, fallback: true };
    } catch (e) {
        console.error('Oväntat fel vid fallback-sparande:', e);
        return { success: false, error: e };
    }
}

// Funktion för att visa framgångsmeddelande
function showLeadSuccess(formElement) {
    const formContainer = formElement.closest('.cta-form-container') || formElement.parentNode;
    
    // Skapa framgångsmeddelande
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <h4>TACK FÖR DITT INTRESSE!</h4>
        <p>Vi kontaktar dig snart med mer information om våra AI-utbildningar.</p>
    `;
    
    formContainer.appendChild(successMessage);
    successMessage.style.display = 'block';
    
    // Dölj meddelandet efter 8 sekunder
    setTimeout(() => {
        if (formContainer.contains(successMessage)) {
            successMessage.style.display = 'none';
            formContainer.removeChild(successMessage);
        }
    }, 8000);
} 