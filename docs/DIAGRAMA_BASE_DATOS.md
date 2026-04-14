# 🗄️ Diseño de Base de Datos

## Diagrama Entidad-Relación

```
┌──────────────────────┐
│      users           │
├──────────────────────┤
│ id (PK)              │◄──────┐
│ email (UQ)           │       │ (1)
│ password (bcrypt)    │       │
│ full_name            │       │ (many)
│ phone                │       │
│ role (enum)          │       │
│ active               │       │
│ created_at           │       │
│ updated_at           │       │
└──────────────────────┘       │
                               │
                        ┌──────────────────────┐
                        │     devices          │
                        ├──────────────────────┤
                        │ id (PK)              │
                        │ device_id (UQ)       │
                        │ user_id (FK) ────────┘
                        │ location             │
                        │ description          │
                        │ status               │
                        │ firmware_version     │
                        │ battery_level        │
                        │ last_connection      │
                        │ created_at           │
                        │ updated_at           │
                        └──────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼──────────┐    ┌────────▼──────────┐
            │    readings      │    │     alerts       │
            ├──────────────────┤    ├──────────────────┤
            │ id (PK)          │    │ id (PK)          │
            │ device_id (FK)   │    │ device_id (FK)   │
            │ distance         │    │ state            │
            │ water_level      │    │ triggered_at     │
            │ state            │    │ resolved_at      │
            │ temperature      │    │ triggered_by     │
            │ created_at       │    │ notes            │
            │ (índice: date)   │    │ created_at       │
            └──────────────────┘    └────────┬─────────┘
                                             │
                                             │ (1) (many)
                        ┌────────────────────┘
                        │
                    ┌───▼──────────────────┐
                    │  notifications      │
                    ├─────────────────────┤
                    │ id (PK)             │
                    │ user_id (FK)        │
                    │ alert_id (FK)       │
                    │ message             │
                    │ type (enum)         │
                    │ read                │
                    │ read_at             │
                    │ created_at          │
                    └─────────────────────┘
```

---

## 1️⃣ Tabla: users

**Descripción**: Almacena información de usuarios del sistema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    role ENUM('ADMIN', 'OPERADOR', 'VISUALIZADOR') DEFAULT 'VISUALIZADOR',
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Índices**:
- PRIMARY KEY: `id`
- UNIQUE: `email`
- INDEX: `active`

**Restricciones**:
- Email: Formato de correo válido
- Password: Mínimo 8 caracteres
- Role: Solo valores permitidos

---

## 2️⃣ Tabla: devices

**Descripción**: Información de los dispositivos ESP32

```sql
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('ACTIVO', 'INACTIVO', 'MANTENIMIENTO') DEFAULT 'ACTIVO',
    firmware_version VARCHAR(20),
    battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
    ip_address VARCHAR(45),
    last_connection TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Índices**:
- PRIMARY KEY: `id`
- UNIQUE: `device_id`
- FOREIGN KEY: `user_id` → users.id
- INDEX: `user_id`
- INDEX: `status`

**Restricciones**:
- device_id: No vacío, único
- user_id: Debe existir en users
- battery_level: 0-100

---

## 3️⃣ Tabla: readings

**Descripción**: Mediciones del sensor (tabla de alto volumemen)

```sql
CREATE TABLE readings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    device_id INTEGER NOT NULL,
    distance DECIMAL(5,2) NOT NULL,
    water_level DECIMAL(5,2) NOT NULL,
    state ENUM('NORMAL', 'ALERTA', 'PELIGRO') NOT NULL,
    temperature DECIMAL(5,2),
    humidity INTEGER,
    signal_strength INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    INDEX idx_device_date (device_id, created_at),
    INDEX idx_state (state),
    INDEX idx_created_at (created_at)
);
```

**Índices**:
- PRIMARY KEY: `id`
- SECONDARY: `idx_device_date` (device_id, created_at) - Para queries frecuentes
- SECONDARY: `idx_state` - Para análisis de estados
- SECONDARY: `idx_created_at` - Para aserciones de tiempo

**Restricciones**:
- device_id: Debe existir
- distance: 0 - 400 cm
- water_level: 0 - 100 cm
- state: Solo valores permitidos

**Particionamiento (Futuro)**:
```sql
-- Particionar por mes para optimizar
PARTITION BY RANGE (YEAR_MONTH(created_at))
```

---

## 4️⃣ Tabla: alerts

**Descripción**: Registro de cambios de estado/alertas

```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL,
    state ENUM('NORMAL', 'ALERTA', 'PELIGRO') NOT NULL,
    triggered_by VARCHAR(50) DEFAULT 'AUTOMATIC', -- 'AUTOMATIC' o username
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    duration_minutes INTEGER GENERATED ALWAYS AS 
        (TIMESTAMPDIFF(MINUTE, triggered_at, COALESCE(resolved_at, NOW()))) STORED,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    INDEX idx_device_date (device_id, triggered_at DESC),
    INDEX idx_state (state),
    INDEX idx_resolved (resolved_at)
);
```

**Índices**:
- PRIMARY KEY: `id`
- SECONDARY: `idx_device_date` - Alertas recientes por dispositivo
- SECONDARY: `idx_state` - Análisis por tipo de estado
- SECONDARY: `idx_resolved` - Alertas pendientes

**Restricciones**:
- device_id: Debe existir
- state: Solo valores permitidos
- resolved_at: NULL mientras esté activa, se llena al resolver

---

## 5️⃣ Tabla: notifications

**Descripción**: Notificaciones enviadas a usuarios

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    alert_id INTEGER,
    message TEXT NOT NULL,
    type ENUM('EMAIL', 'SMS', 'PUSH', 'IN_APP') NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_status ENUM('PENDING', 'SENT', 'FAILED', 'BOUNCED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, created_at DESC),
    INDEX idx_read (read),
    INDEX idx_type (type)
);
```

**Índices**:
- PRIMARY KEY: `id`
- SECONDARY: `idx_user_date` - Notificaciones por usuario
- SECONDARY: `idx_read` - Filtrar leídas/no leídas
- SECONDARY: `idx_type` - Por canal de entrega

---

## 6️⃣ Tabla: event_logs

**Descripción**: Audit trail de eventos del sistema

```sql
CREATE TABLE event_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    user_id INTEGER,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_date (created_at DESC),
    INDEX idx_event_type (event_type),
    INDEX idx_entity (entity_type, entity_id)
);
```

**Eventos registrados**:
- `DEVICE_CONNECTED` - Dispositivo conectado
- `DEVICE_DISCONNECTED` - Dispositivo desconectado
- `STATE_CHANGED` - Cambio de estado
- `ALERT_TRIGGERED` - Alerta activada
- `ALARM_ACTIVATED` - Alarma activada manualmente
- `READING_RECEIVED` - Lectura recibida
- `USER_LOGIN` - Usuario logueado
- `CONFIG_CHANGED` - Configuración modificada

---

## 7️⃣ Tabla: configurations

**Descripción**: Parámetros configurables del sistema

```sql
CREATE TABLE configurations (
    id SERIAL PRIMARY KEY,
    device_id INTEGER,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    data_type VARCHAR(20), -- 'string', 'integer', 'float', 'boolean'
    version INTEGER DEFAULT 1,
    updated_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_device_key (device_id, config_key)
);
```

**Configuraciones Default**:
```
- TANK_HEIGHT: 100 (cm)
- NORMAL_LEVEL: 30 (cm)
- ALERT_LEVEL: 60 (cm)
- SAMPLE_FREQUENCY: 100 (ms)
- SEND_INTERVAL: 300 (seg / 5 min)
- ALARM_DURATION: 30 (seg)
```

---

## Estadísticas Esperadas

| Tabla | Registros/mes | Crecimiento | Espacio |
|-------|---------------|-------------|---------|
| users | 5-10 | Lento | 1-2 MB |
| devices | 1-5 | Lento | 100 KB |
| readings | 432,000* | Rápido | 100-200 MB/mes |
| alerts | 50-100 | Medio | 100 KB/mes |
| notifications | 200-500 | Medio | 500 KB/mes |
| event_logs | 10,000+ | Medio | 10 MB/mes |

*Cálculo: 1 lectura cada 5 minutos = 288 lecturas/día × 30 días = 8,640 por dispositivo/mes × 50 dispositivos = 432,000

---

## Script de Inicialización (init.sql)

```sql
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS iot_inundaciones;
USE iot_inundaciones;

-- Crear tablas
[INCLUIR SCRIPTS DE CREACIÓN ANTERIORES]

-- Crear índices adicionales
CREATE INDEX idx_readings_state ON readings(state);
CREATE INDEX idx_alerts_resolved ON alerts(resolved_at);

-- Insertar roles por defecto
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Acceso total al sistema'),
('OPERADOR', 'Puede monitorear y activar alarmas'),
('VISUALIZADOR', 'Solo visualización de datos');

-- Crear usuario administrador por defecto
INSERT INTO users (email, password, full_name, role, active)
VALUES ('admin@iot-inundaciones.local', 'bcrypt_hash_aqui', 'Administrator', 'ADMIN', TRUE);
```

---

## Backup y Recuperación

**Frecuencia**: Diaria a las 02:00 AM
```bash
mysqldump -u user -p iot_inundaciones > backup_$(date +%Y%m%d).sql
```

**Retención**: 30 días locales + 90 días en cloud storage

---

**Última actualización**: 13 de Abril de 2026
