-- Crear tabla de encuestas
CREATE TABLE IF NOT EXISTS "Surveys" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "requires_login" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "questions" JSONB NOT NULL, -- Array de preguntas con su configuración
  "created_by" INTEGER REFERENCES "User"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "start_date" TIMESTAMP,
  "end_date" TIMESTAMP
);

-- Crear tabla de respuestas
CREATE TABLE IF NOT EXISTS "SurveyResponses" (
  "id" SERIAL PRIMARY KEY,
  "survey_id" INTEGER NOT NULL REFERENCES "Surveys"("id") ON DELETE CASCADE,
  "user_id" INTEGER REFERENCES "User"("id") ON DELETE SET NULL,
  "responses" JSONB NOT NULL, -- Array de respuestas
  "submitted_at" TIMESTAMP DEFAULT NOW(),
  "ip_address" TEXT
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS "idx_surveys_active" ON "Surveys"("is_active");
CREATE INDEX IF NOT EXISTS "idx_surveys_dates" ON "Surveys"("start_date", "end_date");
CREATE INDEX IF NOT EXISTS "idx_survey_responses_survey_id" ON "SurveyResponses"("survey_id");
CREATE INDEX IF NOT EXISTS "idx_survey_responses_user_id" ON "SurveyResponses"("user_id");

-- Comentarios para documentación
COMMENT ON TABLE "Surveys" IS 'Tabla de encuestas del club';
COMMENT ON TABLE "SurveyResponses" IS 'Tabla de respuestas a encuestas';

COMMENT ON COLUMN "Surveys"."questions" IS 'Array JSON de preguntas con formato: [{id, type, label, required, options, validation}]';
COMMENT ON COLUMN "SurveyResponses"."responses" IS 'Array JSON de respuestas con formato: [{question_id, value}]';
