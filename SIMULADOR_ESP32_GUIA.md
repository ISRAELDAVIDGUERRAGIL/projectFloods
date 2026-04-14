# 🤖 SIMULADOR ESP32 - GUÍA DE USO

## 📌 ¿QUÉ ES?

El **Simulador ESP32** es un módulo que simula el comportamiento del microcontrolador ESP32 sinque necesites el hardware físico. Permite:

✅ Probar el sistema sin circuito real
✅ Generar datos de sensores realistas
✅ Simular eventos y alertas
✅ Debuggear en tiempo real
✅ Control total desde el frontend

---

## 🚀 CÓMO COMENZAR

### 1️⃣ **Iniciar Backend**
```bash
cd backend
npm run dev
```

### 2️⃣ **Iniciar Frontend**
```bash
cd frontend
npm start
```

### 3️⃣ **Iniciar Sesión**
```
Email: admin@iot-inundaciones.local
Password: admin123
```

### 4️⃣ **Panel del Simulador**
En la esquina inferior izquierda aparecerá:
```
🤖 ▶ Simulador ESP32
```

Haz clic para expandir y comenzar.

---

## 📊 PANEL DE CONTROL

### Componentes del Panel

```
┌─────────────────────────────────────────┐
│ 🤖 ▼ Simulador ESP32                   │
├─────────────────────────────────────────┤
│                                         │
│ 🌊 Panel de Control - ESP32 Simulator  │
│ Status: 🟢 Activo | 5 dispositivos     │
│                                         │
│ ID del Dispositivo:                     │
│ [ESP32-001              ]               │
│                                         │
│ [➕ Inicializar] [▶ Iniciar] [⏹ Detener]
│                                         │
│ ... (más opciones)                      │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎮 FUNCIONES PRINCIPALES

### 1. Inicializar Dispositivo
```
Botón: ➕ Inicializar

Qué hace:
├─ Crea un dispositivo virtual
├─ Configura valores iniciales
└─ Prepara para enviar datos

Resultado: El dispositivo aparece en el dashboard
```

### 2. Iniciar Simulación
```
Botón: ▶ Iniciar

Qué hace:
├─ Comienza a enviar datos periódicamente
├─ Cada 30 segundos por defecto
├─ Simula fluctuaciones realistas
└─ Los datos llegan al dashboard en tiempo real

Resultado: Dashboard muestra datos actualizados
```

### 3. Detener Simulación
```
Botón: ⏹ Detener

Qué hace:
├─ Detiene el envío de datos
├─ El dispositivo sigue "activo" en BD
└─ Puedes volver a iniciar

Resultado: Datos dejan de actualizarse
```

### 4. Ajustar Valores Manualmente
```
Controles deslizantes y campos numéricos:
├─ 💧 Nivel de Agua: 0-300 cm
├─ 🌡️ Temperatura: -50 a 150°C
├─ 💧 Humedad: 0-100%
└─ 🔋 Batería: 0-100%

Botón: ✏️ Actualizar Valores

Qué hace:
├─ Cambia los valores del sensor
├─ Se envían al siguiente POST
└─ Se reflejan en el dashboard

Resultado: Dashboard muestra nuevos valores
```

### 5. Simular Eventos de Alerta
```
Campos:
├─ Nivel Objetivo: 0-300 cm
└─ Duración: tiempo en ms

Botón: 🔔 Generar Alerta

Qué hace:
├─ Nivel de agua sube gradualmente
├─ Llega al nivel objetivo
├─ Se genera alerta (si supera threshold)
├─ Baja gradualmente
└─ Vuelve a la normalidad

Resultado: Ves la alerta en el dashboard
```

### 6. Simular Desconexión
```
Botón: 🔌 Desconectar

Qué hace:
├─ Detiene el envío de datos
├─ Marca device como offline
└─ Simula pérdida de conexión

Resultado: Device aparece como desconectado
```

### 7. Detener Todo
```
Botón: 🛑 Detener Todo

Qué hace:
├─ Para todos los simuladores activos
├─ Reinicia el panel
└─ Necesitas volver a iniciar si quieres

Resultado: Todos los dispositivos se detienen
```

---

## 💡 EJEMPLOS PRÁCTICOS

### EJEMPLO 1: Prueba tu Dashboard

**Paso a paso:**
```
1. Expandir panel (🤖 ▶)
2. Cambiar Device ID a "DEMO-001"
3. Click: ➕ Inicializar
4. Click: ▶ Iniciar
5. Esperar 30 segundos
6. Ir al Dashboard
```

**Resultado esperado:**
```
Dashboard mostrará:
✅ Nivel de agua: 50 cm (inicial)
✅ Temperatura: 25°C
✅ Batería: 85%
✅ Datos actualizándose cada 30s
```

### EJEMPLO 2: Simular una Inundación

**Paso a paso:**
```
1. Panel expandido, device corriendo
2. Cambiar "Nivel Objetivo" a 200 cm
3. Cambiar "Duración" a 60000 ms (60s)
4. Click: 🔔 Generar Alerta
5. Mirar el dashboard
```

**Resultado esperado:**
```
Dashboard mostrará:
📈 Nivel sube gradualmente
🚨 Alerta ROJA cuando supera threshold
⚠️ Notificación en toast
📉 Nivel baja nuevamente
✅ Alerta vuelve a VERDE
```

### EJEMPLO 3: Cambiar Valores Manualmente

**Paso a paso:**
```
1. Nivel de Agua: Mover slider a 150 cm
2. Temperatura: Cambiar a 35°C
3. Batería: Cambiar a 20%
4. Click: ✏️ Actualizar Valores
```

**Resultado esperado:**
```
Dashboard mostrará:
💧 Nivel: 150 cm
🌡️ Temp: 35°C
🔋 Batería: 20% (AMARILLA)
Tarjetas de métrica actualizadas
```

### EJEMPLO 4: Múltiples Dispositivos

**Paso a paso:**
```
1. Device ID: "SENSOR-01"
2. ➕ Inicializar
3. ▶ Iniciar
4. Cambiar Device ID: "SENSOR-02"
5. ➕ Inicializar
6. ▶ Iniciar
7. Cambiar Device ID: "SENSOR-03"
8. ➕ Inicializar
9. ▶ Iniciar
```

**Resultado esperado:**
```
Dashboard mostrará:
✨ 3 dispositivos diferentes
📊 Cada uno con datos distintos
🔄 Todos actualizándose independientemente
```

---

## 🔧 CONFIGURACIÓN

### Intervalo de Envío
```
Default: 30000 ms (30 segundos)

Para cambiar:
1. Campo: "Intervalo de Envío (ms)"
2. Cambiar valor (ej: 5000 para 5 segundos)
3. Iniciar un nuevo dispositivo

⚠️ Nota: El intervalo se aplica al iniciar, 
         no a los que ya están corriendo
```

### Simulación Realista
```
Los valores fluctúan naturalmente:
├─ Agua: ±2 cm por ciclo
├─ Temperatura: ±0.75°C por ciclo
├─ Humedad: ±5% por ciclo
├─ Batería: -0.25% por ciclo

Esto simula un sensor real con variaciones
```

---

## 📱 INTEGRACIONES

### Con el Dashboard
```
El simulador envía datos a:
└─ /api/measurements (POST)

El dashboard recibe:
├─ Nivel de agua
├─ Distancia
├─ Temperatura
├─ Humedad
└─ Batería

Actualización: Automática cada ciclo
```

### Con las Alertas
```
Si water_level > threshold_alert:
└─ Se crea ALERTA (YELLOW)

Si water_level > threshold_danger:
└─ Se crea PELIGRO (RED)

El simulador respeta estos umbrales
```

### Con los Logs
```
Backend logs muestran:
├─ 📤 [ESP32-XXX] Data sent
├─ 💧 Water level: XX cm
├─ 🌡️ Temperature: XX°C
└─ 🔋 Battery: XX%

Puedes ver en terminal backend
```

---

## 🚨 TROUBLESHOOTING

### Panel no aparece
```
❌ Panel no visible en pantalla

Solución:
1. Asegúrate de estar logueado
2. Abre DevTools (F12)
3. Revisa Console por errores
4. Reinicia navegador
```

### Botones deshabilitados
```
❌ Botones grises y sin click

Razones:
├─ Device no inicializado (Click Init primero)
├─ Loading en progreso (Espera)
└─ Device no existe (Verifica nombre)
```

### Datos no aparecen en dashboard
```
❌ Panel muestra datos pero dashboard no

Soluciones:
1. Refresh dashboard (F5)
2. Verifica device ID sea correcto
3. Mira console backend por errores
4. Revisa que simulador esté "Activo"
```

### Conexión rechazada
```
❌ Error "Connection refused"

Soluciones:
1. Backend debe estar corriendo (npm run dev)
2. Verifica puerto 3000 disponible
3. Revisa CORS configurado
4. Cierra otras instancias
```

### Alerta no se genera
```
❌ Simulador ejecuta pero sin alerta

Razones:
├─ Nivel no supera threshold
├─ Device debe estar activo
└─ Dashboard debe estar abierto

Prueba:
1. Cambiar target_level más alto
2. Cambiar threshold en config
```

---

## 🎯 CASOS DE USO

### 1. Testing UI
```
Prueba el dashboard sin hardware
├─ ¿Se ve bien con muchos datos?
├─ ¿Las gráficas son correctas?
├─ ¿Las alertas funcionan?
└─ ¿El layout es responsivo?
```

### 2. Testing Lógica
```
Verifica que las Rules funcionen
├─ ¿Se disparan alertas correctamente?
├─ ¿Los umbrales están bien?
├─ ¿Se guardan los datos?
└─ ¿Las notificaciones llegan?
```

### 3. Testing Performance
```
Verifica la velocidad del sistema
├─ ¿Múltiples devices al mismo tiempo?
├─ ¿Tiempos de carga?
├─ ¿Lag o freeze?
└─ ¿Consumo de recursos?
```

### 4. Demo/Presentación
```
Muestra el sistema en acción
├─ Genera alertas en vivo
├─ Cambia valores dinámicamente
├─ Muestra múltiples escenarios
└─ Impresiona a stakeholders
```

### 5. Training
```
Entrena usuarios sin esperar sensores
├─ Cómo usar el dashboard
├─ Cómo responder a alertas
├─ Cómo cambiar configuración
└─ Cómo interpretar datos
```

---

## 🔌 API ENDPOINTS

Si quieres usar directamente (sin UI):

### Inicializar
```bash
POST /api/simulator/device/init
{
  "device_id": "ESP32-001",
  "api_key": "simulator-key"
}
```

### Iniciar
```bash
POST /api/simulator/device/start
{
  "device_id": "ESP32-001",
  "interval_ms": 30000
}
```

### Obtener Status
```bash
GET /api/simulator/status
```

### Actualizar Datos
```bash
PUT /api/simulator/device/ESP32-001
{
  "water_level": 125.5,
  "temperature": 28,
  "humidity": 70,
  "battery": 75
}
```

### Simular Alerta
```bash
POST /api/simulator/device/alert
{
  "device_id": "ESP32-001",
  "target_level": 200,
  "duration_ms": 60000
}
```

---

## ✅ CHECKLIST RÁPIDO

```
Antes de usar:
☑ Backend corriendo (npm run dev)
☑ Frontend corriendo (npm start)
☑ Estás logueado
☑ Dashboard accesible

Usando simulador:
☑ Panel visible en esquina
☑ Dispositivo inicializado
☑ Simulación iniciada
☑ Dashboard actualizado
☑ Datos en tiempo real

Testing exitoso:
☑ Valores cambian en dashboard
☑ Alertas se generan
☑ Toasts aparecen
☑ Logs muestran datos
```

---

**¡Listo! Tu simulador ESP32 está 100% funcional.**

Ahora puedes probar todo el sistema sin hardware físico. 🌊✨
