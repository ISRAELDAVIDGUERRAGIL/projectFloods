// Configuración del Sistema
// config.h

#ifndef CONFIG_H
#define CONFIG_H

// ===== CREDENCIALES WiFi =====
#define SSID "TU_SSID_AQUI"
#define PASSWORD "TU_PASSWORD_AQUI"

// ===== SERVIDOR =====
#define SERVER_URL "http://api.iot-inundaciones.com/api/measurements"
#define API_KEY "sk_live_1234567890"
#define DEVICE_ID "DEVICE_001"

// ===== PINES ESP32 =====
#define TRIG_PIN 32      // Pin GPIO para TRIGGER del sensor
#define ECHO_PIN 33      // Pin GPIO para ECHO del sensor
#define BATTERY_PIN 34   // Pin ADC para batería

// ===== SENSOR ULTRASÓNICO =====
#define SPEED_OF_SOUND 343.0    // m/s a 20°C
#define TANK_HEIGHT 100.0       // Altura máxima en cm

// ===== NIVELES DE ALERTA =====
#define NORMAL_LEVEL 30.0       // Nivel normal (cm)
#define ALERT_LEVEL 60.0        // Nivel de alerta (cm)

// ===== FRECUENCIAS =====
#define SAMPLE_FREQUENCY 100    // Lectura cada 100 ms
#define SEND_INTERVAL 300       // Enviar datos cada 5 minutos (300 seg)

// ===== TIMEOUTS =====
#define SENSOR_TIMEOUT 5000     // Timeout sensor en ms
#define HTTP_TIMEOUT 10000      // Timeout HTTP en ms

// ===== DEBUG =====
#define DEBUG true

#endif // CONFIG_H
