# 🚀 INSTALLATION & RUNNING GUIDE

## Sistema IoT de Alerta Temprana por Inundaciones

### ⚡ Quick Start (5 minutos)

#### 1. Clonar/Descargar proyecto
```bash
cd "PROYECTO JORGE"
```

#### 2. Instalar dependencias
**Windows:**
```cmd
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**O manualmente:**
```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

#### 3. Configurar Base de Datos

**Local con MySQL/MariaDB:**
```bash
mysql -u root -p -e "CREATE DATABASE iot_inundaciones;"
mysql -u root -p iot_inundaciones < database/init.sql
```

**Nube con Railway:**
Simplemente obtén tu `MYSQL_URL` del panel de Railway, no necesitas crearla manualmente.

#### 4. Configurar Backend
```bash
cd backend

# Copiar archivo de configuración
cp .env.example .env

# Editar .env e incluir variable de Railway (si se usa):
# MYSQL_URL="mysql://usuario:password@viaduct.proxy.rlwy.net:port/bd"
# O usa las credenciales locales:
# DB_HOST, DB_USER, DB_PASSWORD
# - JWT_SECRET
# - API_KEY
```

#### 5. Iniciar Servidor Backend
```bash
# En una terminal
cd backend
npm run dev

# Verás:
# ✓ Servidor corriendo en: http://localhost:3000
# 📚 API Base: http://localhost:3000/api
```

#### 6. Iniciar Frontend
```bash
# En otra terminal
cd frontend
npm start

# Se abrirá automáticamente: http://localhost:3000
```

#### 7. Acceder al Dashboard

```
URL: http://localhost:3000
Email: admin@iot-inundaciones.local
Password: admin123
```

---

## 📚 Stack Utilizado

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| **Backend** | Node.js + Express | 16+ / 4.18 |
| **Frontend** | React + Zustand | 18.2 / 4.3 |
| **BD** | MySQL (Optimizado para Railway) | 8+ |
| **Auth** | JWT (jsonwebtoken) | 9.0 |
| **Gráficos** | Recharts | 2.7 |
| **HTTP Client** | Axios | 1.4 |

---

## 🔌 Endpoints API (Funcionales)

```bash
# AUTH
POST   /api/auth/login                  # Login usuario
POST   /api/auth/register               # Registrar usuario

# MEASUREMENTS
POST   /api/measurements                # Enviar medición (ESP32)
GET    /api/measurements/latest?deviceId=DEVICE_001
GET    /api/measurements?deviceId=DEVICE_001&limit=100

# ALERTS
GET    /api/alerts                      # Alertas activas
GET    /api/alerts/history?deviceId=...
POST   /api/alerts/trigger-alarm        # Activar alarma manual

# DEVICES
GET    /api/devices                     # Listar dispositivos
POST   /api/devices                     # Registrar dispositivo
GET    /api/devices/{deviceId}
PUT    /api/devices/{deviceId}
DELETE /api/devices/{deviceId}

# CONFIG
GET    /api/config?deviceId=...         # Obtener configuración
PUT    /api/config                      # Actualizar configuración

# USERS (Admin)
GET    /api/users                       # Listar usuarios
POST   /api/users                       # Crear usuario

# ANALYTICS
GET    /api/analytics/stats?deviceId=...&period=30d
```

---

## 🧪 Probar API

### Con cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iot-inundaciones.local","password":"admin123"}'

# Obtener token de ejemplo
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Obtener dispositivos
curl -X GET http://localhost:3000/api/devices \
  -H "Authorization: Bearer $TOKEN"
```

### Con Postman
1. Importar archivo `POSTMAN_COLLECTION.json` (crear manualmente o usar generado)
2. Configurar variables de entorno
3. Ejecutar requests

### Con Python
```python
import requests

API_URL = "http://localhost:3000/api"

# Login
response = requests.post(f"{API_URL}/auth/login", json={
    "email": "admin@iot-inundaciones.local",
    "password": "admin123"
})

token = response.json()["token"]

# Obtener dispositivos
headers = {"Authorization": f"Bearer {token}"}
devices = requests.get(f"{API_URL}/devices", headers=headers)
print(devices.json())
```

---

## 🌐 Frontend Features

✅ **Dashboard Principal**
- Estado actual del sistema
- Nivel de agua en tiempo real
- Indicador de estado (NORMAL/ALERTA/PELIGRO)
- Gráficos de últimas mediciones

✅ **Gestión de Dispositivos**
- Listar dispositivos
- Crear dispositivo
- Actualizar configuración
- Ver estadísticas

✅ **Alertas**
- Alertas activas en tiempo real
- Historial de alertas
- Activar alarma manual
- Notificaciones

✅ **Autenticación**
- Login seguro con JWT
- Logout
- Persistencia de sesión

---

## 📋 Variables de Entorno

### Backend (.env)
```bash
NODE_ENV=development
PORT=3000
# Para desarrollo local
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=iot_inundaciones
# Si usas Railway en Nube:
# MYSQL_URL=mysql://root:xxxxxxxx@viaduct.proxy.rlwy.net:3306/railway
JWT_SECRET=tu_secreto_aqui
API_KEY=sk_live_esp32_api_key
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:3000/api
```

---

## 🔄 Flujo de Datos en Acción

```
ESP32 (Sensor):
  ├─ Lee sensor ultrasónico cada 100ms
  ├─ POST a /api/measurements cada 5 min
  └─ Incluye: distance, temperature, battery

Backend (Node.js):
  ├─ Recibe medición
  ├─ Valida y almacena en BD
  ├─ Genera alerta si aplica
  ├─ Emite WebSocket a frontend
  └─ Guarda eventos en logs

Frontend (React):
  ├─ Escucha cambios en estado
  ├─ Actualiza gráficos
  ├─ Muestra alertas
  └─ Permite control remoto

Usuario:
  ├─ Ve dashboard actualizado
  ├─ Puede activar alarma
  ├─ Visualiza historial
  └─ Configura umbrales
```

---

## 🛠️ Troubleshooting

### Backend no inicia
```bash
# Verificar puerto 3000
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Cambiar puerto
PORT=3001 npm run dev
```

### BD no conecta
```bash
# Verificar conexión MySQL
mysql -u root -p -h localhost

# Ver logs en Railway (si despliegas en nube)
railway logs
```

### Frontend no conecta con API
- Verificar que REACT_APP_API_URL sea correcto
- CORS habilitado en backend
- Token válido en localStorage

---

## 📊 Base de Datos

**Tablas principales:**
- users (4 registros)
- devices (0+)
- readings (millones)
- alerts (0+)
- notifications
- configurations
- event_logs

**Credenciales por defecto:**
- Email: admin@iot-inundaciones.local
- Password: admin123

---

## 🚀 Despliegue a Producción

### Base de Datos y Backend (Railway)
Railway permite desplegar MySQL y Node.js en unos clics:
1. Crear un proyecto y agregar la base de datos MySQL.
2. Hacer push del repositorio. Railway detectará Node.js.
3. Vincular las variables de entorno, en especial `MYSQL_URL` que Railway proveé automáticamente en la pestaña *Variables*.
```bash
railway up
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Subir carpeta build a Vercel/Netlify
```

---

## 📝 Notas Importantes

1. **Base de datos**: Instalar MySQL antes de correr
2. **Puertos**: Backend 3000, Frontend 3000 (luego 3001)
3. **CORS**: Configurado para localhost, cambiar en producción
4. **JWT**: Cambiar SECRET en producción
5. **API KEY**: Usar para ESP32, cambiar en producción

---

**¡Sistema completamente funcional y listo para usar!** 🎉

*Última actualización: 13 de Abril de 2026*
*Versión: 1.0.0 - Completamente Funcional*
