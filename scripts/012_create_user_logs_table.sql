-- Tabla para guardar logs de actividad de usuarios
CREATE TABLE IF NOT EXISTS UserLogs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'password_change', 'profile_update', 'email_verified', 'password_reset_request', 'password_reset_complete'
  action_details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_logs_user_id ON UserLogs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_logs_action_type ON UserLogs(action_type);
CREATE INDEX IF NOT EXISTS idx_user_logs_created_at ON UserLogs(created_at);
