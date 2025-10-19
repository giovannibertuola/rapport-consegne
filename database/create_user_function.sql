-- Funzione per creare utenti bypassando la cache PostgREST

CREATE OR REPLACE FUNCTION create_user_direct(
    p_nome VARCHAR,
    p_cognome VARCHAR,
    p_cellulare VARCHAR,
    p_email VARCHAR,
    p_privilegi VARCHAR,
    p_turno VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Insert diretto senza usare la cache
    INSERT INTO utenti (nome, cognome, cellulare, email, privilegi, turno)
    VALUES (p_nome, p_cognome, p_cellulare, p_email, p_privilegi, p_turno)
    RETURNING id INTO v_user_id;
    
    RETURN v_user_id;
END;
$$;

-- Permetti l'esecuzione agli admin
GRANT EXECUTE ON FUNCTION create_user_direct TO authenticated;

