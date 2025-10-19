-- Fix completo di tutte le politiche RLS

-- ====================
-- UTENTI - Politiche
-- ====================

-- Rimuovi tutte le vecchie politiche
DROP POLICY IF EXISTS "Admin can manage all users" ON utenti;
DROP POLICY IF EXISTS "Admin can create users" ON utenti;
DROP POLICY IF EXISTS "Users can view their own data" ON utenti;

-- Permetti a tutti di leggere (necessario per il login)
CREATE POLICY "Allow read utenti" ON utenti
FOR SELECT
USING (true);

-- Solo admin può inserire
CREATE POLICY "Admin can insert users" ON utenti
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM utenti u
        WHERE u.email = auth.jwt() ->> 'email' 
        AND u.privilegi = 'admin'
    )
);

-- Solo admin può aggiornare
CREATE POLICY "Admin can update users" ON utenti
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM utenti u
        WHERE u.email = auth.jwt() ->> 'email' 
        AND u.privilegi = 'admin'
    )
);

-- Solo admin può cancellare
CREATE POLICY "Admin can delete users" ON utenti
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM utenti u
        WHERE u.email = auth.jwt() ->> 'email' 
        AND u.privilegi = 'admin'
    )
);

-- ====================
-- RAPPORTI - Politiche  
-- ====================

DROP POLICY IF EXISTS "Admin can manage all reports" ON rapporti;
DROP POLICY IF EXISTS "Users can manage their own reports" ON rapporti;

-- Admin può fare tutto
CREATE POLICY "Admin full access rapporti" ON rapporti
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM utenti
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

-- Utenti possono vedere e inserire i propri
CREATE POLICY "Users can insert own rapporti" ON rapporti
FOR INSERT
WITH CHECK (
    operatore = (
        SELECT CONCAT(nome, ' ', cognome) 
        FROM utenti 
        WHERE email = auth.jwt() ->> 'email'
    )
);

CREATE POLICY "Users can read own rapporti" ON rapporti
FOR SELECT
USING (
    operatore = (
        SELECT CONCAT(nome, ' ', cognome) 
        FROM utenti 
        WHERE email = auth.jwt() ->> 'email'
    )
    OR
    EXISTS (
        SELECT 1 FROM utenti
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

-- ====================
-- STATO RAPPORTI - Politiche
-- ====================

DROP POLICY IF EXISTS "Admin can view stato_rapporti" ON stato_rapporti_giornalieri;
DROP POLICY IF EXISTS "Users can view own stato_rapporti" ON stato_rapporti_giornalieri;
DROP POLICY IF EXISTS "Users can insert own stato_rapporti" ON stato_rapporti_giornalieri;
DROP POLICY IF EXISTS "Users can update own stato_rapporti" ON stato_rapporti_giornalieri;
DROP POLICY IF EXISTS "Allow insert from trigger" ON stato_rapporti_giornalieri;
DROP POLICY IF EXISTS "Allow update from trigger" ON stato_rapporti_giornalieri;

-- Permetti inserimento da trigger (senza auth check)
CREATE POLICY "Allow all insert stato_rapporti" ON stato_rapporti_giornalieri
FOR INSERT
WITH CHECK (true);

-- Permetti update da trigger (senza auth check)
CREATE POLICY "Allow all update stato_rapporti" ON stato_rapporti_giornalieri
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Lettura per admin e utenti
CREATE POLICY "Allow read stato_rapporti" ON stato_rapporti_giornalieri
FOR SELECT
USING (
    user_id = (
        SELECT id FROM utenti 
        WHERE email = auth.jwt() ->> 'email'
    )
    OR
    EXISTS (
        SELECT 1 FROM utenti
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

-- ====================
-- ALLARMI - Politiche
-- ====================

DROP POLICY IF EXISTS "Admin can manage alarms" ON allarmi;

CREATE POLICY "Allow read allarmi" ON allarmi
FOR SELECT
USING (true);

CREATE POLICY "Admin can manage allarmi" ON allarmi
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM utenti
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

-- ====================
-- TARGHE - Politiche
-- ====================

DROP POLICY IF EXISTS "Admin can manage targhe" ON targhe;
DROP POLICY IF EXISTS "Users can view active targhe" ON targhe;

CREATE POLICY "Everyone can read targhe" ON targhe
FOR SELECT
USING (attiva = true);

CREATE POLICY "Admin can manage targhe" ON targhe
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM utenti
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

-- ====================
-- ALLARMI OPERATORI - Politiche
-- ====================

DROP POLICY IF EXISTS "Admin can manage allarmi_operatori" ON allarmi_operatori;
DROP POLICY IF EXISTS "Users can view own allarmi_operatori" ON allarmi_operatori;

CREATE POLICY "Allow read allarmi_operatori" ON allarmi_operatori
FOR SELECT
USING (
    user_id = (
        SELECT id FROM utenti 
        WHERE email = auth.jwt() ->> 'email'
    )
    OR
    EXISTS (
        SELECT 1 FROM utenti
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

CREATE POLICY "Admin can modify allarmi_operatori" ON allarmi_operatori
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM utenti
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

-- ====================
-- LOG ALLARMI - Politiche
-- ====================

DROP POLICY IF EXISTS "Admin can view log_allarmi" ON log_allarmi;
DROP POLICY IF EXISTS "Users can view own log_allarmi" ON log_allarmi;

-- Permetti inserimento senza auth (per il sistema automatico)
CREATE POLICY "Allow insert log_allarmi" ON log_allarmi
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow read log_allarmi" ON log_allarmi
FOR SELECT
USING (
    user_id = (
        SELECT id FROM utenti 
        WHERE email = auth.jwt() ->> 'email'
    )
    OR
    EXISTS (
        SELECT 1 FROM utenti
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

-- ====================
-- NOTIFICATIONS - Politiche
-- ====================

DROP POLICY IF EXISTS "Admin can manage all notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can read own notifications" ON notifications
FOR SELECT
USING (
    user_id = (
        SELECT id FROM utenti 
        WHERE email = auth.jwt() ->> 'email'
    )
    OR
    EXISTS (
        SELECT 1 FROM utenti
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

CREATE POLICY "Admin can insert notifications" ON notifications
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM utenti
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

CREATE POLICY "Users can update own notifications" ON notifications
FOR UPDATE
USING (
    user_id = (
        SELECT id FROM utenti 
        WHERE email = auth.jwt() ->> 'email'
    )
);

-- Rimuovi constraint password_hash NOT NULL se presente
ALTER TABLE utenti ALTER COLUMN password_hash DROP NOT NULL;

