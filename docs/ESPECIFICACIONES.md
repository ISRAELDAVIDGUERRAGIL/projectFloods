# 📋 Especificaciones Funcionales del Sistema

## 1. REQUERIMIENTOS FUNCIONALES

### 1.1 Medición y Captura de Datos

#### RF-001: Lectura del sensor
- **Descripción**: El sistema debe leer el sensor ultrasónico continuamente
- **Frecuencia**: 10 Hz (cada 100 ms)
- **Precisión**: ±3 mm
- **Timeout**: 5 segundos por lectura

#### RF-002: Cálculo del nivel de agua
- **Descripción**: Convertir distancia en nivel de agua
- **Fórmula**: `waterLevel = TANK_HEIGHT - distance`
- **Rango válido**: 0 - 100 cm
- **Validación**: Descartar lecturas fuera de rango

#### RF-003: Clasificación de estado
- **Descripción**: Categorizar el nivel en NORMAL/ALERTA/PELIGRO
- **Lógica**:
  - NORMAL: 0-30 cm
  - ALERTA: 30-60 cm
  - PELIGRO: >60 cm
- **Cambio de estado**: Requiere 2 mediciones confirmadas

---

### 1.2 Comunicación y Transmisión

#### RF-004: Envío de datos a servidor
- **Protocolo**: HTTP POST
- **Frecuencia**: Cada 5 minutos
- **Payload**: JSON con mediciones
- **Reintentos**: 3 intentos si falla

#### RF-005: Sincronización horaria
- **Descripción**: ESP32 debe sincronizar hora con servidor
- **Método**: NTP
- **Frecuencia**: Una vez al iniciar, luego cada 24h

#### RF-006: Conexión WiFi
- **Descripción**: Mantener conexión activa a red WiFi
- **SSID**: Configurable
- **Contraseña**: Encriptada en almacenamiento
- **Reconexión**: Automática si se desconecta

---

### 1.3 Almacenamiento de Datos

#### RF-007: Registro de mediciones
- **Tabla**: `readings`
- **Campos**: device_id, distance, water_level, state, timestamp
- **Retención**: Mínimo 1 año
- **Indexación**: Por device_id y timestamp

#### RF-008: Historial de alertas
- **Tabla**: `alerts`
- **Registro**: Cada cambio de estado
- **Información**: device_id, state, triggered_at, resolved_at

#### RF-009: Log de eventos
- **Tabla**: `event_logs`
- **Eventos**: Conexión, desconexión, cambio estado, anomalías
- **Retención**: 6 meses mínimo

---

### 1.4 Alertas y Notificaciones

#### RF-010: Generación automática de alertas
- **Estado ALERTA**: Notificación vía email + SMS + push
- **Estado PELIGRO**: Notificación urgente + alarma audible
- **Deduplicación**: No enviar si ya hay alerta activa

#### RF-011: Control remoto de alarma
- **Activación manual**: Usuario puede trigger alarma desde dashboard
- **Duración**: 30 segundos por defecto (configurable)
- **Registro**: Guardar quién, cuándo y por cuánto tiempo

#### RF-012: Historial de notificaciones
- **Tabla**: `notifications`
- **Información**: usuario_id, alert_id, mensaje, tipo, timestamp
- **Lectura**: Usuario puede marcar como leído

---

### 1.5 Visualización de Datos

#### RF-013: Dashboard en tiempo real
- **Actualización**: Cada 10 segundos vía WebSocket
- **Indicadores**: Estado actual, nivel, tendencia, última lectura
- **Responsive**: Funciona en mobile, tablet, desktop

#### RF-014: Gráficos históricos
- **Periodicidad**: 24h, 7 días, 30 días, personalizado
- **Tipo**: Línea para series temporales
- **Interactividad**: Zoom, pan, export a PNG/CSV

#### RF-015: Tabla de alertas
- **Información**: Fecha, hora, tipo, duración, usuario
- **Filtros**: Tipo de alerta, rango fechas
- **Ordenamiento**: Por fecha (más reciente primero)

---

### 1.6 Configuración y Control

#### RF-016: Configuración de umbrales
- **Parámetros**: NORMAL_LEVEL, ALERT_LEVEL, PELIGRO_LEVEL
- **Guardado**: En BD con versionado
- **Aplicación**: Automática, sin reinicio requerido

#### RF-017: Gestión de dispositivos
- **Registro**: Agregar nuevo dispositivo con device_id único
- **Información**: Ubicación, nombre, estado activo/inactivo
- **Vinculación**: Usuario debe vincular su dispositivo

#### RF-018: Control de acceso
- **Roles**: Admin, Operador, Visualizador
- **Permisos**:
  - Admin: Todo acceso
  - Operador: Leer + activar alarmas
  - Visualizador: Solo ver datos

---

## 2. REQUERIMIENTOS NO FUNCIONALES

### 2.1 Rendimiento

| Métrica | Target |
|---------|--------|
| Latencia API | < 200 ms |
| Tiempo carga frontend | < 3 seg |
| Procesamiento ESP32 | < 100 ms |
| Sincronización datos | < 5 seg |
| Eventos tiempo real | < 500 ms |

---

### 2.2 Disponibilidad

- **Uptime**: 99.5% mensual
- **RTO** (Recovery Time Objective): < 1 hora
- **RPO** (Recovery Point Objective): < 5 minutos

---

### 2.3 Seguridad

- **Autenticación**: JWT con expiración
- **Encriptación**: TLS 1.2+ en tránsito
- **Almacenamiento**: Contraseñas con bcrypt
- **CORS**: Dominios permitidos configurables
- **Rate limiting**: 100 req/minuto por IP

---

### 2.4 Escalabilidad

- **Usuarios concurrentes**: Mínimo 1000
- **Dispositivos**: 1000+ por servidor
- **Lecturas/segundo**: 10,000+
- **Historial**: Particionamiento por fecha

---

### 2.5 Mantenibilidad

- **Código**: Comentarios en funciones críticas
- **Documentación**: API actualizada con cada cambio
- **Logs**: Nivel INFO en producción
- **Versioning**: Semver (Major.Minor.Patch)

---

## 3. CASOS DE USO

### Caso de Uso 1: Monitoreo Continuo

**Actor**: Operador del sistema

**Precondición**: Usuario autenticado, dispositivo conectado

**Flujo Normal**:
1. Usuario accede al dashboard
2. Visualiza estado actual en tiempo real
3. Observa gráfico de las últimas 24 horas
4. Revisa si hay alertas activas
5. Sale del sistema

**Postcondición**: Datos mostrados corresponden a últimos 10 segundos

---

### Caso de Uso 2: Alerta por Peligro

**Actor**: Sistema automático

**Precondición**: Sensor conectado, nivel agua > 60 cm

**Flujo Normal**:
1. Sensor mide nivel > 60 cm
2. ESP32 determina estado PELIGRO
3. Envía a servidor
4. Servidor valida y genera alerta
5. Envía notificación a todos los usuarios
6. Dashboard muestra en rojo
7. Alarma se activa automáticamente

**Postcondición**: Usuario notificado en < 5 segundos

---

### Caso de Uso 3: Activación Manual de Alarma

**Actor**: Operador (rol Operador o Admin)

**Precondición**: Usuario autenticado

**Flujo Normal**:
1. Usuario va a sección "Control"
2. Presiona botón "Activar Alarma"
3. Sistema solicita confirmación
4. Usuario confirma
5. Alarma se activa por 30 segundos
6. Se registra el evento

**Postcondición**: Evento guardado en logs

---

### Caso de Uso 4: Configurar Umbrales

**Actor**: Admin

**Precondición**: Usuario con rol Admin

**Flujo Normal**:
1. Admin accede a "Configuración"
2. Modifica valores de umbrales
3. Presiona "Guardar"
4. Sistema valida nuevos valores
5. Guarda en BD
6. Aplica inmediatamente

**Postcondición**: Nuevos umbrales activos en clasificación

---

### Caso de Uso 5: Análisis Histórico

**Actor**: Analista

**Precondición**: Usuario autenticado

**Flujo Normal**:
1. Usuario va a "Historial"
2. Selecciona rango de fechas (últimos 7 días)
3. Sistema carga datos del período
4. Muestra gráfico lineal
5. Usuario puede hacer zoom
6. Exporta datos a CSV

**Postcondición**: Archivo CSV descargado

---

## 4. MATRIZ DE TRAZABILIDAD

| Requerimiento | Prioridad | Componente | Estado |
|---------------|-----------|-----------|--------|
| RF-001 | Alta | ESP32 | Pendiente |
| RF-002 | Alta | ESP32 | Pendiente |
| RF-003 | Alta | ESP32 | Pendiente |
| RF-004 | Alta | Backend | Pendiente |
| RF-005 | Media | ESP32 | Pendiente |
| RF-006 | Alta | ESP32 | Pendiente |
| RF-007 | Alta | Backend | Pendiente |
| RF-008 | Alta | Backend | Pendiente |
| RF-009 | Media | Backend | Pendiente |
| RF-010 | Alta | Backend | Pendiente |
| RF-011 | Alta | Backend | Pendiente |
| RF-012 | Media | Backend | Pendiente |
| RF-013 | Alta | Frontend | Pendiente |
| RF-014 | Alta | Frontend | Pendiente |
| RF-015 | Alta | Frontend | Pendiente |
| RF-016 | Media | Backend | Pendiente |
| RF-017 | Alta | Backend | Pendiente |
| RF-018 | Media | Backend | Pendiente |

---

**Última actualización**: 13 de Abril de 2026
