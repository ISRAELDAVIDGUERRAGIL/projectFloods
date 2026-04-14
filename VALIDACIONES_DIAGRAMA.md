# 🔒 ARQUITECTURA DE VALIDACIONES - DIAGRAMA VISUAL

## 🌐 FLUJO COMPLETO DE UNA REQUEST

```
                          USUARIO
                     Llena formulario
                            |
                            ▼
                    📤 ENVÍA REQUEST
                            |
              ┌─────────────┴─────────────┐
              ▼                           ▼
        FRONTEND                      API BACKEND
        ✅ Validación                 
        de tipos                      ⚡ MIDDLEWARE
              |                        SANITIZACIÓN
              |                        ├─ SQL Injection
              |                        ├─ XSS
              |                        └─ Input clean
              |                             |
              └────────────┬────────────────┘
                           ▼
                    📨 ENVÍA A API
                           |
                ┌──────────┴──────────┐
                ▼                     ▼
            SANITIZER          VALIDATOR
            ├─ Remove <>       ├─ Email válido
            ├─ Remove SQL      ├─ Password fuerte
            ├─ Remove XSS      ├─ Rangos OK
            └─ Trim/Clean      └─ Formatos OK
                           |
                        ┌──┴──┐
                        │     │
                    ✅PASS  ❌FAIL
                        │     │
                        │     ▼
                        │  ERROR HANDLER
                        │  ├─ Clasificar
                        │  ├─ Log
                        │  └─ Response 400
                        │     {
                        │      "error": "...",
                        │      "details": [...]
                        │     }
                        │
                        ▼
          ✅ LÓGICA DE NEGOCIO
          ├─ Auth check
          ├─ DB query
          ├─ Process data
          └─ Generate response
                        |
                    ✅ SUCCESS
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
        RESPONSE 200         ERROR HANDLER
        {                    {
         "success": true,     "success": false,
         "data": {...}        "error": "...",
         "timestamp": "..."   "timestamp": "..."
        }                    }
                |                     |
                ▼                     ▼
        📱 FRONTEND RX        FRONTEND RX
        ├─ Parse response    ├─ Analyze error
        ├─ Update UI         ├─ Get friendly message
        ├─ Show success      ├─ Log to console
        └─ Toast ✅          └─ Show Toast ❌
```

---

## 🎯 MATRIZ DE VALIDACIONES

### CAMPO: EMAIL
```
┌─────────────────────────────────────────┐
│ INPUT: "usuario@example.com"            │
├─────────────────────────────────────────┤
│ ✅ VALIDACIONES:                        │
│ ├─ Requerido         ✶ NOT EMPTY       │
│ ├─ Formato           ✶ IS_EMAIL        │
│ ├─ Longitud          ✶ 5-100 chars     │
│ ├─ Normalizar        ✶ LOWERCASE       │
│ └─ Único             ✶ NO DUPLICATES   │
├─────────────────────────────────────────┤
│ ✅ SANITIZACIÓN:                        │
│ ├─ Trim spaces       ✶ " email " → "email"
│ ├─ Remove <>         ✓ removido         │
│ └─ Normalize         ✓ normalizado      │
├─────────────────────────────────────────┤
│ ✅ SEGURIDAD:                           │
│ ├─ SQL Injection      ✓ SAFE           │
│ ├─ XSS Attack         ✓ SAFE           │
│ └─ Domain valid       ✓ CHECKED        │
└─────────────────────────────────────────┘
```

### CAMPO: PASSWORD
```
┌──────────────────────────────────────┐
│ INPUT: "Password123"                 │
├──────────────────────────────────────┤
│ ✅ VALIDACIONES:                     │
│ ├─ Requerido         ✶ NOT EMPTY     │
│ ├─ Longitud          ✶ 8+ chars      │
│ ├─ Complejos         ✶ A-Z + 0-9     │
│ ├─ Especial (opt)    ✶ !@#$% (opt)   │
│ └─ Contra diccionario ✓ CHECKED      │
├──────────────────────────────────────┤
│ ✅ SEGURIDAD:                        │
│ ├─ Hash antes guardar ✓ BCRYPT      │
│ ├─ Never plain text  ✓ NEVER         │
│ ├─ Log pattern       ✓ MASKED [**]  │
│ └─ Compare hash      ✓ BCRYPT        │
└──────────────────────────────────────┘
```

### CAMPO: WATER_LEVEL
```
┌──────────────────────────────────────┐
│ INPUT: "125.50"                      │
├──────────────────────────────────────┤
│ ✅ VALIDACIONES:                     │
│ ├─ Requerido         ✶ NOT EMPTY     │
│ ├─ Tipo              ✶ IS_FLOAT      │
│ ├─ Rango             ✶ 0-1000        │
│ ├─ Decimales         ✶ MAX 2         │
│ └─ Físicamente válido ✓ YES          │
├──────────────────────────────────────┤
│ ✅ CONVERSIÓN:                       │
│ ├─ Trim              ✓ "125.50"      │
│ ├─ Parse float       ✓ 125.50        │
│ ├─ Round 2 decimals  ✓ 125.50        │
│ └─ Store as number   ✓ 125.50        │
└──────────────────────────────────────┘
```

---

## 📊 TABLA DE MENSAJES DE ERROR

```
┌────────────┬──────────────┬────────────────────────────────┐
│ Tipo Error │ Status Code  │ Mensaje Frontend               │
├────────────┼──────────────┼────────────────────────────────┤
│ Validation │ 400          │ "Por favor verifica los datos" │
│ Auth       │ 401          │ "Usuario o contraseña inv."    │
│ Permission │ 403          │ "No tienes permiso"            │
│ NotFound   │ 404          │ "Recurso no encontrado"        │
│ Conflict   │ 409          │ "Este registro ya existe"      │
│ Network    │ 0            │ "Sin conexión con servidor"    │
│ Server     │ 500          │ "Error del servidor"           │
│ Unavail.   │ 503          │ "BD no disponible"             │
└────────────┴──────────────┴────────────────────────────────┘
```

---

## 🛡️ CAPAS DE SEGURIDAD

```
LAYER 1: FRONTEND VALIDATION
┌─────────────────────────────┐
│ ✅ Type checks              │
│ ✅ Format validation        │
│ ✅ Required fields          │
│ ✅ UX feedback              │
└─────────────────────────────┘
           ↓↓↓
LAYER 2: NETWORK (HTTPS)
┌─────────────────────────────┐
│ ✅ Encrypted transmission   │
│ ✅ No man-in-the-middle     │
│ ✅ Certificate valid        │
└─────────────────────────────┘
           ↓↓↓
LAYER 3: INPUT SANITIZACIÓN
┌─────────────────────────────┐
│ ✅ SQL Injection blocks     │
│ ✅ XSS prevention           │
│ ✅ HTML tag removal         │
│ ✅ Escape special chars     │
└─────────────────────────────┘
           ↓↓↓
LAYER 4: VALIDATION
┌─────────────────────────────┐
│ ✅ Type validation          │
│ ✅ Format validation        │
│ ✅ Range validation         │
│ ✅ Business rules           │
└─────────────────────────────┘
           ↓↓↓
LAYER 5: AUTHENTICATION
┌─────────────────────────────┐
│ ✅ JWT signature check      │
│ ✅ Token expiry check       │
│ ✅ User exists              │
│ ✅ User active              │
└─────────────────────────────┘
           ↓↓↓
LAYER 6: AUTHORIZATION
┌─────────────────────────────┐
│ ✅ Role check               │
│ ✅ Permission check         │
│ ✅ Resource ownership       │
│ ✅ Rate limiting            │
└─────────────────────────────┘
           ↓↓↓
LAYER 7: DATABASE
┌─────────────────────────────┐
│ ✅ Parameterized queries    │
│ ✅ Foreign key constraints  │
│ ✅ Unique constraints       │
│ ✅ Check constraints        │
└─────────────────────────────┘
           ↓↓↓
         ✅ SAFE
```

---

## 🎨 COMPONENTE TOAST - TIPOS

```
SUCCESS ✅ (Verde)
┌────────────────────────────────────────┐
│ ✅ Éxito                               │
│ Dispositivo creado correctamente       │
│                                  [✕]   │
└────────────────────────────────────────┘

ERROR ❌ (Rojo)
┌────────────────────────────────────────┐
│ ❌ Error al conectar                   │
│ Verifica tu conexión a Internet        │
│ • Código: ERR_NETWORK                  │
│ • Timestamp: 14:52:30                  │
│                                  [✕]   │
└────────────────────────────────────────┘

WARNING ⚠️ (Amarillo)
┌────────────────────────────────────────┐
│ ⚠️ Advertencia                         │
│ Batería por debajo del 20%             │
│                                  [✕]   │
└────────────────────────────────────────┘

INFO ℹ️ (Azul)
┌────────────────────────────────────────┐
│ ℹ️ Información                         │
│ Sincronizando datos...                 │
│                                  [✕]   │
└────────────────────────────────────────┘
```

---

## 🔄 ERROR RECOVERY FLOW

```
                    ❌ ERROR
                       |
                       ▼
            ┌──────────────────────┐
            │ Error Handler        │
            │ Analyzes error       │
            └──────────────────────┘
                       |
        ┌──────────┬───┴────┬──────────┐
        ▼          ▼        ▼          ▼
    NETWORK   VALIDATION  AUTH      SERVER
        |          |        |          |
        ▼          ▼        ▼          ▼
    Retry?     Show        Redirect  Try
    possible   fields      /login    later?
        |        error     |          |
        ▼        |         ▼          ▼
    YES ✅      ▼      Clear       Check
       Auto   LOG    token       logs
       retry   |     |
       3x      ▼     ▼
        |    Log file  Logged out
        |    backend
        ▼
    Wait 2s
    Retry
        |
    ┌───┴───┐
    ▼       ▼
  SUCCESS  FAIL
    ✅     ❌
             |
             ▼
          Show
          error
```

---

## 📋 CHECKLIST DE VALIDACIÓN

```
Al crear registro, validar:
☑ Field exists
☑ Type is correct
☑ Length is valid
☑ Format is valid
☑ Range is valid
☑ No SQL injection
☑ No XSS
☑ No duplicates
☑ User permission
☑ DB constraints
```

---

## 🎯 RESPONSABILIDADES POR CAPA

| Capa | Responsabilidad | Ejemplo |
|------|-----------------|---------|
| Frontend | UX Validation | "Email requerido" |
| Network | Encryption | HTTPS/TLS |
| Sanitizer | Input Clean | Remover `<script>` |
| Validator | Format Check | Email válido |
| Auth | User Check | Token válido |
| Logic | Business Rules | No duplicarDispositivo |
| DB | Data Integrity | PK, FK, Unique |

---

**Sistema de validación multinivel. 100% funcional. 🚀**
