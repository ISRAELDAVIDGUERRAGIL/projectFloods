#!/bin/bash
# Script de Setup Completo
# setup.sh

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  INSTALADOR - Sistema IoT de Inundaciones                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verificar Node.js
echo "✓ Verificando Node.js..."
if ! command -v node &> /dev/null; then
  echo "✗ Node.js no encontrado. Instálalo desde https://nodejs.org"
  exit 1
fi
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo ""

# Backend
echo "📦 Instalando Backend..."
cd backend
npm install
echo "✓ Backend instalado"
echo ""

# Frontend
echo "📦 Instalando Frontend..."
cd ../frontend
npm install
echo "✓ Frontend instalado"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✓ INSTALACIÓN COMPLETADA                                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "PRÓXIMOS PASOS:"
echo "1. Instala PostgreSQL o MySQL"
echo "2. Crea la base de datos: mysql < database/init.sql"
echo "3. Configura el archivo .env en backend/"
echo "4. Inicia el backend: npm run dev"
echo "5. Inicia el frontend: npm start"
echo ""
