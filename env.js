// Injicera miljövariabler från Vercel till frontend
window.ENV_SUPABASE_URL = "{{SUPABASE_URL}}";
window.ENV_SUPABASE_KEY = "{{SUPABASE_KEY}}";

// ENDAST FÖR LOKAL UTVECKLING
// Definiera Supabase-uppgifter för lokal miljö
window.ENV_SUPABASE_URL = 'https://wnfkoluezjprqphbirgo.supabase.co';
window.ENV_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZmtvbHVlempwcnFwaGJpcmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NTE3OTcsImV4cCI6MjA1NjMyNzc5N30.SjRb-sHqiSf_-ud5VSwXNqCZurqDrMwwq_S-aFVO9H0';

console.log("Lokala miljövariabler laddade ✅"); 