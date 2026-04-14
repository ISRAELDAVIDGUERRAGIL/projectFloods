# 🏗️ Arquitectura del Sistema IoT

## Descripción General

El sistema está dividido en **tres capas principales**: capa de sensores (hardware), capa de procesamiento (backend) y capa de presentación (frontend).

---

## 1️⃣ CAPA DE HARDWARE - Firmware (ESP32)

### Componentes Principales

#### 1.1 Sensor Ultrasónico HC-SR04
- **Función**: Medir distancia entre sensor y superficie del agua
- **Rango de medida**: 2 cm - 400 cm
- **Precisión**: ±3 mm
- **Comunicación**: Digital (pines GPIO)
- **Frecuencia de muestreo**: 10 Hz (cada 100 ms)

**Pines de Conexión**:
- VCC → 5V
- GND → GND
- TRIG → GPIO 32 (ESP32)
- ECHO → GPIO 33 (ESP32)

#### 1.2 Microcontrolador ESP32
- **Procesador**: Dual-core Xtensa 32-bit
- **Memoria RAM**: 520 KB SRAM
- **Memoria FLASH**: 4 MB
- **WiFi**: 802.11 b/g/n
- **Frecuencia**: 2.4 GHz
- **Rango WiFi**: ~100 metros

**Funciones**:
- Lectura de sensor cada 100 ms
- Cálculo de estados (NORMAL/ALERTA/PELIGRO)
- Conexión a WiFi
- Envío de datos a servidor

#### 1.3 Fuente de Alimentación
- **Tipo**: Batería recargable (Li-Po 3000mAh)
- **Voltage**: 5V
- **Consumo promedio**: 150-200 mA
- **Autonomía**: ~15-20 horas

---

## 2️⃣ CAPA DE COMUNICACIÓN - Protocolos

### Protocolo HTTP (Principal)

```
ESP32 → WiFi → Servidor HTTP

POST /api/measurements
{
  "deviceId": "DEVICE_001",
  "waterLevel": 45,
  "distance": 45,
  "state": "ALERTA",
  "timestamp": "2026-04-13T14:30:00Z",
  "temperature": 28.5,
  "battery": 85
}
```

**Características**:
- Protocolo TCP/IP
- Envío cada 5 minutos (configurable)
- Timeouts: 10 segundos
- Reintentos: 3 intentos

### Protocolo MQTT (Backup)

```
Topic: iot/sensors/rojas-pinilla/water-level
Payload: {"level": 45, "state": "ALERTA"}
QoS: 1
```

---

## 3️⃣ CAPA DE BACKEND - Servidor

### 3.1 Estructura de Servicios

```
┌─────────────────────────────────────┐
│      API REST (Express.js)          │
├─────────────────────────────────────┤
│  Routes          │  Controllers     │
│  ├── /devices    │  ├── Device Ctrl │
│  ├── /readings   │  ├── Reading Ctrl│
│  ├── /alerts     │  ├── Alert Ctrl  │
│  └── /auth       │  └── Auth Ctrl   │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│    Business Logic (Services)        │
├─────────────────────────────────────┤
│  ├── MeasurementService             │
│  ├── AlertService                   │
│  ├── NotificationService            │
│  └── AnalyticsService               │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│    Database Layer (Models)          │
├─────────────────────────────────────┤
│  ├── Device Model                   │
│  ├── Reading Model                  │
│  ├── Alert Model                    │
│  └── User Model                     │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│    PostgreSQL Database              │
└─────────────────────────────────────┘
```

### 3.2 Endpoints Principales

| Método | Endpoint | Función |
|--------|----------|---------|
| POST | `/api/measurements` | Recibir datos del sensor |
| GET | `/api/readings` | Obtener historial de lecturas |
| GET | `/api/readings/latest` | Última lectura |
| GET | `/api/alerts` | Obtener alertas activas |
| POST | `/api/alerts/trigger` | Activar alarma manual |
| GET | `/api/devices` | Listar dispositivos |
| POST | `/api/auth/login` | Autenticación usuario |

### 3.3 Procesamiento de Datos

**Algoritmo de Clasificación de Estado**:

```javascript
function classifyState(distance) {
  const waterLevel = TANK_HEIGHT - distance;
  
  if (waterLevel <= NORMAL_LEVEL) {
    return 'NORMAL';
  } else if (waterLevel <= ALERT_LEVEL) {
    return 'ALERTA';
  } else {
    return 'PELIGRO';
  }
}

// Configuración
TANK_HEIGHT = 100 cm (altura máxima del tanque/zona)
NORMAL_LEVEL = 30 cm
ALERT_LEVEL = 60 cm
```

---

## 4️⃣ CAPA DE BASE DE DATOS

### 4.1 Tablas Principales

```sql
-- Tabla de dispositivos
users (id, email, password, role, created_at)
devices (id, device_id, user_id, location, status, created_at)
readings (id, device_id, distance, water_level, state, timestamp)
alerts (id, device_id, state, triggered_at, resolved_at)
notifications (id, user_id, alert_id, message, read, created_at)
```

### 4.2 Relaciones

```
users (1) ──────────── (many) devices
devices (1) ──────────── (many) readings
devices (1) ──────────── (many) alerts
alerts (1) ──────────── (many) notifications
```

---

## 5️⃣ CAPA DE FRONTEND - Dashboard

### 5.1 Componentes Principales

```
┌────────────────────────────────────────────────┐
│           Dashboard Landing                    │
├────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐             │
│ │ Navbar       │  │ User Profile │             │
│ └──────────────┘  └──────────────┘             │
├────────────────────────────────────────────────┤
│         Main Content Area                      │
│ ┌──────────┬──────────┬──────────┐            │
│ │ Widget   │ Widget   │ Widget   │            │
│ │ Estado   │ Nivel    │ Tendencia│            │
│ └──────────┴──────────┴──────────┘            │
│                                                 │
│ ┌──────────────────────────────────────┐      │
│ │   Gráfico Histórico (últimas 24h)   │      │
│ └──────────────────────────────────────┘      │
├────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐      │
│ │   Tabla de Alertas Recientes         │      │
│ └──────────────────────────────────────┘      │
└────────────────────────────────────────────────┘
```

### 5.2 Vistas Disponibles

| Vista | Descripción |
|------|-------------|
| **Dashboard** | Resumen estado actual del sistema |
| **Historial** | Gráficos temporales y análisis |
| **Alertas** | Log de alertas generadas |
| **Configuración** | Ajustar umbrales y parámetros |
| **Control** | Activar/desactivar dispositivos |
| **Usuarios** | Gestión de acceso |

---

## 6️⃣ FLUJO DE DATOS EN TIEMPO REAL

### Secuencia Completa (5 minutos)

```
T0: Sensor mide
  └─ Distance: 45 cm

T1: ESP32 procesa (cada 100ms)
  └─ waterLevel = 100 - 45 = 55 cm
  └─ state = ALERTA (55 > 30, 55 < 60)

T5min: ESP32 envía a servidor
  POST /api/measurements
  {
    deviceId: "DEVICE_001",
    distance: 45,
    waterLevel: 55,
    state: "ALERTA",
    timestamp: "2026-04-13T14:35:00Z"
  }

Servidor recibe (Node.js)
  - Valida datos
  - Guarda en BD
  - Evalúa lógica de alertas
  - Emite notificaciones si es necesario

Frontend actualiza (WebSocket)
  - Recibe evento actualización
  - Redibuja gráficos
  - Muestra notificación al usuario

Usuario visualiza
  - Dashboard actualizado
  - puede activar alarma si necesita
```

---

## 7️⃣ SEGURIDAD Y AUTENTICACIÓN

### 7.1 Autenticación

```
ESP32:
- API_KEY en configuración
- Token renovación cada 24h

Usuario:
- Email + Contraseña
- Token JWT válido 7 días
- Refresh token válido 30 días
```

### 7.2 Encriptación

```
- HTTPS/TLS 1.2+ en producción
- Contraseñas: bcrypt (salt rounds: 10)
- JWT: HS256 o RS256
- Datos sensibles en variables de entorno
```

---

## 8️⃣ ESCALABILIDAD

### Optimizaciones Futuras

1. **Caché**: Redis para datos frecuentes
2. **Compresión**: Gzip en respuestas HTTP
3. **Paginación**: Lectura de datos históricos
4. **Particionamiento BD**: Por fecha
5. **Load Balancer**: Nginx para distribuir carga
6. **CDN**: Cloudflare para frontend
7. **WebSockets**: Actualización en tiempo real

---

## 📊 Especificaciones de Rendimiento

| Métrica | Target |
|---------|--------|
| Latencia respuesta API | < 200 ms |
| Tiempo procesamiento ESP32 | < 100 ms |
| Frecuencia actualización Dashboard | 5-10 seg |
| Retención histórica BD | 1 año mínimo |
| Disponibilidad | 99.5% |

---

**Última actualización**: 13 de Abril de 2026
