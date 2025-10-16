-- Script sicuro per aggiungere solo il sistema di notifiche
-- Questo script non tocca tabelle o politiche esistenti

-- 1. Crea la tabella notifiche solo se non esiste
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES utenti(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('info', 'warning', 'error', 'success')) NOT NULL DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crea gli indici solo se non esistono
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 3. Abilita RLS per le notifiche
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Crea le politiche per le notifiche solo se non esistono
DO $$
BEGIN
    -- Controlla se la policy per admin esiste già
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Admin can manage all notifications'
    ) THEN
        CREATE POLICY "Admin can manage all notifications" ON notifications
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM utenti 
                    WHERE email = auth.jwt() ->> 'email' 
                    AND privilegi = 'admin'
                )
            );
    END IF;

    -- Controlla se la policy per visualizzazione utenti esiste già
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can view their own notifications'
    ) THEN
        CREATE POLICY "Users can view their own notifications" ON notifications
            FOR SELECT USING (
                user_id = (
                    SELECT id FROM utenti 
                    WHERE email = auth.jwt() ->> 'email'
                )
            );
    END IF;

    -- Controlla se la policy per aggiornamento utenti esiste già
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can update their own notifications'
    ) THEN
        CREATE POLICY "Users can update their own notifications" ON notifications
            FOR UPDATE USING (
                user_id = (
                    SELECT id FROM utenti 
                    WHERE email = auth.jwt() ->> 'email'
                )
            );
    END IF;
END $$;

-- 5. Inserisci una notifica di benvenuto per tutti gli admin
INSERT INTO notifications (user_id, title, message, type, read)
SELECT 
    id,
    'Sistema Notifiche Attivato! 🔔',
    'Il nuovo sistema di notifiche è stato installato con successo. Ora riceverai allert per i rapporti mancanti e altre comunicazioni importanti direttamente nell''applicazione.',
    'success',
    false
FROM utenti 
WHERE privilegi = 'admin'
ON CONFLICT DO NOTHING;

-- 6. Messaggio di conferma
SELECT 'Sistema di notifiche installato con successo!' as status;
