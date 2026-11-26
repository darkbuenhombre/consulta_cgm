# Backend: reservas de la consulta dental

API en Node.js (Express) con PostgreSQL. Guarda las reservas, calcula las horas
disponibles, envía correos por Gmail y entrega el panel de administración.

## Instalación (una sola vez)

1. **Crear tu usuario en PostgreSQL** (si `psql` dice `role "tu_usuario" does not exist`):
   ```bash
   sudo -u postgres createuser --superuser $USER
   ```
2. **Crear las bases de datos** (la real y la de pruebas):
   ```bash
   createdb consulta
   createdb consulta_test
   ```
3. **Instalar dependencias y configurar**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
   Edita `.env`:
   - `DATABASE_URL=postgres:///consulta?host=/var/run/postgresql` (por socket local, con tu usuario de Linux y sin clave)
   - `TEST_DATABASE_URL=postgres:///consulta_test?host=/var/run/postgresql`
   - `JWT_SECRET`: genera uno con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `GMAIL_USER` y `GMAIL_APP_PASSWORD`: ver la sección de correo más abajo.
4. **Crear las tablas y el administrador**:
   ```bash
   npm run db:init
   npm run crear-admin -- doctor@ejemplo.cl una-clave-segura
   ```
   ⚠️ `db:init` borra todos los datos. Úsalo solo al comenzar.

**Al actualizar** una base que ya tiene datos, usa `npm run db:migrar`: aplica las tablas nuevas de
`db/migraciones/` (por ejemplo, el inventario) sin borrar nada. Se puede ejecutar las veces que quieras.

## Uso diario

```bash
cd backend && npm run dev      # API en http://localhost:4000 (se reinicia al guardar cambios)
cd reservas && npm start       # Página web en http://localhost:3000
```

- Página de reservas: http://localhost:3000
- Panel de administración: http://localhost:3000/admin

## Correo con Gmail

1. Activa la verificación en dos pasos en tu cuenta de Google.
2. Crea una contraseña de aplicación en https://myaccount.google.com/apppasswords.
3. En `.env`, escribe `GMAIL_USER=tucorreo@gmail.com` y `GMAIL_APP_PASSWORD=` con la clave de 16 letras (sin espacios).

Si estas variables quedan vacías, la API funciona igual, pero los correos solo se muestran en la consola.

## Tests

```bash
npm test
```
Los tests de la API usan `TEST_DATABASE_URL` y **borran esa base de datos** en cada ejecución.
Si la variable no está definida, esos tests se saltan.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/servicios` | Servicios activos |
| GET | `/api/disponibilidad?fecha=YYYY-MM-DD` | Bloques de la fecha con `disponible: true/false` |
| POST | `/api/reservas` | Crear reserva `{ datos: {nombre, apellido_paterno, apellido_materno, rut, telefono, email}, servicio, fecha, hora }` |
| GET / POST | `/api/reservas/cancelar/:token` | Ver o cancelar una reserva (enlace del correo) |
| POST | `/api/auth/login` | `{ email, password }`, devuelve `{ token }` |
| GET | `/api/admin/reservas?desde=&hasta=&estado=` | Listar reservas 🔒 |
| PATCH | `/api/admin/reservas/:id` | `{ estado }`: pendiente, confirmada, cancelada o completada 🔒 |
| GET / POST / PUT | `/api/admin/servicios[/:id]` | Ver, crear y editar servicios 🔒 |
| GET / PUT | `/api/admin/horario` | Ver y reemplazar el horario semanal 🔒 |
| GET / POST / DELETE | `/api/admin/dias-bloqueados[/:fecha]` | Feriados y vacaciones 🔒 |
| GET | `/api/admin/materials?search=&category=&status=low\|out\|expiring` | Inventario de materiales 🔒 |
| POST / PUT / DELETE | `/api/admin/materials[/:id]` | Crear, editar (sin cambiar el stock) y eliminar materiales 🔒 |
| POST | `/api/admin/materials/:id/adjust` | `{ delta, reason }`: suma o resta stock y lo registra en `stock_adjustments` 🔒 |
| GET | `/api/admin/materials/low-stock` | `{ lowStock, expiringSoon }`: alertas del inventario 🔒 |

🔒 = requiere el encabezado `Authorization: Bearer <token>` de admin. Sin token: 401. Con un token válido sin `rol: "admin"`: 403.

## Estructura

```
db/schema.sql, db/seed.sql   Tablas y datos iniciales
db/migraciones/              Cambios que no borran datos (npm run db:migrar)
scripts/                     init-db, migrar y crear-admin
src/app.js                   Configuración de Express y manejo de errores
src/routes/                  publico.js, auth.js, admin.js
src/services/                agenda.js (disponibilidad) y email.js
src/utils/                   rut.js, disponibilidad.js, errores.js
src/validators.js            Validación de los datos recibidos (zod)
```
