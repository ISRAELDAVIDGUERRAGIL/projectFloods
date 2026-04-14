# 🔌 Documentación API REST

## Base URL

```
Desarrollo: http://localhost:3000/api
Producción: https://api.iot-inundaciones.com/api
```

---

## Autenticación

Todos los endpoints protegidos requieren:

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Login

```http
POST /auth/login

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "Juan Pérez",
    "role": "OPERADOR"
  }
}
```

---

## ENDPOINTS - Mediciones

### Enviar Medición (ESP32)

```http
POST /measurements

Authentication: API_KEY
Content-Type: application/json

Request Body:
{
  "deviceId": "DEVICE_001",
  "distance": 45.5,
  "temperature": 28.3,
  "battery": 85,
  "timestamp": "2026-04-13T14:35:00Z"
}

Response (201 Created):
{
  "success": true,
  "measurement": {
    "id": 12345,
    "device_id": "DEVICE_001",
    "distance": 45.5,
    "water_level": 54.5,
    "state": "ALERTA",
    "created_at": "2026-04-13T14:35:00Z"
  }
}

Errors:
- 400: Invalid device ID
- 401: Invalid API KEY
- 500: Server error
```

### Obtener Última Medición

```http
GET /measurements/latest?deviceId=DEVICE_001

Authentication: Bearer JWT

Response (200 OK):
{
  "success": true,
  "measurement": {
    "id": 12345,
    "device_id": "DEVICE_001",
    "distance": 45.5,
    "water_level": 54.5,
    "state": "ALERTA",
    "temperature": 28.3,
    "battery": 85,
    "created_at": "2026-04-13T14:35:00Z"
  }
}
```

### Obtener Historial de Mediciones

```http
GET /measurements?deviceId=DEVICE_001&startDate=2026-04-01&endDate=2026-04-13&limit=100

Authentication: Bearer JWT

Query Parameters:
- deviceId: (required) ID del dispositivo
- startDate: (optional) Formato: YYYY-MM-DD
- endDate: (optional) Formato: YYYY-MM-DD
- limit: (optional, default: 100, max: 1000)
- offset: (optional, default: 0)

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "device_id": "DEVICE_001",
      "distance": 45.5,
      "water_level": 54.5,
      "state": "ALERTA",
      "created_at": "2026-04-13T14:35:00Z"
    },
    ...
  ],
  "total": 432,
  "limit": 100,
  "offset": 0
}
```

---

## ENDPOINTS - Alertas

### Obtener Alertas Activas

```http
GET /alerts?status=active

Authentication: Bearer JWT

Response (200 OK):
{
  "success": true,
  "alerts": [
    {
      "id": 5,
      "device_id": 1,
      "state": "PELIGRO",
      "triggered_at": "2026-04-13T15:20:00Z",
      "resolved_at": null,
      "duration_minutes": 15,
      "triggered_by": "AUTOMATIC"
    }
  ]
}
```

### Obtener Historial de Alertas

```http
GET /alerts/history?deviceId=DEVICE_001&limit=50

Authentication: Bearer JWT

Response (200 OK):
{
  "success": true,
  "alerts": [
    {
      "id": 5,
      "device_id": 1,
      "state": "PELIGRO",
      "triggered_at": "2026-04-13T15:20:00Z",
      "resolved_at": "2026-04-13T15:50:00Z",
      "duration_minutes": 30,
      "triggered_by": "AUTOMATIC"
    }
  ],
  "total": 142
}
```

### Activar Alarma Manualmente

```http
POST /alerts/trigger-alarm

Authentication: Bearer JWT

Request Body:
{
  "deviceId": "DEVICE_001",
  "reason": "Manual testing",
  "duration": 30
}

Response (200 OK):
{
  "success": true,
  "message": "Alarm activated",
  "alert": {
    "id": 6,
    "device_id": 1,
    "state": "PELIGRO",
    "triggered_at": "2026-04-13T15:55:00Z",
    "triggered_by": "user@example.com",
    "duration_seconds": 30
  }
}
```

### Resolver Alerta

```http
POST /alerts/{alertId}/resolve

Authentication: Bearer JWT

Request Body:
{
  "resolution": "Manual resolution"
}

Response (200 OK):
{
  "success": true,
  "alert": {
    "id": 5,
    "resolved_at": "2026-04-13T15:50:00Z",
    "duration_minutes": 30
  }
}
```

---

## ENDPOINTS - Dispositivos

### Registrar Dispositivo

```http
POST /devices

Authentication: Bearer JWT

Request Body:
{
  "device_id": "DEVICE_001",
  "location": "Calle Principal esquina 5ta",
  "description": "Sensor principal barrio Rojas Pinilla",
  "api_key": "sk_live_51234567890"
}

Response (201 Created):
{
  "success": true,
  "device": {
    "id": 1,
    "device_id": "DEVICE_001",
    "location": "Calle Principal esquina 5ta",
    "status": "ACTIVO",
    "created_at": "2026-04-13T10:00:00Z"
  }
}
```

### Obtener Dispositivos del Usuario

```http
GET /devices

Authentication: Bearer JWT

Response (200 OK):
{
  "success": true,
  "devices": [
    {
      "id": 1,
      "device_id": "DEVICE_001",
      "location": "Calle Principal esquina 5ta",
      "status": "ACTIVO",
      "battery_level": 85,
      "last_connection": "2026-04-13T14:35:00Z",
      "firmware_version": "1.0.0"
    }
  ]
}
```

### Obtener Detalles de Dispositivo

```http
GET /devices/{deviceId}

Authentication: Bearer JWT

Response (200 OK):
{
  "success": true,
  "device": {
    "id": 1,
    "device_id": "DEVICE_001",
    "location": "Calle Principal esquina 5ta",
    "description": "Sensor principal barrio Rojas Pinilla",
    "status": "ACTIVO",
    "battery_level": 85,
    "firmware_version": "1.0.0",
    "last_connection": "2026-04-13T14:35:00Z",
    "created_at": "2026-04-13T10:00:00Z"
  }
}
```

### Actualizar Dispositivo

```http
PUT /devices/{deviceId}

Authentication: Bearer JWT

Request Body:
{
  "location": "Nueva ubicación",
  "description": "Nueva descripción",
  "status": "ACTIVO"
}

Response (200 OK):
{
  "success": true,
  "device": {
    "id": 1,
    "device_id": "DEVICE_001",
    "location": "Nueva ubicación",
    "status": "ACTIVO",
    "updated_at": "2026-04-13T15:00:00Z"
  }
}
```

### Eliminar Dispositivo

```http
DELETE /devices/{deviceId}

Authentication: Bearer JWT (Admin solo)

Response (200 OK):
{
  "success": true,
  "message": "Device deleted successfully"
}
```

---

## ENDPOINTS - Configuración

### Obtener Configuración

```http
GET /config?deviceId=DEVICE_001

Authentication: Bearer JWT

Response (200 OK):
{
  "success": true,
  "config": {
    "TANK_HEIGHT": 100,
    "NORMAL_LEVEL": 30,
    "ALERT_LEVEL": 60,
    "SAMPLE_FREQUENCY": 100,
    "SEND_INTERVAL": 300,
    "ALARM_DURATION": 30
  }
}
```

### Actualizar Configuración

```http
PUT /config

Authentication: Bearer JWT (Admin/Operador)

Request Body:
{
  "deviceId": "DEVICE_001",
  "NORMAL_LEVEL": 35,
  "ALERT_LEVEL": 65
}

Response (200 OK):
{
  "success": true,
  "message": "Configuration updated",
  "config": {
    "TANK_HEIGHT": 100,
    "NORMAL_LEVEL": 35,
    "ALERT_LEVEL": 65,
    "SAMPLE_FREQUENCY": 100,
    "SEND_INTERVAL": 300
  }
}
```

---

## ENDPOINTS - Usuarios (Admin)

### Crear Usuario

```http
POST /users

Authentication: Bearer JWT (Admin only)

Request Body:
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "full_name": "Nuevo Usuario",
  "role": "OPERADOR"
}

Response (201 Created):
{
  "success": true,
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "full_name": "Nuevo Usuario",
    "role": "OPERADOR",
    "active": true
  }
}
```

### Listar Usuarios

```http
GET /users

Authentication: Bearer JWT (Admin only)

Response (200 OK):
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "admin@example.com",
      "full_name": "Administrator",
      "role": "ADMIN",
      "active": true,
      "last_login": "2026-04-13T14:00:00Z"
    }
  ]
}
```

---

## ENDPOINTS - Análisis

### Obtener Estadísticas

```http
GET /analytics/stats?deviceId=DEVICE_001&period=7d

Authentication: Bearer JWT

Query Parameters:
- deviceId: (required)
- period: 24h, 7d, 30d (default: 30d)

Response (200 OK):
{
  "success": true,
  "stats": {
    "total_readings": 2016,
    "total_alerts": 12,
    "average_level": 42.5,
    "max_level": 85.3,
    "min_level": 12.1,
    "danger_time_hours": 2.5,
    "uptime_percentage": 99.8
  }
}
```

---

## Códigos de Error

| Código | Descripción | Causa |
|--------|-------------|-------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | Autenticación requerida |
| 403 | Forbidden | Permisos insuficientes |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Device ID duplicado |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Server Error | Error interno |

---

## Rate Limiting

```
- 100 requests/minuto por IP
- 1000 requests/minuto por usuario autenticado
- Headers de respuesta incluyen:
  - X-RateLimit-Limit: 100
  - X-RateLimit-Remaining: 95
  - X-RateLimit-Reset: 1681404600
```

---

## Ejemplos de Cliente

### Python

```python
import requests
import json

API_URL = "http://localhost:3000/api"
TOKEN = "your_jwt_token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Obtener última medición
response = requests.get(
    f"{API_URL}/measurements/latest",
    params={"deviceId": "DEVICE_001"},
    headers=headers
)
print(response.json())
```

### JavaScript

```javascript
const API_URL = "http://localhost:3000/api";
const TOKEN = "your_jwt_token";

async function getLatestMeasurement() {
  const response = await fetch(
    `${API_URL}/measurements/latest?deviceId=DEVICE_001`,
    {
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
  return await response.json();
}
```

### cURL

```bash
curl -X GET "http://localhost:3000/api/measurements/latest?deviceId=DEVICE_001" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json"
```

---

**Última actualización**: 13 de Abril de 2026
**Versión API**: 1.0.0
