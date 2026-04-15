-- Script de Inicialización de Base de Datos para MySQL
-- database/init.sql

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    role ENUM('ADMIN', 'OPERADOR', 'VISUALIZADOR') DEFAULT 'VISUALIZADOR',
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('ACTIVO', 'INACTIVO', 'MANTENIMIENTO') DEFAULT 'ACTIVO',
    firmware_version VARCHAR(20),
    battery_level INT,
    ip_address VARCHAR(45),
    last_connection TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS readings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    distance DECIMAL(5,2) NOT NULL,
    water_level DECIMAL(5,2) NOT NULL,
    state ENUM('NORMAL', 'ALERTA', 'PELIGRO') NOT NULL,
    temperature DECIMAL(5,2),
    humidity INT,
    signal_strength INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    state ENUM('NORMAL', 'ALERTA', 'PELIGRO') NOT NULL,
    triggered_by VARCHAR(50) DEFAULT 'AUTOMATIC',
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS configurations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id INT,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    data_type VARCHAR(20),
    version INT DEFAULT 1,
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (device_id, config_key)
);

CREATE TABLE IF NOT EXISTS event_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    user_id INT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    alert_id INT NULL,
    message TEXT NOT NULL,
    type ENUM('EMAIL', 'SMS', 'PUSH', 'IN_APP') NOT NULL,
    `read` BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'SENT', 'FAILED', 'BOUNCED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE SET NULL
);

INSERT IGNORE INTO users (id, email, password, full_name, role, active)
VALUES (
    1,
    '0000',
    '0000',
    'Super Administrador',
    'ADMIN',
    TRUE
);

INSERT IGNORE INTO configurations (config_key, config_value, description, data_type) VALUES
('TANK_HEIGHT', '100', 'Altura maxima del tanque (cm)', 'float'),
('NORMAL_LEVEL', '30', 'Nivel normal (cm)', 'float'),
('ALERT_LEVEL', '60', 'Nivel de alerta (cm)', 'float'),
('SAMPLE_FREQUENCY', '100', 'Frecuencia de muestreo (ms)', 'integer'),
('SEND_INTERVAL', '300', 'Intervalo de envio (s)', 'integer'),
('ALARM_DURATION', '30', 'Duracion de alarma (s)', 'integer');
