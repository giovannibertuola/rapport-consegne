-- Fix RLS per permettere inserimento automatico in stato_rapporti_giornalieri

-- Aggiungi politica per permettere INSERT dal trigger
CREATE POLICY "Allow insert from trigger" ON stato_rapporti_giornalieri
FOR INSERT
WITH CHECK (true);

-- Aggiungi politica per permettere UPDATE dal trigger  
CREATE POLICY "Allow update from trigger" ON stato_rapporti_giornalieri
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Assicurati che gli utenti possano inserire i propri rapporti
CREATE POLICY "Users can insert own stato_rapporti" ON stato_rapporti_giornalieri
FOR INSERT
WITH CHECK (
    user_id = (
        SELECT id FROM utenti 
        WHERE email = auth.jwt() ->> 'email'
    )
);

-- Permetti agli utenti di aggiornare i propri rapporti
CREATE POLICY "Users can update own stato_rapporti" ON stato_rapporti_giornalieri
FOR UPDATE
USING (
    user_id = (
        SELECT id FROM utenti 
        WHERE email = auth.jwt() ->> 'email'
    )
);

