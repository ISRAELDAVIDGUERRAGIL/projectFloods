# Backend - Sistema IoT Inundaciones

## Descripción

API REST desarrollada con Node.js y Express.js para el manejo del sistema IoT.

## Estructura

```
backend/
├── src/
│   ├── routes/          # Rutas de la API
│   ├── controllers/     # Lógica de negocio
│   ├── models/          # Modelos de BD
│   ├── middleware/      # Middleware personalizado
│   ├── services/        # Servicios reutilizables
│   ├── config/          # Configuración
│   ├── utils/           # Utilidades
│   └── server.js        # Punto de entrada
├── tests/               # Pruebas unitarias
├── .env.example         # Variables de entorno ejemplo
├── .env                 # Variables de entorno (no versionado)
├── package.json         # Dependencias
└── README.md           # Documentación
```

## Instalación

```bash
npm install
```

## Variables de Entorno

```bash
NODE_ENV=development
PORT=3000
# Para la variante Railway Cloud:
MYSQL_URL=mysql://root:xxxxxx@viaduct.proxy.rlwy.net:3306/railway
# Para variable estática (local):
DB_USER=root
DB_NAME=iot_inundaciones
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
MQTT_BROKER=mqtt://localhost:1883
LOG_LEVEL=info
```

## Iniciar Servidor

```bash
npm run dev      # Desarrollo (con nodemon)
npm run build    # Compilar
npm start        # Producción
```

## Dependencias Principales

- express: Framework web
- mysql2: MySQL client (Optimizado nativamente para MySQL on Railway)
- jsonwebtoken: Autenticación JWT
- bcryptjs: Encriptación de contraseñas
- mqtt: Cliente MQTT
- dotenv: Gestión de variables de entorno
- express-validator: Validación
- winston: Logging
- cors: CORS middleware

---

**Última actualización**: 13 de Abril de 2026
