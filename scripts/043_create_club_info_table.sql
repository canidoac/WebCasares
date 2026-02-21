-- Crear tabla para información del club
CREATE TABLE IF NOT EXISTS "ClubInfo" (
  id INTEGER PRIMARY KEY DEFAULT 1,
  history_title TEXT NOT NULL DEFAULT 'Nuestra Historia',
  history_content TEXT NOT NULL,
  history_image_url TEXT,
  mission_title TEXT DEFAULT 'Nuestra Misión',
  mission_content TEXT,
  vision_title TEXT DEFAULT 'Nuestra Visión',
  vision_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_club_info CHECK (id = 1)
);

-- Insertar datos iniciales
INSERT INTO "ClubInfo" (history_content, history_image_url) VALUES (
  'El Club Carlos Casares fue fundado en 2017 por un grupo de estudiantes oriundos de la ciudad de Carlos Casares. En sus inicios, nuestro club se llamaba Carlos Casares FC, ya que solo contábamos con una disciplina deportiva. Sin embargo, con el paso del tiempo y gracias al entusiasmo de sus miembros, comenzaron a surgir nuevas disciplinas, con el objetivo de que cada estudiante proveniente de nuestra ciudad encontrara un espacio donde practicar el deporte que más le apasiona. Desde el primer día, nuestro objetivo ha sido crear un lugar de encuentro y desarrollo para los jóvenes de Carlos Casares. De aquellos humildes comienzos, con una sola disciplina y apenas 18 integrantes, el club ha crecido año tras año hasta convertirse en una institución emblemática para todos los casarenses que vivimos lejos de casa.

A lo largo de estos años, hemos participado en numerosos campeonatos y torneos en distintas disciplinas. Sin embargo, nuestro mayor orgullo no está en los trofeos que ganamos, sino en haber logrado unir a los estudiantes y miembros del club, ya sea jugando al deporte que amamos, compartiendo una cena, una fiesta o simplemente disfrutando de un entrenamiento juntos.

Hoy, el Club Carlos Casares es mucho más que un espacio deportivo: es un segundo hogar para muchos, un punto de encuentro para amigos y compañeros, y un motor fundamental de la vida social y cultural de nuestra comunidad, incluso estando lejos de nuestra ciudad.',
  '/placeholder.svg?height=400&width=800'
) ON CONFLICT (id) DO NOTHING;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_club_info_updated_at ON "ClubInfo"(updated_at);
