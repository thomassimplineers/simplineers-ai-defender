# Testobservationer AI Defender 2026

Lokal testserver kördes på `http://127.0.0.1:8081/main.html`. Wrapper-sidan laddar med ny titel, ny AI Defender 2026-copy, topplista och CTA-formulär. Efter att externa Supabase-beroenden togs bort från wrappern är konsolen fri från blockerande fel vid sidladdning.

Vid klick på **SPELA NU** visas canvasbaserat spel i iframe, med HUD för safety, autonomy, compute och evals, samt kontroller i sidflödet. Tangentbordstest med mellanslag skapade verifieringspuls och fiender/tokenobjekt syntes i spelområdet. Den lokala topplistan visar fallbackmeddelande innan första poäng sparas.

Kontrollerat DOM-test efter start visade att iframe laddas, att `game-canvas` finns i iframe, och att canvasen har dimensionerna 800 × 600. Lokala lagringsnycklar för score och leads skapas först när användaren sparar poäng eller skickar intresseformulär, vilket är förväntat.
