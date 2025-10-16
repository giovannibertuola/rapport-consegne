-- Tabella per la configurazione Bayleis
CREATE TABLE IF NOT EXISTS bayleis_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    instance_id VARCHAR(255) NOT NULL,
    api_key VARCHAR(500) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    qr_code TEXT,
    is_connected BOOLEAN DEFAULT false,
    connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per le performance
CREATE INDEX IF NOT EXISTS idx_bayleis_config_instance_id ON bayleis_config(instance_id);
CREATE INDEX IF NOT EXISTS idx_bayleis_config_is_connected ON bayleis_config(is_connected);

-- Abilita RLS
ALTER TABLE bayleis_config ENABLE ROW LEVEL SECURITY;

-- Politiche RLS - Solo admin può gestire la configurazione Bayleis
CREATE POLICY "Admin can manage Bayleis config" ON bayleis_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM utenti 
            WHERE email = auth.jwt() ->> 'email' 
            AND privilegi = 'admin'
        )
    );

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_bayleis_config_updated_at 
    BEFORE UPDATE ON bayleis_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
