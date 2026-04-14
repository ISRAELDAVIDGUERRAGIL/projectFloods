-- Script de Inicialización de Base de Datos para Supabase (PostgreSQL)
-- database/init.sql

-- ==========================================
-- Tipos de Datos (Reemplazo para ENUMS de MySQL)
-- ==========================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'OPERADOR', 'VISUALIZADOR');
    CREATE TYPE device_status AS ENUM ('ACTIVO', 'INACTIVO', 'MANTENIMIENTO');
    CREATE TYPE system_state AS ENUM ('NORMAL', 'ALERTA', 'PELIGRO');
    CREATE TYPE notif_type AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');
    CREATE TYPE delivery_status AS ENUM ('PENDING', 'SENT', 'FAILED', 'BOUNCED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- Tabla: Users
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'VISUALIZADOR',
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_active ON users(active);

-- ==========================================
-- Tabla: Devices
-- ==========================================
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    status device_status DEFAULT 'ACTIVO',
    firmware_version VARCHAR(20),
    battery_level INT CHECK (battery_level >= 0 AND battery_level <= 100),
    ip_address VARCHAR(45),
    last_connection TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_status ON devices(status);

-- ==========================================
-- Tabla: Readings
-- ==========================================
CREATE TABLE IF NOT EXISTS readings (
    id BIGSERIAL PRIMARY KEY,
    device_id INT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    distance DECIMAL(5,2) NOT NULL,
    water_level DECIMAL(5,2) NOT NULL,
    state system_state NOT NULL,
    temperature DECIMAL(5,2),
    humidity INT,
    signal_strength INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_device_date ON readings(device_id, created_at);
CREATE INDEX IF NOT EXISTS idx_state ON readings(state);
CREATE INDEX IF NOT EXISTS idx_created_at ON readings(created_at);

-- ==========================================
-- Tabla: Alerts
-- ==========================================
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    device_id INT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    state system_state NOT NULL,
    triggered_by VARCHAR(50) DEFAULT 'AUTOMATIC',
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alert_device_date ON alerts(device_id, triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_state ON alerts(state);
CREATE INDEX IF NOT EXISTS idx_resolved ON alerts(resolved_at);

-- ==========================================
-- Tabla: Notifications
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_id INT REFERENCES alerts(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    type notif_type NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status delivery_status DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_notif_date ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_read ON notifications(read);

-- ==========================================
-- Tabla: Event Logs
-- ==========================================
CREATE TABLE IF NOT EXISTS event_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_log_date ON event_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_type ON event_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_entity ON event_logs(entity_type, entity_id);

-- ==========================================
-- Tabla: Configurations
-- ==========================================
CREATE TABLE IF NOT EXISTS configurations (
    id SERIAL PRIMARY KEY,
    device_id INT REFERENCES devices(id) ON DELETE CASCADE,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    data_type VARCHAR(20),
    version INT DEFAULT 1,
    updated_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (device_id, config_key)
);

-- ==========================================
-- Inserción de Usuario Defecto (0000)
-- ==========================================
INSERT INTO users (email, password, full_name, role, active)
VALUES (
    '0000',
    '0000',
    'Super Administrador',
    'ADMIN',
    TRUE
)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

-- ==========================================
-- Insertar Configuraciones por Defecto
-- ==========================================
INSERT INTO configurations (config_key, config_value, description, data_type) VALUES
('TANK_HEIGHT', '100', 'Altura maxima del tanque (cm)', 'float'),
('NORMAL_LEVEL', '30', 'Nivel normal (cm)', 'float'),
('ALERT_LEVEL', '60', 'Nivel de alerta (cm)', 'float'),
('SAMPLE_FREQUENCY', '100', 'Frecuencia de muestreo (ms)', 'integer'),
('SEND_INTERVAL', '300', 'Intervalo de envio (segundos)', 'integer'),
('ALARM_DURATION', '30', 'Duracion de alarma (segundos)', 'integer')
ON CONFLICT DO NOTHING;
