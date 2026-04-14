// Librería para Sensor Ultrasónico
// sensor.h

#ifndef SENSOR_H
#define SENSOR_H

#include "config.h"

/**
 * Leer distancia del sensor ultrasónico HC-SR04
 * Retorna: distancia en cm, o -1 si hay error
 */
float readSensor() {
  // Limpiar pin TRIGGER
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  
  // Enviar pulso TRIGGER
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Medir duración del pulso ECHO
  unsigned long duration = pulseIn(ECHO_PIN, HIGH, SENSOR_TIMEOUT * 1000);
  
  // Validar lectura
  if (duration == 0) {
    return -1;  // Timeout o error
  }
  
  // Calcular distancia: distancia = (velocidad * tiempo) / 2
  // velocidad = 343 m/s a 20°C = 0.0343 cm/microsegundo
  // distancia (cm) = (duration * 0.0343) / 2
  float distance = duration * 0.0343 / 2.0;
  
  // Validar rango
  if (distance < 2 || distance > 400) {
    return -1;  // Fuera de rango
  }
  
  return distance;
}

/**
 * Leer batería (voltaje ADC)
 * Retorna: porcentaje de batería (0-100)
 */
int readBattery() {
  // Leer valor ADC (0-4095)
  int adcValue = analogRead(BATTERY_PIN);
  
  // Convertir a voltaje (3.3V = 4095)
  float voltage = (adcValue / 4095.0) * 3.3;
  
  // Asumir rango: 2.8V (0%) a 3.2V (100%)
  // Batería Li-Po típica: 3.0V (agotada) a 4.2V (llena)
  int percentage = (int)(((voltage - 2.8) / 0.4) * 100);
  
  // Limitar a 0-100%
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;
  
  return percentage;
}

/**
 * Obtener temperatura del sensor interno
 * Retorna: temperatura en °C
 */
float readTemperature() {
  // Nota: ESP32 tiene sensor de temperatura interno
  // Valor típico: 25-40°C dependiendo del ambiente
  
  extern uint8_t temprature_sens_read();
  uint8_t temp = temprature_sens_read();
  
  // Convertir a °C
  float temperature = (temp - 32) / 1.8;
  
  return temperature;
}

#endif // SENSOR_H
