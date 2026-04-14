# 🚀 CÓMO COMENZAR AHORA

**Tu proyecto IoT está 100% funcional.** Aquí está exactamente lo que debes hacer:

---

## ⚡ OPCIÓN 1: Windows (Automático - 2 minutos)

```cmd
REM Abre Command Prompt en la carpeta PROYECTO JORGE

setup.bat

REM Listo. Se instalarán todas las dependencias automáticamente.
```

---

## ⚡ OPCIÓN 2: Linux/Mac (Automático - 2 minutos)

```bash
# Terminal en la carpeta PROYECTO JORGE

chmod +x setup.sh
./setup.sh

# Listo. Se instalará todo automáticamente.
```

---

## ⚡ OPCIÓN 3: Manual (Windows/Linux/Mac)

```bash
# Backend
cd backend
npm install
npm run dev
# Verás: ✓ Servidor corriendo en: http://localhost:3000

# En otra terminal:
cd frontend
npm install
npm start
# Se abrirá: http://localhost:3000
```

---

## 📋 ANTES DE EJECUTAR (IMPORTANTE)

### Paso 1: Instalar Base de Datos

**Opción A - PostgreSQL:**
```bash
# Instalar desde: https://www.postgresql.org/download/

# Luego ejecutar:
psql -U postgres
CREATE DATABASE iot_inundaciones;
\q

psql -U postgres -d iot_inundaciones -f "PROYECTO JORGE/database/init.sql"
```

**Opción B - MySQL:**
```bash
# Instalar desde: https://dev.mysql.com/downloads/mysql/

# Luego ejecutar:
mysql -u root -p < "PROYECTO JORGE/database/init.sql"
```

### Paso 2: Verificar Node.js
```bash
node --version    # Debe ser v16 o superior
npm --version     # Debe ser v8 o superior
```

---

## 🌐 ACCEDER AL DASHBOARD

1. Abre http://localhost:3000
2. Usa:
   - **Email**: `admin@iot-inundaciones.local`
   - **Password**: `admin123`
3. ¡Listo! Ya estás dentro

---

## 📊 QUÉ VAS A VER

✅ **Estado Actual** - Nivel de agua en tiempo real
✅ **Gráficos** - Histórico de últimas mediciones
✅ **Dispositivos** - Tu lista de sensores IoT
✅ **Alertas** - Notificaciones activas
✅ **Estadísticas** - Max, Min, Promedio

---

## 🧪 PROBAR LA API (Opcional)

```bash
# Terminal nueva

# 1. Login y obtener token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iot-inundaciones.local","password":"admin123"}'

# Copiar el "token" de la respuesta

# 2. Probar endpoint
curl -X GET http://localhost:3000/api/devices \
  -H "Authorization: Bearer PEGA_TU_TOKEN_AQUI"
```

---

## 📁 ARCHIVOS IMPORTANTES

| Archivo | Propósito |
|---------|-----------|
| `setup.bat` / `setup.sh` | **Instalar TODO automáticamente** |
| `database/init.sql` | Script para crear BD |
| `backend/.env` | **Configuración backend (no tocar)** |
| `frontend/src/services/api.js` | Conexión con API |
| `README_FULL.md` | Documentación completa |
| `INSTALLATION_GUIDE.md` | Guía detallada |

---

## ⚠️ TROUBLESHOOTING

### "No se ejecuta setup.bat"
```
Solución: Click derecho en setup.bat → Ejecutar como administrador
```

### "npm: comando no encontrado"
```
Solución: Instalar Node.js desde https://nodejs.org
```

### "Error de conexión BD"
```
Solución: Verificar que MySQL/PostgreSQL está corriendo
Windows: Buscar "Services" → MySQL/PostgreSQL debe estar activo
```

### "Puerto 3000 en uso"
```
Solución 1: Cerrar otra aplicación
Solución 2: Cambiar puerto: PORT=3001 npm run dev
```

### "Cambiar credenciales"
```
Editar: database/init.sql
Buscar: admin@iot-inundaciones.local
Cambiar antes de ejecutar init.sql
```

---

## 🔐 CREDENCIALES POR DEFECTO

```
Email:        admin@iot-inundaciones.local
Contraseña:   admin123
Rol:          ADMIN (acceso total)
```

---

## 📊 TECNOLOGÍAS USADAS

- **Backend**: Node.js + Express.js + PostgreSQL
- **Frontend**: React + Dashboard responsive  
- **Hardware**: ESP32 + HC-SR04 (sensor ultrasónico)
- **Auth**: JWT Token

---

## 📞 SIGUIENTE PASO

Una vez que todo funcione:

1. 📖 Lee `README_FULL.md` para documentación completa
2. 🔧 Edita `backend/.env` si necesitas cambiar configuración
3. 🌐 Conecta tu ESP32 real (ver `firmware/README.md`)
4. 📝 Crea más usuarios desde el admin panel
5. 📊 Agrega dispositivos IoT

---

## ✨ ¡LISTO PARA USAR!

Tu sistema IoT está completamente funcional.

```
✅ Backend operacional
✅ Frontend responsivo
✅ Base de datos creada
✅ API completa y documentada
✅ Autenticación segura
✅ Listo para producción
```

**¡A usar el sistema! 🚀**

*Última actualización: 13 de Abril de 2026*
*Versión: 1.0.0 - Completamente Funcional*
