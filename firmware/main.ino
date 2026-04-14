// Firmware ESP32 - Sistema IoT Inundaciones
// main.ino

#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>
#include "config.h"
#include "sensor.h"

// Variables globales
WiFiClient wifiClient;
HTTPClient http;
unsigned long lastSendTime = 0;

// Prototypes
void connectToWiFi();
void sendMeasurement(float distance, float waterLevel, String state);
String classifyState(float waterLevel);
void updateTime();
void setup();
void loop();

/**
 * Setup - Inicialización del sistema
 */
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\nIniciando Sistema IoT - Alerta Temprana Inundaciones");
  Serial.println("Barrio Rojas Pinilla - Riohacha, La Guajira");
  
  // Inicializar pines del sensor
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  // Conectar a WiFi
  connectToWiFi();
  
  // Sincronizar hora
  updateTime();
  
  Serial.println("Sistema listo para operación");
}

/**
 * Loop principal
 */
void loop() {
  // Medir cada SAMPLE_FREQUENCY ms
  float distance = readSensor();
  
  if (distance != -1) {
    // Distancia válida
    float waterLevel = tankHeight - distance;
    String state = classifyState(waterLevel);
    
    Serial.printf("Distancia: %.2f cm | Nivel agua: %.2f cm | Estado: %s\n",
                  distance, waterLevel, state.c_str());
    
    // Enviar datos cada SEND_INTERVAL segundos
    if (millis() - lastSendTime >= (SEND_INTERVAL * 1000)) {
      if (WiFi.status() == WL_CONNECTED) {
        sendMeasurement(distance, waterLevel, state);
        lastSendTime = millis();
      } else {
        Serial.println("WiFi desconectado, intentando reconectar...");
        connectToWiFi();
      }
    }
  } else {
    Serial.println("Error en lectura del sensor");
  }
  
  delay(SAMPLE_FREQUENCY);
}

/**
 * Conectar a WiFi
 */
void connectToWiFi() {
  Serial.print("Conectando a WiFi: ");
  Serial.println(SSID);
  
  WiFi.begin(SSID, PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nWiFi conectado | IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\nFallo al conectar a WiFi");
  }
}

/**
 * Clasificar estado del agua
 */
String classifyState(float waterLevel) {
  if (waterLevel <= NORMAL_LEVEL) {
    return "NORMAL";
  } else if (waterLevel <= ALERT_LEVEL) {
    return "ALERTA";
  } else {
    return "PELIGRO";
  }
}

/**
 * Enviar medición a servidor
 */
void sendMeasurement(float distance, float waterLevel, String state) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Sin conexión WiFi");
    return;
  }
  
  // Preparar JSON
  String payload = "{";
  payload += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"distance\":" + String(distance, 2) + ",";
  payload += "\"waterLevel\":" + String(waterLevel, 2) + ",";
  payload += "\"state\":\"" + state + "\",";
  payload += "\"battery\":" + String(analogRead(BATTERY_PIN) / 40) + ",";
  payload += "\"timestamp\":\"" + getISOTime() + "\"";
  payload += "}";
  
  Serial.println("Enviando datos a servidor...");
  Serial.println(payload);
  
  http.begin(wifiClient, SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", String(API_KEY));
  
  int httpCode = http.POST(payload);
  
  if (httpCode > 0) {
    Serial.printf("Respuesta del servidor: %d\n", httpCode);
    String response = http.getString();
    Serial.println(response);
  } else {
    Serial.printf("Error en solicitud HTTP: %s\n", http.errorToString(httpCode).c_str());
  }
  
  http.end();
}

/**
 * Obtener hora en formato ISO
 */
String getISOTime() {
  time_t now = time(nullptr);
  struct tm timeinfo = *localtime(&now);
  char buffer[25];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buffer);
}

/**
 * Actualizar hora del sistema (NTP)
 */
void updateTime() {
  Serial.println("Sincronizando hora...");
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  
  time_t now = time(nullptr);
  int attempts = 0;
  while (now < 24 * 3600 && attempts < 30) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
    attempts++;
  }
  
  Serial.println();
  Serial.printf("Hora sincronizada: %s\n", ctime(&now));
}
