# 🗓️ ROADMAP - Plan de Implementación

## Fase por Fase

### ✅ FASE 0: Base Fundacional (COMPLETADA)

**Duración**: 1 día | **Estado**: ✅ HECHO

- [x] Análisis de requerimientos
- [x] Diseño de arquitectura
- [x] Documentación técnica completa
- [x] Esquema de base de datos
- [x] Especificación de API REST
- [x] Estructura del proyecto
- [x] Setup inicial backend (Node.js)
- [x] Setup inicial firmware (Arduino/ESP32)
- [x] Archivos de configuración

**Entregables**:
- 6 documentos técnicos
- Estructura de carpetas lista
- Backend con rutas y middleware
- Firmware con librerías de sensor
- Setup BD con script SQL

---

### 📝 FASE 1: Backend - Controladores (2-3 semanas)

**Dependencia**: FASE 0 ✅
**Estimado**: 80-120 horas

#### Sprint 1.1: Autenticación y Usuarios (1 semana)

- [ ] Implementar completamente ruta `/auth`
  - [x] Login (esqueleto)
  - [ ] Register (test)
  - [ ] Refresh token
  - [ ] Change password
  - [ ] Password reset

- [ ] Gestión de usuarios (Admin)
  - [ ] CRUD usuarios
  - [ ] Asignar roles
  - [ ] Activar/desactivar

**Pruebas**:
- [ ] Unit tests auth
- [ ] Integration tests login/register
- [ ] JWT token validation

**Código Base**: `backend/src/routes/auth.js` ✅

---

#### Sprint 1.2: Dispositivos y Mediciones (1 semana)

- [ ] Implementar controlador de dispositivos
  - [ ] Registrar dispositivo
  - [ ] Listar dispositivos usuario
  - [ ] Actualizar dispositivo
  - [ ] Eliminar dispositivo
  - [ ] Generar API key

- [ ] Implementar controlador de mediciones
  - [ ] Recibir medición (POST)
  - [ ] Guardar en BD
  - [ ] Clasificar estado
  - [ ] Generar alerta si aplica
  - [ ] Obtener última medición
  - [ ] Historial con filtros

**Servicios**:
- [ ] MeasurementService
- [ ] AlertService
- [ ] DeviceService

**Código Base**: 
- `backend/src/routes/measurements.js` ✅
- `backend/src/routes/devices.js` ✅

---

#### Sprint 1.3: Alertas y Notificaciones (1 semana)

- [ ] Implementar sistema de alertas automáticas
  - [ ] Generar alerta en cambio estado
  - [ ] Enviar notificaciones
  - [ ] Deduplicar alertas activas
  - [ ] Resolver alertas

- [ ] Notificaciones
  - [ ] Email (SMTP)
  - [ ] SMS (Twilio - opcional)
  - [ ] Push notifications
  - [ ] In-app notifications

- [ ] API alertas
  - [ ] GET alertas activas
  - [ ] POST trigger alarma manual
  - [ ] GET historial alertas
  - [ ] POST resolver alerta

**Integraciones**:
- [ ] SMTP para email
- [ ] Twilio para SMS

**Código Base**: `backend/src/routes/alerts.js` ✅

---

### 🎨 FASE 2: Frontend - Dashboard (2-3 semanas)

**Dependencia**: FASE 1 (Backend APIs)
**Estimado**: 100-150 horas

#### Sprint 2.1: Estructura y Setup (3 días)

- [ ] Crear proyecto React
- [ ] Instalar dependencias (React Router, Axios, Chart.js)
- [ ] Estructura de carpetas
  - [ ] `/components` - Componentes reutilizables
  - [ ] `/pages` - Páginas principales
  - [ ] `/services` - API client
  - [ ] `/context` - State management
  - [ ] `/hooks` - Custom hooks
  - [ ] `/styles` - CSS/Tailwind

- [ ] Setup routing
  - [ ] Login page
  - [ ] Dashboard layout
  - [ ] Protected routes
  - [ ] 404 page

**Código Base**: `frontend/README.md` ✅

---

#### Sprint 2.2: Componentes Base (1 semana)

- [ ] Componentes de UI
  - [ ] Navbar with user menu
  - [ ] Sidebar navigation
  - [ ] Cards/Widgets
  - [ ] Loading indicators
  - [ ] Error messages
  - [ ] Modals/Dialogs

- [ ] Componentes de datos
  - [ ] Lectura actual (grande)
  - [ ] Mini gráfico línea
  - [ ] Estado indicator (color)
  - [ ] Tabla alertas
  - [ ] Timeline eventos

**Librerías**:
- [ ] Tailwind CSS + headlessui
- [ ] React Icons
- [ ] Recharts para gráficos

---

#### Sprint 2.3: Páginas Principales (1 semana)

- [ ] Dashboard principal
  - [ ] Layout responsivo
  - [ ] Widgets estado actual
  - [ ] Gráfico últimas 24h
  - [ ] Tabla alertas recientes
  - [ ] KPIs

- [ ] Página Historial
  - [ ] Selector de rango fechas
  - [ ] Gráfico interactivo (zoom, pan)
  - [ ] Estadísticas
  - [ ] Export a CSV

- [ ] Página Alertas
  - [ ] Filtros (tipo, rango fecha, estado)
  - [ ] Tabla completa
  - [ ] Resolución manual

- [ ] Página Control
  - [ ] Botón activar alarma (con confirmación)
  - [ ] Estado alarma actual
  - [ ] Historial activaciones

---

#### Sprint 2.4: Integraciones y Testing (3 días)

- [ ] Conectar a API backend
  - [ ] API client (axios)
  - [ ] Autenticación JWT
  - [ ] Manejo de errores

- [ ] WebSocket (tiempo real)
  - [ ] Conexión
  - [ ] Listeners de alertas
  - [ ] Auto-refresh datos

- [ ] Testing
  - [ ] Unit tests componentes
  - [ ] Integration tests
  - [ ] E2E tests

---

### ⚙️ FASE 3: Firmware ESP32 (1-2 semanas)

**Dependencia**: FASE 1 (Backend API)
**Estimado**: 40-60 horas

#### Sprint 3.1: Sensor y Lectura (3 días)

- [x] Librería sensor ultrasónico (código base ✅)
- [ ] Testing sensor
  - [ ] Validar lecturas
  - [ ] Calibración
  - [ ] Manejo de errores

- [ ] Medición de batería
  - [ ] Leer ADC
  - [ ] Calcular voltaje
  - [ ] Porcentaje de carga

- [ ] Temperatura interna
  - [ ] Leer sensor interno

**Código Base**: 
- `firmware/sensor.h` ✅
- `firmware/main.ino` ✅

---

#### Sprint 3.2: WiFi y HTTP (3 días)

- [ ] Conexión WiFi
  - [ ] SSID/Password configurable
  - [ ] Auto-reconexión
  - [ ] State management

- [ ] HTTP Client
  - [ ] POST a servidor
  - [ ] Manejo de timeouts
  - [ ] Reintentos fallidos
  - [ ] Sincronización horaria (NTP)

- [ ] API Key
  - [ ] Almacenamiento seguro
  - [ ] Renovación tokens

---

#### Sprint 3.3: Testing y Optimización (3 días)

- [ ] Testing hardware
  - [ ] Sensor funciona correctamente
  - [ ] WiFi conecta
  - [ ] Datos se envían al servidor
  - [ ] Consumo de energía

- [ ] Optimización
  - [ ] Power management
  - [ ] Sleep modes
  - [ ] Batería vida útil

- [ ] OTA Updates
  - [ ] Actualización firmware remoto

**Código Base**: 
- `firmware/config.h` ✅
- `firmware/main.ino` ✅

---

### 🧪 FASE 4: Integración y Testing (1-2 semanas)

**Dependencia**: FASE 1, 2, 3
**Estimado**: 60-80 horas

#### Sprint 4.1: End-to-End Testing (1 semana)

- [ ] Flujo completo sistema
  - [ ] ESP32 mide → envía → BD → Dashboard
  - [ ] Alertas se generan
  - [ ] Notificaciones se envían
  - [ ] Control remoto funciona

- [ ] Testing bajo carga
  - [ ] Múltiples dispositivos
  - [ ] Muchas mediciones/segundo
  - [ ] Escalabilidad

- [ ] Testing de anomalías
  - [ ] Sensor falla
  - [ ] WiFi desconecta
  - [ ] Server offline
  - [ ] BD caída

---

#### Sprint 4.2: Performance y Seguridad (3-4 días)

- [ ] Optimización
  - [ ] API response times < 200ms
  - [ ] Dashboard load < 3s
  - [ ] WebSocket latency < 500ms

- [ ] Seguridad
  - [ ] OWASP top 10
  - [ ] SQL injection tests
  - [ ] XSS tests
  - [ ] CORS configuration
  - [ ] Rate limiting

- [ ] Logs y Monitoreo
  - [ ] Logs completos
  - [ ] Error tracking
  - [ ] Performance metrics

---

#### Sprint 4.3: Documentación de Usuario (3-4 días)

- [ ] Manual de usuario
  - [ ] Cómo registrarse
  - [ ] Cómo usar dashboard
  - [ ] Cómo configurar
  - [ ] FAQ

- [ ] Video tutoriales
  - [ ] Setup dispositivo
  - [ ] Primeros pasos
  - [ ] Troubleshooting

---

### 🚀 FASE 5: Despliegue (1 semana)

**Dependencia**: FASE 4
**Estimado**: 40-50 horas

#### Sprint 5.1: Infraestructura (3 días)

- [ ] Seleccionar hosting
  - [ ] AWS / Google Cloud / Heroku
  - [ ] Dominio
  - [ ] SSL/TLS

- [ ] Configurar servidores
  - [ ] Backend producción
  - [ ] Frontend CDN
  - [ ] BD remota

- [ ] CI/CD
  - [ ] GitHub Actions
  - [ ] Automated tests
  - [ ] Auto deploy

---

#### Sprint 5.2: Backup y Recuperación (2 días)

- [ ] Backup automático
  - [ ] BD backup diario
  - [ ] Código backup
  - [ ] Configuraciones

- [ ] Plan de recuperación
  - [ ] RTO < 1 hora
  - [ ] RPO < 5 minutos
  - [ ] Testing backup

---

#### Sprint 5.3: Monitoreo (2 días)

- [ ] Alertas de sistema
  - [ ] Server down
  - [ ] BD caída
  - [ ] Recursos agotados

- [ ] Dashboards
  - [ ] Uptime monitoring
  - [ ] Error rates
  - [ ] Performance

---

## 📊 Timeline

```
FASE 0 ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (✅ HECHO)
       
FASE 1 ░░░░░░░░████████████████████░░░░░░░░░░░░░░░░░ (2-3 sem)
       
FASE 2 ░░░░░░░░░░░░░░░░░░████████████████████░░░░░░ (2-3 sem)
       
FASE 3 ░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░░░░░░░░░ (1-2 sem)
       
FASE 4 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░ (1-2 sem)
       
FASE 5 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███░░ (1 sem)

Total: 8-12 semanas (2-3 meses)
```

---

## 👥 Equipo Recomendado

| Rol | Cantidad | Semanas |
|-----|----------|---------|
| Backend Developer | 1 | 3 |
| Frontend Developer | 1 | 3 |
| DevOps/Infra | 0.5 | 2 |
| QA/Testing | 0.5 | 4 |
| Project Manager | 0.5 | 12 |

**Esfuerzo total**: ~25-30 person-weeks

---

## 💰 Budget Estimado

### Desarrollo
- Backend: $15,000 - $20,000
- Frontend: $15,000 - $20,000
- Firmware: $5,000 - $8,000
- Testing: $5,000 - $8,000
- PM: $3,000 - $5,000

### Infraestructura (anual)
- Hosting: $2,000 - $5,000
- BD Cloud: $1,000 - $3,000
- Dominio + SSL: $200 - $500
- Monitoreo: $500 - $1,000

### Hardware Piloto
- ESP32: $20 × 10 = $200
- Sensores: $15 × 10 = $150
- Baterías: $10 × 10 = $100
- Cables/accesorios: $200

**Total**: $46,700 - $73,000

---

## ✅ Checklist Diario

### Antes de Iniciar Cada Sprint

- [ ] Reunión de kickoff
- [ ] Tareas asignadas
- [ ] Criterios de aceptación claros
- [ ] Dependencias identificadas

### Durante el Sprint

- [ ] Daily standups (15 min)
- [ ] Code reviews
- [ ] Tests automatizados pasan
- [ ] Documentación actualizada

### Al Finalizar Sprint

- [ ] Demo a stakeholders
- [ ] Retrospective
- [ ] Backlog actualizado
- [ ] Métricas registradas

---

## 📈 Métricas de Éxito

| Métrica | Target | Peso |
|---------|--------|------|
| Funcionalidad entregada | 100% | 40% |
| Tests coverage | > 80% | 20% |
| Performance < 200ms | 95% | 20% |
| Uptime en beta | > 99% | 10% |
| Documentación | 100% | 10% |

---

## 🎯 Hitos Principales

- ✅ **Hito 1**: Base y documentación (COMPLETADO)
- 📅 **Hito 2**: Backend MVP (2-3 sem)
- 📅 **Hito 3**: Frontend MVP (2-3 sem)
- 📅 **Hito 4**: Integración completa (1-2 sem)
- 📅 **Hito 5**: Producción (1 sem)

---

**Próximo paso**: Comenzar FASE 1 - Implementar controladores backend

*Este documento se actualiza semanalmente con el progreso real*

---

*Última actualización: 13 de Abril de 2026*
*Versión: 1.0.0 - Roadmap Inicial*
