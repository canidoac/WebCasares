-- Tabla para tokens de verificación de email
CREATE TABLE IF NOT EXISTS EmailVerificationTokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Añadir columna de email verificado a la tabla User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Índices
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON EmailVerificationTokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON EmailVerificationTokens(user_id);
