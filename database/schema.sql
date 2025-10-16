-- Creazione delle tabelle per il sistema di rapporti consegne

-- Tabella utenti
CREATE TABLE IF NOT EXISTS utenti (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    cellulare VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    privilegi VARCHAR(20) CHECK (privilegi IN ('admin', 'utente')) NOT NULL DEFAULT 'utente',
    turno VARCHAR(20) CHECK (turno IN ('mattina', 'pomeriggio')) NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella rapporti
CREATE TABLE IF NOT EXISTS rapporti (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operatore VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    ordinari INTEGER DEFAULT 0,
    prelievi INTEGER DEFAULT 0,
    urgenze INTEGER DEFAULT 0,
    trasfusioni INTEGER DEFAULT 0,
    aghi INTEGER DEFAULT 0,
    urgenza_ultimo_momento INTEGER DEFAULT 0,
    mancate_consegne INTEGER DEFAULT 0,
    totale INTEGER DEFAULT 0,
    km_inizio INTEGER DEFAULT 0,
    km_fine INTEGER DEFAULT 0,
    targa VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella allarmi
CREATE TABLE IF NOT EXISTS allarmi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ora_invio TIME NOT NULL,
    attivo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella targhe
CREATE TABLE IF NOT EXISTS targhe (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    targa VARCHAR(20) UNIQUE NOT NULL,
    attiva BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_rapporti_data ON rapporti(data);
CREATE INDEX IF NOT EXISTS idx_rapporti_operatore ON rapporti(operatore);
CREATE INDEX IF NOT EXISTS idx_rapporti_data_operatore ON rapporti(data, operatore);
CREATE INDEX IF NOT EXISTS idx_utenti_email ON utenti(email);
CREATE INDEX IF NOT EXISTS idx_utenti_privilegi ON utenti(privilegi);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crea i trigger solo se non esistono già
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_utenti_updated_at') THEN
        CREATE TRIGGER update_utenti_updated_at BEFORE UPDATE ON utenti
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rapporti_updated_at') THEN
        CREATE TRIGGER update_rapporti_updated_at BEFORE UPDATE ON rapporti
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_allarmi_updated_at') THEN
        CREATE TRIGGER update_allarmi_updated_at BEFORE UPDATE ON allarmi
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Inserimento dati iniziali
INSERT INTO utenti (nome, cognome, cellulare, email, privilegi, turno, password_hash) VALUES
('Riccardo', 'Ramadori', '+39 123 456 7890', 'ramadori@tecnotablet.it', 'utente', 'mattina', '$2a$10$dummy_hash_1'),
('Tiziano', 'Peroni', '+39 123 456 7891', 'peroni@tecnotablet.it', 'utente', 'pomeriggio', '$2a$10$dummy_hash_2'),
('Bertuola', 'Admin', '+39 123 456 7892', 'bertuola@tecnotablet.it', 'admin', null, '$2a$10$dummy_hash_3')
ON CONFLICT (email) DO NOTHING;

-- Inserimento targhe di esempio
INSERT INTO targhe (targa) VALUES
('AB123CD'),
('EF456GH'),
('IJ789KL'),
('MN012OP'),
('QR345ST')
ON CONFLICT (targa) DO NOTHING;

-- Inserimento allarme di esempio
INSERT INTO allarmi (ora_invio) VALUES ('18:00:00')
ON CONFLICT DO NOTHING;

-- Politiche RLS (Row Level Security)
ALTER TABLE utenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapporti ENABLE ROW LEVEL SECURITY;
ALTER TABLE allarmi ENABLE ROW LEVEL SECURITY;
ALTER TABLE targhe ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiche per utenti
CREATE POLICY "Admin can manage all users" ON utenti
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM utenti 
            WHERE email = auth.jwt() ->> 'email' 
            AND privilegi = 'admin'
        )
    );

CREATE POLICY "Users can view their own data" ON utenti
    FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Politiche per rapporti
CREATE POLICY "Admin can manage all reports" ON rapporti
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM utenti 
            WHERE email = auth.jwt() ->> 'email' 
            AND privilegi = 'admin'
        )
    );

CREATE POLICY "Users can manage their own reports" ON rapporti
    FOR ALL USING (
        operatore = (
            SELECT CONCAT(nome, ' ', cognome) 
            FROM utenti 
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Politiche per allarmi
CREATE POLICY "Admin can manage alarms" ON allarmi
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM utenti 
            WHERE email = auth.jwt() ->> 'email' 
            AND privilegi = 'admin'
        )
    );

-- Politiche per targhe
CREATE POLICY "Admin can manage targhe" ON targhe
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM utenti 
            WHERE email = auth.jwt() ->> 'email' 
            AND privilegi = 'admin'
        )
    );

CREATE POLICY "Users can view active targhe" ON targhe
    FOR SELECT USING (attiva = true);

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
