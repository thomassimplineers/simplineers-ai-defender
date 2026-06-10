/**
 * Simplineers AI Defender 2026 - Leads
 * Hanterar intresseanmälningar med lokal fallback och valfri Supabase-integration.
 */

document.addEventListener('DOMContentLoaded', function() {
    setupLeadForm();
});

function setupLeadForm() {
    const leadForm = document.getElementById('lead-form');
    if (!leadForm) return;

    leadForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const lead = {
            name: document.getElementById('lead-name').value.trim(),
            email: document.getElementById('lead-email').value.trim(),
            phone: document.getElementById('lead-phone')?.value.trim() || '',
            company: document.getElementById('lead-company')?.value.trim() || '',
            interest: document.getElementById('lead-interest').value || 'not-specified',
            campaign_ref: document.getElementById('campaign-ref')?.value || 'AI-DEFENDER-2026',
            source: 'AI-Defender-2026',
            created_at: new Date().toISOString()
        };

        if (!lead.name || !lead.email) {
            showLeadMessage(leadForm, 'Fyll i namn och e-post så kontaktar vi dig.', false);
            return;
        }

        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Skickar...';

        try {
            const result = await saveLead(lead);
            showLeadMessage(
                leadForm,
                result.remote
                    ? 'Tack! Din intresseanmälan är skickad.'
                    : 'Tack! Din intresseanmälan sparades lokalt i denna webbläsare.',
                true
            );
            leadForm.reset();
        } catch (error) {
            console.error('Lead kunde inte sparas:', error);
            showLeadMessage(leadForm, 'Ett tekniskt fel uppstod. Försök igen senare.', false);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'ANMÄL INTRESSE';
        }
    });
}

async function saveLead(lead) {
    if (window.supabase && typeof window.supabase.from === 'function') {
        try {
            const { data, error } = await window.supabase.from('leads').insert([lead]);
            if (!error) return { success: true, remote: true, data };
        } catch (error) {
            console.warn('Extern lead-lagring är inte tillgänglig, använder lokal fallback.', error);
        }
    }

    const existing = JSON.parse(localStorage.getItem('ai-defender-2026-leads') || '[]');
    existing.unshift(lead);
    localStorage.setItem('ai-defender-2026-leads', JSON.stringify(existing.slice(0, 50)));
    return { success: true, remote: false, data: lead };
}

function showLeadMessage(formElement, message, success) {
    const formContainer = formElement.closest('.cta-form-container') || formElement.parentNode;
    const existing = formContainer.querySelector('.success-message, .error-message');
    if (existing) existing.remove();

    const status = document.createElement('div');
    status.className = success ? 'success-message' : 'error-message';
    status.innerHTML = `
        <h4>${success ? 'TACK FÖR DITT INTRESSE!' : 'NÅGOT GICK FEL'}</h4>
        <p>${message}</p>
    `;
    formContainer.appendChild(status);
    status.style.display = 'block';

    setTimeout(() => {
        if (formContainer.contains(status)) status.remove();
    }, 8000);
}
