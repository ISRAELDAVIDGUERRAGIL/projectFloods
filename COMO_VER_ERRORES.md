# 🔍 CÓMO VER ERRORES EN TU PROYECTO

Esta guía te muestra dónde y cómo ver todos los errores del sistema.

---

## 🖥️ **VERIFICAR ERRORES EN BACKEND**

### 1. Consola de Backend (Terminal)
Cuando corres el backend:
```bash
cd backend
npm run dev
```

Verás logs de errores así:

```
❌ [2026-04-13 14:52:30] ERROR: Error occurred
┌─ method: POST
├─ path: /api/devices
├─ status: 400
├─ error: Validation failed
└─ details: [field: "location", message: "Location is required"]

Timestamp: 14:52:30.123
```

### 2. Comandos para Ver Logs

**En Windows (PowerShell):**
```bash
# Filtrar solo errores
Get-Content .\logs\error.log | Select-String "ERROR"

# Ver últimas líneas
Get-Content .\logs\error.log -Tail 50
```

**En Linux/Mac:**
```bash
# Filtrar solo errores
tail -f logs/error.log | grep ERROR

# Ver últimas 50 líneas
tail -50 logs/error.log

# En tiempo real
tail -f logs/error.log
```

### 3. Archivo de Logs del Backend
Ubicación:
```
backend/logs/error.log          ← Errores
backend/logs/combined.log       ← Todos los logs
```

---

## 🌐 **VERIFICAR ERRORES EN FRONTEND - Browser Console**

### 1. Abrir Developer Tools
En cualquier navegador:
- **Chrome/Edge**: `F12` o `Ctrl+Shift+I`
- **Firefox**: `F12`
- **Safari**: `Cmd+Option+I`

### 2. Ir a la Pestaña "Console"
Verás errores así:

```javascript
❌ Error: Error de conexión con el servidor
   at ErrorHandler.analyze (errorHandler.js:45)
   at setupErrorInterceptor (errorHandler.js:120)

// Detalles:
{
  type: "NETWORK_ERROR",
  status: 0,
  message: "Error de conexión con el servidor",
  friendlyMessage: "No hay conexión con el servidor..."
}
```

### 3. Mostrar Notificaciones (Toast)
Las notificaciones aparecen en la esquina superior derecha del navegador.

**Notificaciones disponibles:**
- 🟢 Verde (Éxito)
- 🔴 Rojo (Error)
- 🟡 Amarillo (Advertencia)
- 🔵 Azul (Información)

---

## 📊 **VERIFICAR ERRORES EN API**

### 1. Usar Postman o cURL

**Test de Login con Error:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'

# Respuesta (Error):
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "password",
      "message": "Password is required"
    }
  ]
}
```

**Test de Creación de Dispositivo:**
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"location":""}'

# Respuesta (Error):
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "location",
      "message": "Location is required"
    }
  ]
}
```

---

## 🧪 **TABLA DE CÓDIGOS HTTP Y SIGNIFICADO**

| Código | Significado | Qué hacer |
|--------|-------------|-----------|
| **200** | ✅ OK - Éxito | Todo bien |
| **201** | ✅ Creado - Recurso nuevo | Fue creado |
| **400** | ❌ Bad Request - Error validación | Revisa los datos |
| **401** | ❌ No autorizado - Token inválido | Inicia sesión de nuevo |
| **403** | ❌ Prohibido - Sin permisos | No tienes acceso |
| **404** | ❌ No encontrado - Recurso no existe | Verifica el ID |
| **409** | ❌ Conflicto - Ya existe | Usa otro nombre |
| **500** | ❌ Error servidor | Reinicia el backend |
| **503** | ❌ No disponible - BD caída | Verifica la BD |

---

## 🆘 **ERRORES COMUNES Y SOLUCIONES**

### Error: "Cannot GET /api/devices"
```
❌ El endpoint no existe
Solución: Verifica que la ruta esté bien escrita
         Asegúrate que el backend está corriendo
```

### Error: "Validation failed"
```
❌ Los datos no son válidos
Solución: Lee los detalles del error
         Verifica los tipos de datos (string, number, etc)
         Cumple con los rangos (email, longitud, etc)
```

### Error: "Unauthorized"
```
❌ Falta token o está inválido
Solución: Inicia sesión primero
         Verifica que el token no haya expirado
         Incluye el header Authorization
```

### Error: "Not Found"
```
❌ El recurso (usuario, dispositivo, etc) no existe
Solución: Verifica el ID
         Asegúrate que fue creado
         Consulta la base de datos
```

### Error: "Network Error"
```
❌ No hay conexión con el servidor
Solución: Verifica que el backend esté corriendo
         Puerto 3000 disponible
         Firewall no bloquee
         CORS bien configurado
```

---

## 📝 **EJEMPLOS DE RESPUESTAS**

### ✅ Respuesta Exitosa
```json
{
  "success": true,
  "message": "Device created successfully",
  "data": {
    "id": 1,
    "device_id": "DEV-001",
    "location": "Barrio Rojas"
  },
  "timestamp": "2026-04-13T14:52:00Z"
}
```

### ❌ Respuesta de Error
```json
{
  "success": false,
  "error": "Validation failed",
  "errorType": "ValidationError",
  "details": [
    {
      "field": "location",
      "message": "Location is required",
      "value": null
    }
  ],
  "timestamp": "2026-04-13T14:52:00Z"
}
```

### ❌ Error de Autenticación
```json
{
  "success": false,
  "error": "Invalid credentials",
  "errorType": "AuthenticationError",
  "timestamp": "2026-04-13T14:52:00Z"
}
```

### ❌ Error de Servidor
```json
{
  "success": false,
  "error": "Service Unavailable - Database connection error",
  "errorType": "DatabaseError",
  "statusCode": 503,
  "timestamp": "2026-04-13T14:52:00Z"
}
```

---

## 🔧 **DEBUGGING AVANZADO**

### 1. Habilitar Modo Desarrollo
```bash
# En backend
set NODE_ENV=development      # Windows
export NODE_ENV=development   # Linux/Mac

npm run dev
```

En modo desarrollo verás:
- Stack traces completos
- Detalles de errores
- Headers de request

### 2. Ver Órdenes SQL en Consola
Backend mostrará queries ejecutadas:
```
SELECT * FROM devices WHERE id = $1
UPDATE users SET last_login = NOW() WHERE id = $1
```

### 3. Tiempo de Respuesta
```
[14:52:30.123] POST /api/devices - 201 (245ms)
              ↑           ↑        ↑   ↑
              hora       ruta   código tiempo
```

---

## 📱 **VERIFICAR ERRORES EN DISPOSITIVOS (ESP32)**

### Ver Serial Monitor
```
[14:52:30] WiFi conectado a: "MyNetwork"
[14:52:31] IP: 192.168.1.100
[14:52:32] ➡️ POST /api/measurements HTTP/1.1
[14:52:33] Water Level: 125.5 cm
[14:52:34] ✅ Response: 201 Created
```

### Errores comunes:
```
❌ WiFi connection failed
   → Verifica SSID y password

❌ Connection refused
   → Backend no está corriendo

❌ Timeout
   → Revisa la conexión WiFi

❌ Invalid JSON
   → Verifica formato de datos
```

---

## ✅ **VERIFICACIÓN RÁPIDA**

Para verificar que TODO está bien:

### 1. Backend corriendo
```bash
curl http://localhost:3000/health
# Respuesta: {"status":"OK","timestamp":"...","uptime":...}
```

### 2. BD conectada
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/devices
# Respuesta: {"success":true,"data":[...]}
```

### 3. Frontend cargando
```
Abre http://localhost:3000
Verifica que no haya errores en Console (F12)
```

### 4. Notificaciones funcionando
```
Intenta login con datos inválidos
Debe aparecer toast rojo con error
```

---

## 📊 **CHECKLIST DE VALIDACIONES**

Para verificar que TODO está configurado:

```
Backend:
☑ ✅ validators.js en middleware/
☑ ✅ errorHandler.js en middleware/
☑ ✅ sanitizer.js en middleware/
☑ ✅ responseHandler.js en middleware/

Frontend:
☑ ✅ errorHandler.js en services/
☑ ✅ Toast.jsx en components/
☑ ✅ Toast.css en components/
☑ ✅ notificationStore.js en store/

Database:
☑ ✅ Tablas creadas
☑ ✅ Índices configurados
☑ ✅ Usuarios por defecto insertados
```

---

**Si ves un error, busca aquí y encontrarás la solución. 🎯**
