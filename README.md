# Sistema IoT de Alerta Temprana por Inundaciones
## Barrio Rojas Pinilla - Riohacha, La Guajira

### 📋 Descripción General

Sistema inteligente de monitoreo y alerta temprana para prevención de inundaciones mediante sensores ultrasónicos, conectividad IoT y dashboard web en tiempo real.

### 🎯 Objetivo

Detectar el aumento del nivel del agua ocasionado por lluvias intensas en el barrio Rojas Pinilla y proporcionar alertas en tiempo real a través de una plataforma conectada a internet.

---

## 📊 Datos Generados por el Sistema

El dispositivo, basado en un **sensor ultrasónico**, genera y procesa los siguientes datos:

| Indicador | Descripción | Rango |
|-----------|-------------|-------|
| **Nivel del Agua** | Distancia medida entre sensor y superficie del agua | 0 cm - 100 cm |
| **Estado de Alerta** | Clasificación de riesgo del sistema | NORMAL, ALERTA, PELIGRO |
| **Timestamp** | Fecha y hora de la medición | Datetime |
| **Tendencia** | Velocidad de cambio del nivel | Cm/minuto |
| **Histórico** | Registro temporal de mediciones | Base de datos |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SENSOR ULTRASÓNICO                               │
│          (Mide distancia/nivel del agua)                            │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│          MICROCONTROLADOR ESP32                                      │
│  • Procesa datos del sensor                                         │
│  • Determina estado (NORMAL/ALERTA/PELIGRO)                        │
│  • Conecta a WiFi                                                   │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     ▼ (HTTP / MQTT)
┌─────────────────────────────────────────────────────────────────────┐
│              SERVIDOR EN LÍNEA                                       │
│  • Recibe datos del ESP32                                           │
│  • Almacena en base de datos                                        │
│  • Ejecuta lógica de alertas                                        │
└────────────────────┬────────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
   ┌─────────────┐         ┌──────────────┐
   │ BASE DE DATOS        │ API REST     │
   │ (MySQL / Railway)    │ (Node.js)    │
   └─────────────┘        └──────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│              DASHBOARD WEB                                           │
│  • Visualización en tiempo real                                     │
│  • Gráficos históricos                                              │
│  • Control remoto (activar alarma, etc.)                            │
│  • Indicadores de riesgo                                            │
└─────────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴────────────────┐
                ▼                                ▼
         ┌──────────────┐            ┌─────────────────┐
         │ CELULAR      │            │ COMPUTADOR      │
         │ (Navegador)  │            │ (Navegador)     │
         └──────────────┘            └─────────────────┘
```

---

## ⚡ Flujo Completo del Sistema

1. **Captura de Datos**: Sensor ultrasónico mide distancia → nivel del agua
2. **Procesamiento**: ESP32 calcula estado (NORMAL/ALERTA/PELIGRO)
3. **Transmisión**: ESP32 envía datos a servidor vía WiFi (HTTP/MQTT)
4. **Almacenamiento**: Servidor recibe datos y guarda en BD
5. **Visualización**: Dashboard web muestra datos en tiempo real
6. **Análisis**: Usuario visualiza gráficos, tendencias e histórico
7. **Control Remoto**: Usuario puede activar alarma o dispositivo de respuesta
8. **Ciclo Completo**: Sistema monitorea continuamente

---

## 🛠️ Stack Tecnológico

### Hardware
- **Sensor**: Ultrasónico HC-SR04
- **Microcontrolador**: ESP32 (WiFi integrado)
- **Alimentación**: Batería recargable

### Backend
- **Servidor**: Node.js / Express.js
- **Base de Datos**: MySQL (Despliegue en Railway)
- **Protocolo**: HTTP REST / MQTT
- **Autenticación**: JWT

### Frontend
- **Framework**: React.js
- **Visualización**: Chart.js / D3.js
- **Diseño base**: Figma (a implementar)
- **Responsive**: Mobile-first

### DevOps
- **Hosting**: AWS / Google Cloud / Heroku (a definir)
- **Contenedores**: Docker
- **Versionado**: Git

---

## 📁 Estructura del Proyecto

```
PROYECTO JORGE/
├── docs/                          # Documentación
│   ├── ARQUITECTURA.md           # Detalles técnicos
│   ├── ESPECIFICACIONES.md       # Requerimientos
│   ├── API.md                    # Documentación API
│   └── DIAGRAMA_BASE_DATOS.md    # Esquema BD
├── frontend/                      # Dashboard web
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
├── backend/                       # Servidor Node.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   ├── package.json
│   └── README.md
├── firmware/                      # Código ESP32
│   ├── main.ino
│   ├── config.h
│   ├── sensor.h
│   └── README.md
├── database/                      # Scripts BD
│   ├── init.sql
│   ├── schema.sql
│   └── migrations/
└── README.md (este archivo)
```

---

## 🚀 Guía Rápida de Inicio

### Requisitos Previos
- Node.js v16+
- MySQL 8.0+ (Opcional si usas Railway en la nube)
- Arduino IDE (para ESP32)
- Git

### Instalación Backend
```bash
cd backend
npm install
npm run dev
```

### Instalación Frontend
```bash
cd frontend
npm install
npm start
```

---

## 📝 Estados del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│ ESTADO NORMAL                                                    │
│ • Nivel: 0-30 cm                                                │
│ • Color: Verde                                                  │
│ • Alerta: Desactivada                                           │
│ • Acción: Monitoreo continuo                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ESTADO ALERTA                                                    │
│ • Nivel: 30-60 cm                                               │
│ • Color: Amarillo                                               │
│ • Alerta: Notificación enviada                                  │
│ • Acción: Usuario debe estar atento                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ESTADO PELIGRO                                                   │
│ • Nivel: > 60 cm                                                │
│ • Color: Rojo                                                   │
│ • Alerta: Alarma activa                                         │
│ • Acción: Activar medidas de emergencia                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👥 Equipo y Contacto

**Proyecto**: Barrio Rojas Pinilla - Riohacha, La Guajira
**Año**: 2026

---

## 📚 Documentación Adicional

Para información más detallada, consulta:
- [ARQUITECTURA.md](docs/ARQUITECTURA.md) - Detalles técnicos del sistema
- [ESPECIFICACIONES.md](docs/ESPECIFICACIONES.md) - Requerimientos funcionales
- [API.md](docs/API.md) - Endpoints disponibles
- [DIAGRAMA_BASE_DATOS.md](docs/DIAGRAMA_BASE_DATOS.md) - Esquema de datos

---

**Última actualización**: 13 de Abril de 2026
