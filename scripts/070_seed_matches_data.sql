-- Script para cargar datos de prueba de partidos y resultados
-- Ejecutar después de tener disciplinas, torneos y ubicaciones creados

-- Primero verificamos o creamos un torneo de prueba
INSERT INTO Tournaments (name, year, active, discipline_id, category, division, url)
VALUES 
  ('Liga Regional', 2025, true, 1, 'Primera', 'A', 'https://ligaregional.com.ar'),
  ('Copa Provincial', 2025, true, 1, 'Copa', 'Libre', NULL)
ON CONFLICT DO NOTHING;

-- Verificamos o creamos ubicaciones de prueba
INSERT INTO Locations (name, city, discipline_id, google_maps_url)
VALUES 
  ('Estadio Municipal', 'Carlos Casares', 1, 'https://maps.google.com/?q=-35.6167,-61.3667'),
  ('Club Atlético', 'Pehuajó', 1, 'https://maps.google.com/?q=-35.8167,-61.8833'),
  ('Polideportivo Central', '9 de Julio', 1, 'https://maps.google.com/?q=-35.4500,-60.8833')
ON CONFLICT DO NOTHING;

-- Obtener IDs para usar en los partidos (esto es una aproximación, ajustar según tus datos)
DO $$
DECLARE
  tournament_id_1 INTEGER;
  tournament_id_2 INTEGER;
  location_id_1 INTEGER;
  location_id_2 INTEGER;
  location_id_3 INTEGER;
  discipline_id_val INTEGER := 1; -- Asume disciplina 1 (ajustar según tu BD)
BEGIN
  -- Obtener IDs de torneos
  SELECT id INTO tournament_id_1 FROM Tournaments WHERE name = 'Liga Regional' AND year = 2025 LIMIT 1;
  SELECT id INTO tournament_id_2 FROM Tournaments WHERE name = 'Copa Provincial' AND year = 2025 LIMIT 1;
  
  -- Obtener IDs de ubicaciones
  SELECT id INTO location_id_1 FROM Locations WHERE name = 'Estadio Municipal' LIMIT 1;
  SELECT id INTO location_id_2 FROM Locations WHERE name = 'Club Atlético' LIMIT 1;
  SELECT id INTO location_id_3 FROM Locations WHERE name = 'Polideportivo Central' LIMIT 1;

  -- Insertar 6 partidos (3 próximos, 3 con resultados)
  
  -- PARTIDOS PRÓXIMOS (scheduled)
  INSERT INTO Matches (discipline_id, tournament_id, location_id, match_date, match_time, rival_team, match_type, status, created_at)
  VALUES 
    -- Partido 1: Este fin de semana
    (discipline_id_val, tournament_id_1, location_id_1, 
     CURRENT_DATE + INTERVAL '3 days', '17:00', 'Club Deportivo Pehuajó', 'Fecha 12', 'scheduled', NOW()),
    
    -- Partido 2: Próxima semana
    (discipline_id_val, tournament_id_1, location_id_2, 
     CURRENT_DATE + INTERVAL '7 days', '15:30', 'Racing de 9 de Julio', 'Fecha 13', 'scheduled', NOW()),
    
    -- Partido 3: En dos semanas
    (discipline_id_val, tournament_id_2, location_id_1, 
     CURRENT_DATE + INTERVAL '14 days', '16:00', 'Independiente de Bragado', 'Octavos de Final', 'scheduled', NOW());

  -- PARTIDOS CON RESULTADOS (completed)
  -- Partido 4: Hace 3 días - Victoria
  INSERT INTO Matches (discipline_id, tournament_id, location_id, match_date, match_time, rival_team, match_type, status, created_at)
  VALUES 
    (discipline_id_val, tournament_id_1, location_id_1, 
     CURRENT_DATE - INTERVAL '3 days', '17:00', 'Atlético Chivilcoy', 'Fecha 11', 'completed', NOW())
  RETURNING id INTO location_id_1; -- Reutilizamos variable para guardar match_id

  INSERT INTO MatchResults (match_id, our_score, rival_score, scorers, notes, created_at)
  VALUES 
    (location_id_1, 3, 1, 
     '[{"player_name": "Juan Pérez", "goals": 2}, {"player_name": "Carlos Gómez", "goals": 1}]'::jsonb,
     'Gran partido del equipo', NOW());

  -- Partido 5: Hace 1 semana - Empate
  INSERT INTO Matches (discipline_id, tournament_id, location_id, match_date, match_time, rival_team, match_type, status, created_at)
  VALUES 
    (discipline_id_val, tournament_id_1, location_id_3, 
     CURRENT_DATE - INTERVAL '7 days', '15:00', 'Unión de Henderson', 'Fecha 10', 'completed', NOW())
  RETURNING id INTO location_id_2;

  INSERT INTO MatchResults (match_id, our_score, rival_score, scorers, notes, created_at)
  VALUES 
    (location_id_2, 2, 2, 
     '[{"player_name": "Martín López", "goals": 1}, {"player_name": "Diego Fernández", "goals": 1}]'::jsonb,
     'Partido parejo', NOW());

  -- Partido 6: Hace 2 semanas - Derrota
  INSERT INTO Matches (discipline_id, tournament_id, location_id, match_date, match_time, rival_team, match_type, status, created_at)
  VALUES 
    (discipline_id_val, tournament_id_1, location_id_2, 
     CURRENT_DATE - INTERVAL '14 days', '16:30', 'Club Argentino de Bolívar', 'Fecha 9', 'completed', NOW())
  RETURNING id INTO location_id_3;

  INSERT INTO MatchResults (match_id, our_score, rival_score, scorers, notes, created_at)
  VALUES 
    (location_id_3, 1, 2, 
     '[{"player_name": "Juan Pérez", "goals": 1}]'::jsonb,
     'Derrota ajustada', NOW());

END $$;

-- Mensaje de confirmación
SELECT 'Se insertaron 6 partidos: 3 próximos y 3 con resultados' AS resultado;
