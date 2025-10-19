-- Schema avanzato per gestione allarmi intelligenti
-- Sistema che gestisce notifiche basate su turni, giorni della settimana e orari

-- Tabella configurazione allarmi per operatori
CREATE TABLE IF NOT EXISTS allarmi_operatori (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES utenti(id) ON DELETE CASCADE,
    turno VARCHAR(20) CHECK (turno IN ('mattina', 'pomeriggio', 'giornaliero')) NOT NULL,
    
    -- Orari di lavoro
    ora_inizio TIME NOT NULL,
    ora_fine TIME NOT NULL,
    
    -- Orari allarmi
    orario_allarme_lun_ven TIME NOT NULL,  -- Allarme lunedì-venerdì
    orario_allarme_sabato TIME NOT NULL,    -- Allarme sabato
    orario_allarme_lunedi_successivo TIME,  -- Allarme per lunedì dopo weekend
    
    -- Giorni lavorativi
    lavora_lunedi BOOLEAN DEFAULT true,
    lavora_martedi BOOLEAN DEFAULT true,
    lavora_mercoledi BOOLEAN DEFAULT true,
    lavora_giovedi BOOLEAN DEFAULT true,
    lavora_venerdi BOOLEAN DEFAULT true,
    lavora_sabato BOOLEAN DEFAULT true,
    lavora_domenica BOOLEAN DEFAULT false,
    
    -- Configurazione
    attivo BOOLEAN DEFAULT true,
    invia_dopo_orario BOOLEAN DEFAULT false,  -- Se false, non invia dopo ora_fine
    limite_orario_invio TIME DEFAULT '18:00:00',  -- Non invia dopo quest'ora
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Tabella log allarmi inviati
CREATE TABLE IF NOT EXISTS log_allarmi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES utenti(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    ora_invio TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo_allarme VARCHAR(50) NOT NULL,  -- 'giornaliero', 'weekend', 'promemoria'
    inviato BOOLEAN DEFAULT true,
    motivo_skip VARCHAR(255),  -- Motivo se non inviato (es: "rapporto già inviato", "fuori orario")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella stato rapporti giornalieri (per tracking veloce)
CREATE TABLE IF NOT EXISTS stato_rapporti_giornalieri (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES utenti(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    rapporto_inviato BOOLEAN DEFAULT false,
    ora_invio TIMESTAMP WITH TIME ZONE,
    allarme_inviato BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, data)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_allarmi_operatori_user_id ON allarmi_operatori(user_id);
CREATE INDEX IF NOT EXISTS idx_allarmi_operatori_attivo ON allarmi_operatori(attivo);
CREATE INDEX IF NOT EXISTS idx_log_allarmi_user_data ON log_allarmi(user_id, data);
CREATE INDEX IF NOT EXISTS idx_log_allarmi_data ON log_allarmi(data);
CREATE INDEX IF NOT EXISTS idx_stato_rapporti_user_data ON stato_rapporti_giornalieri(user_id, data);
CREATE INDEX IF NOT EXISTS idx_stato_rapporti_data ON stato_rapporti_giornalieri(data);

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_allarmi_operatori_updated_at 
BEFORE UPDATE ON allarmi_operatori
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stato_rapporti_updated_at 
BEFORE UPDATE ON stato_rapporti_giornalieri
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funzione per verificare se è ora di inviare l'allarme
CREATE OR REPLACE FUNCTION should_send_alarm(
    p_user_id UUID,
    p_current_time TIME,
    p_current_day INTEGER  -- 0=Domenica, 1=Lunedì, ..., 6=Sabato
) RETURNS BOOLEAN AS $$
DECLARE
    v_config RECORD;
    v_rapporto_inviato BOOLEAN;
    v_alarm_time TIME;
    v_is_working_day BOOLEAN;
BEGIN
    -- Ottieni configurazione allarme utente
    SELECT * INTO v_config
    FROM allarmi_operatori
    WHERE user_id = p_user_id AND attivo = true;
    
    -- Se non c'è configurazione, non inviare
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Verifica se è un giorno lavorativo
    v_is_working_day := CASE p_current_day
        WHEN 0 THEN v_config.lavora_domenica
        WHEN 1 THEN v_config.lavora_lunedi
        WHEN 2 THEN v_config.lavora_martedi
        WHEN 3 THEN v_config.lavora_mercoledi
        WHEN 4 THEN v_config.lavora_giovedi
        WHEN 5 THEN v_config.lavora_venerdi
        WHEN 6 THEN v_config.lavora_sabato
        ELSE false
    END;
    
    -- Se non è giorno lavorativo, non inviare
    IF NOT v_is_working_day THEN
        RETURN false;
    END IF;
    
    -- Controlla se è dopo il limite orario
    IF p_current_time > v_config.limite_orario_invio AND NOT v_config.invia_dopo_orario THEN
        RETURN false;
    END IF;
    
    -- Determina quale orario allarme usare
    IF p_current_day = 6 THEN  -- Sabato
        v_alarm_time := v_config.orario_allarme_sabato;
    ELSIF p_current_day = 1 AND v_config.orario_allarme_lunedi_successivo IS NOT NULL THEN  -- Lunedì
        v_alarm_time := v_config.orario_allarme_lunedi_successivo;
    ELSE  -- Lunedì-Venerdì normale
        v_alarm_time := v_config.orario_allarme_lun_ven;
    END IF;
    
    -- Controlla se è l'ora esatta (con tolleranza di 1 minuto)
    IF p_current_time < v_alarm_time OR p_current_time > v_alarm_time + INTERVAL '1 minute' THEN
        RETURN false;
    END IF;
    
    -- Verifica se il rapporto è già stato inviato oggi
    SELECT rapporto_inviato INTO v_rapporto_inviato
    FROM stato_rapporti_giornalieri
    WHERE user_id = p_user_id 
    AND data = CURRENT_DATE;
    
    -- Se rapporto già inviato, non inviare allarme
    IF v_rapporto_inviato THEN
        RETURN false;
    END IF;
    
    -- Verifica se allarme già inviato oggi
    IF EXISTS (
        SELECT 1 FROM log_allarmi
        WHERE user_id = p_user_id 
        AND data = CURRENT_DATE
        AND inviato = true
    ) THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Funzione per aggiornare stato rapporto quando viene inviato
CREATE OR REPLACE FUNCTION update_rapporto_stato()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO stato_rapporti_giornalieri (user_id, data, rapporto_inviato, ora_invio)
    SELECT u.id, NEW.data, true, NEW.created_at
    FROM utenti u
    WHERE CONCAT(u.nome, ' ', u.cognome) = NEW.operatore
    ON CONFLICT (user_id, data) 
    DO UPDATE SET 
        rapporto_inviato = true,
        ora_invio = NEW.created_at,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per aggiornare stato quando si inserisce un rapporto
DROP TRIGGER IF EXISTS trigger_update_rapporto_stato ON rapporti;
CREATE TRIGGER trigger_update_rapporto_stato
AFTER INSERT ON rapporti
FOR EACH ROW
EXECUTE FUNCTION update_rapporto_stato();

-- Inserimento configurazioni di esempio
INSERT INTO allarmi_operatori (
    user_id,
    turno,
    ora_inizio,
    ora_fine,
    orario_allarme_lun_ven,
    orario_allarme_sabato,
    orario_allarme_lunedi_successivo,
    lavora_domenica,
    limite_orario_invio
)
SELECT 
    u.id,
    CASE 
        WHEN u.nome = 'Riccardo' AND u.cognome = 'Ramadori' THEN 'mattina'
        WHEN u.nome = 'Tiziano' AND u.cognome = 'Peroni' THEN 'pomeriggio'
        ELSE 'giornaliero'
    END,
    CASE 
        WHEN u.nome = 'Riccardo' AND u.cognome = 'Ramadori' THEN '09:00:00'::TIME
        WHEN u.nome = 'Tiziano' AND u.cognome = 'Peroni' THEN '10:00:00'::TIME
        ELSE '09:00:00'::TIME
    END,
    CASE 
        WHEN u.nome = 'Riccardo' AND u.cognome = 'Ramadori' THEN '15:00:00'::TIME
        WHEN u.nome = 'Tiziano' AND u.cognome = 'Peroni' THEN '17:42:00'::TIME
        ELSE '17:00:00'::TIME
    END,
    CASE 
        WHEN u.nome = 'Riccardo' AND u.cognome = 'Ramadori' THEN '15:00:00'::TIME
        WHEN u.nome = 'Tiziano' AND u.cognome = 'Peroni' THEN '17:00:00'::TIME
        ELSE '17:00:00'::TIME
    END,
    CASE 
        WHEN u.nome = 'Riccardo' AND u.cognome = 'Ramadori' THEN '15:00:00'::TIME
        WHEN u.nome = 'Tiziano' AND u.cognome = 'Peroni' THEN '15:00:00'::TIME
        ELSE '15:00:00'::TIME
    END,
    CASE 
        WHEN u.nome = 'Riccardo' AND u.cognome = 'Ramadori' THEN '17:00:00'::TIME
        WHEN u.nome = 'Tiziano' AND u.cognome = 'Peroni' THEN '17:00:00'::TIME
        ELSE '17:00:00'::TIME
    END,
    false,
    '18:00:00'::TIME
FROM utenti u
WHERE u.privilegi = 'utente'
ON CONFLICT (user_id) DO UPDATE SET
    turno = EXCLUDED.turno,
    ora_inizio = EXCLUDED.ora_inizio,
    ora_fine = EXCLUDED.ora_fine,
    orario_allarme_lun_ven = EXCLUDED.orario_allarme_lun_ven,
    orario_allarme_sabato = EXCLUDED.orario_allarme_sabato,
    orario_allarme_lunedi_successivo = EXCLUDED.orario_allarme_lunedi_successivo;

-- Politiche RLS
ALTER TABLE allarmi_operatori ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_allarmi ENABLE ROW LEVEL SECURITY;
ALTER TABLE stato_rapporti_giornalieri ENABLE ROW LEVEL SECURITY;

-- Admin può vedere e modificare tutto
CREATE POLICY "Admin can manage allarmi_operatori" ON allarmi_operatori
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM utenti 
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

CREATE POLICY "Admin can view log_allarmi" ON log_allarmi
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM utenti 
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

CREATE POLICY "Admin can view stato_rapporti" ON stato_rapporti_giornalieri
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM utenti 
        WHERE email = auth.jwt() ->> 'email' 
        AND privilegi = 'admin'
    )
);

-- Utenti possono vedere le proprie configurazioni
CREATE POLICY "Users can view own allarmi_operatori" ON allarmi_operatori
FOR SELECT USING (
    user_id = (
        SELECT id FROM utenti 
        WHERE email = auth.jwt() ->> 'email'
    )
);

CREATE POLICY "Users can view own log_allarmi" ON log_allarmi
FOR SELECT USING (
    user_id = (
        SELECT id FROM utenti 
        WHERE email = auth.jwt() ->> 'email'
    )
);

CREATE POLICY "Users can view own stato_rapporti" ON stato_rapporti_giornalieri
FOR SELECT USING (
    user_id = (
        SELECT id FROM utenti 
        WHERE email = auth.jwt() ->> 'email'
    )
);

