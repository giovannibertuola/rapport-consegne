-- Script per aggiungere il sistema di notifiche al database esistente
-- Esegui questo script se hai già un database funzionante

-- Tabella notifiche
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES utenti(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('info', 'warning', 'error', 'success')) NOT NULL DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per le notifiche
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Abilita RLS per le notifiche
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiche per notifiche
CREATE POLICY "Admin can manage all notifications" ON notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM utenti 
            WHERE email = auth.jwt() ->> 'email' 
            AND privilegi = 'admin'
        )
    );

CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (
        user_id = (
            SELECT id FROM utenti 
            WHERE email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (
        user_id = (
            SELECT id FROM utenti 
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Inserisci una notifica di test per l'admin (opzionale)
INSERT INTO notifications (user_id, title, message, type, read)
SELECT 
    id,
    'Sistema Notifiche Attivato',
    'Il nuovo sistema di notifiche è stato installato con successo! Ora riceverai allert e messaggi direttamente nell''applicazione.',
    'success',
    false
FROM utenti 
WHERE privilegi = 'admin'
ON CONFLICT DO NOTHING;
