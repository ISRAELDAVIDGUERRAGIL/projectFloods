# Firmware - Código ESP32

## Descripción

Código para el microcontrolador ESP32 que gestiona:
- Lectura del sensor ultrasónico
- Conexión a WiFi
- Envío de datos a servidor
- Manejo de alertas

## Hardware Requerido

- ESP32 Development Board
- Sensor Ultrasónico HC-SR04
- Batería Li-Po 3000mAh
- Cables de conexión
- Resistencias (pull-up/down si es necesario)

## Conexiones

```
HC-SR04         ESP32
VCC      →      5V
GND      →      GND
TRIG     →      GPIO 32
ECHO     →      GPIO 33
```

## Instalación

1. Instalar Arduino IDE
2. Agregar soporte para ESP32 en Arduino IDE
3. Instalar librerías:
   - WiFi (incluida en ESP32)
   - HTTPClient (incluida en ESP32)
   - MQTT (opcional): https://github.com/knolleary/pubsubclient

4. Configurar `config.h` con tus credenciales WiFi y servidor

5. Compilar y cargar en el ESP32

## Configuración

Editar `config.h`:

```cpp
#define SSID "TU_RED_WIFI"
#define PASSWORD "TU_CONTRASEÑA"
#define DEVICE_ID "DEVICE_001"
#define SERVER_URL "http://tu-servidor.com/api/measurements"
#define API_KEY "tu_api_key"
```

## Consumo de Energía

- Lectura sensor: ~1 mA
- WiFi conectado: ~150 mA
- WiFi enviando: ~200-300 mA
- Batería 3000mAh: ~15-20 horas autonomía

## Monitoreo Serial

```bash
# Linux/Mac
screen /dev/ttyUSB0 115200

# Windows (usando COM3)
# Usar Arduino IDE Serial Monitor
```

## Troubleshooting

### No conecta a WiFi
- Verificar SSID y contraseña
- Revisar que el router use 2.4GHz (ESP32 no soporta 5GHz)
- Acercarse al router

### Sensor no mide
- Revisar conexiones GPIO
- Verificar pines en config.h
- Probar con ejemplo básico del sensor

### No envía a servidor
- Verificar URL del servidor
- Verificar API_KEY
- Revisar firewall/puerto

---

**Última actualización**: 13 de Abril de 2026
