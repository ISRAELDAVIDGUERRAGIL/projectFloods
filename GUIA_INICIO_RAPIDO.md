# GUÍA DE INICIO RÁPIDO

## 🚀 Primeros Pasos

### 1. Clonar/Descargar el Proyecto

```bash
cd PROYECTO JORGE
```

### 2. Configurar Base de Datos

```bash
# MySQL/MariaDB
mysql -u root -p < database/init.sql

# PostgreSQL
psql -U postgres -f database/init.sql
```

**Credenciales por defecto**:
- Email: `admin@iot-inundaciones.local`
- Contraseña: `admin123`

### 3. Configurar Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tus valores
npm install
npm run dev
```

El servidor estará en: `http://localhost:3000`

### 4. Configurar Frontend

```bash
cd frontend
npm install
npm start
```

Abre: `http://localhost:3000`

### 5. Configurar Firmware ESP32

1. Abre `firmware/main.ino` en Arduino IDE
2. Edita `firmware/config.h` con:
   - Tu SSID y contraseña WiFi
   - URL del servidor backend
   - API Key

3. Sube el código a tu ESP32

### 6. Verificar Operación

- Dashboard debe mostrar datos en tiempo real
- Comprueba eventos en logs
- Prueba cambiar umbrales en configuración

---

## 📊 Estructura de Carpetas

```
PROYECTO JORGE/
├── docs/                    # Documentación completa
│   ├── README.md           # Este archivo
│   ├── ARQUITECTURA.md     # Detalles técnicos
│   ├── ESPECIFICACIONES.md # Requerimientos
│   ├── API.md              # Documentación API
│   └── DIAGRAMA_BASE_DATOS.md
├── backend/                # API Node.js
├── frontend/               # Dashboard React
├── firmware/               # Código ESP32
└── database/               # Scripts SQL
```

---

## 🔗 Recursos Principales

- [Documentación Completa](README.md)
- [Arquitectura del Sistema](ARQUITECTURA.md)
- [Especificaciones Funcionales](ESPECIFICACIONES.md)
- [API REST](API.md)
- [Esquema de BD](DIAGRAMA_BASE_DATOS.md)

---

## ⚙️ Configuración

### Variables de Entorno Backend

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/iot
JWT_SECRET=tu_secreto_aqui
MQTT_BROKER=mqtt://localhost:1883
```

### Configuración Firmware ESP32

Editar `firmware/config.h`:

```cpp
#define SSID "Tu_Red_WiFi"
#define PASSWORD "Tu_Contraseña"
#define DEVICE_ID "DEVICE_001"
#define SERVER_URL "http://tu-servidor.com/api/measurements"
```

---

## 🧪 Testing

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

---

## 📱 Acceso a la Plataforma

| Componente | URL | Credenciales |
|-----------|-----|--------------|
| Dashboard | http://localhost:3000 | admin / admin123 |
| API | http://localhost:3000/api | Ver documentación |
| BD Local | localhost:5432 | Configurar en .env |

---

## 🆘 Troubleshooting

### Dashboard no carga datos
- Verificar que backend está corriendo: `npm run dev`
- Revisar conexión a BD en logs
- Comprobar que ESP32 está enviando datos

### ESP32 no conecta a WiFi
- Revisar SSID y contraseña en `config.h`
- Router debe usar 2.4GHz
- Ver logs en Serial Monitor

### Errores de base de datos
- Verificar que PostgreSQL/MySQL está corriendo
- Ejecutar script `database/init.sql`
- Comprobar credenciales en `.env`

---

## 📈 Próximos Pasos

1. ✅ Instalar y configurar el proyecto
2. ✅ Crear usuario adicional
3. ✅ Registrar dispositivo
4. ✅ Ajustar umbrales de alerta
5. ✅ Configurar notificaciones
6. ✅ Probar control remoto
7. ✅ Analizar datos históricos

---

## 📞 Soporte

Para problemas o preguntas:
- Revisar documentación en `/docs`
- Consultar código de ejemplo
- Verificar logs del servidor

---

**Última actualización**: 13 de Abril de 2026
**Versión**: 1.0.0
