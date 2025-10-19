-- Fix per la creazione utenti - allinea con Supabase Auth

-- 1. Aggiungi colonna auth_id per collegare con auth.users
ALTER TABLE utenti ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Crea indice per performance
CREATE INDEX IF NOT EXISTS idx_utenti_auth_id ON utenti(auth_id);

-- 3. Rimuovi il constraint sulla password_hash (non serve più per la registrazione)
ALTER TABLE utenti ALTER COLUMN password_hash DROP NOT NULL;

-- 4. Aggiungi politiche RLS per permettere la creazione utenti
DROP POLICY IF EXISTS "Admin can create users" ON utenti;
CREATE POLICY "Admin can create users" ON utenti
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM utenti 
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

-- 5. Permetti agli admin di leggere tutti gli utenti
DROP POLICY IF EXISTS "Admin can manage all users" ON utenti;
CREATE POLICY "Admin can manage all users" ON utenti
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM utenti 
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

-- 6. Aggiungi trigger per aggiornare automaticamente il campo updated_at
CREATE OR REPLACE FUNCTION update_utenti_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_utenti_updated_at ON utenti;
CREATE TRIGGER trigger_update_utenti_updated_at
BEFORE UPDATE ON utenti
FOR EACH ROW
EXECUTE FUNCTION update_utenti_updated_at();

