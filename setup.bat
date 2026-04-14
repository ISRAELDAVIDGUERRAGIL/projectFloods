@echo off
REM Script de Setup para Windows
REM setup.bat

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  INSTALADOR - Sistema IoT de Inundaciones (Windows)        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar Node.js
echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js no encontrado. Instálalo desde https://nodejs.org
    pause
    exit /b 1
)
echo Node.js instalado ✓
echo.

REM Backend
echo Instalando Backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error en instalación del backend
    pause
    exit /b 1
)
echo Backend instalado ✓
cd ..
echo.

REM Frontend
echo Instalando Frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error en instalación del frontend
    pause
    exit /b 1
)
echo Frontend instalado ✓
cd ..
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║  INSTALACIÓN COMPLETADA ✓                                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo PRÓXIMOS PASOS:
echo 1. Instala PostgreSQL o MySQL
echo 2. Crea la base de datos: mysql ^< database/init.sql
echo 3. Configura el archivo .env en backend/
echo 4. Inicia el backend: npm run dev
echo 5. Inicia el frontend: npm start
echo.
pause
