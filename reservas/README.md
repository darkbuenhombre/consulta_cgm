# Reservas — Consulta Dental Dr. Cleomenes García

Aplicación web para que los pacientes reserven una hora en la consulta de odontología general. El paciente ingresa sus datos, elige el tipo de consulta, una fecha y un horario, y confirma la reserva.

Construida con React 19 sobre [Create React App](https://create-react-app.dev/) (`react-scripts` 5).

## Requisitos

- Node.js 18 o superior
- npm

## Instalación y uso

Esta página necesita el backend (carpeta `../backend`) funcionando. Revisa [backend/README.md](../backend/README.md) para configurarlo.

```bash
npm install     # instala dependencias
npm start       # servidor de desarrollo en http://localhost:3000
npm run build   # build de producción en build/
npm test        # ejecuta las pruebas en modo watch
```

La dirección de la API se configura con `REACT_APP_API_URL` (por defecto `http://localhost:4000/api`, ver `.env.example`).

## Páginas

| Ruta | Página |
|---|---|
| `/` | Formulario de reserva |
| `/cancelar/:token` | Ver y cancelar una reserva (enlace que llega por correo) |
| `/admin/login` | Ingreso del administrador |
| `/admin` | Panel: reservas, servicios, horario y días sin atención |

## Estructura

```
src/
├── App.js                      # Rutas (react-router-dom)
├── api.js                      # Llamadas al backend, token del admin y formato de fechas
├── estilos.js                  # Estilos compartidos
├── pages/
│   ├── Reserva.jsx             # Estado de la reserva, validación y envío al backend
│   ├── Cancelar.jsx            # Cancelación por enlace
│   ├── AdminLogin.jsx
│   └── AdminPanel.jsx          # Pestañas del panel
└── components/
    ├── Header.jsx              # Nombre del doctor y especialidad
    ├── DatosPaciente.jsx       # Nombre, apellidos, RUT, teléfono y correo
    ├── SelectorServicio.jsx    # Servicios obtenidos desde GET /api/servicios
    ├── SelectorFecha.jsx       # Calendario mensual
    ├── SelectorHora.jsx        # Horarios desde GET /api/disponibilidad?fecha=...
    └── admin/                  # AdminReservas, AdminServicios, AdminHorario
```

### Flujo de datos

`pages/Reserva.jsx` guarda toda la reserva en un único estado:

```js
{ datos: {}, servicio: "", fecha: null, hora: "" }
```

Cada componente recibe un callback (`onCambio` u `onSeleccionar`) y lo llama cuando el usuario cambia su valor. Al presionar **Confirmar reserva** se envía `POST /api/reservas`. Si la hora ya fue tomada por otra persona, se muestra el error y se recargan los horarios.

## Reglas de negocio

- **Fechas:** no se pueden elegir días pasados ni domingos. El administrador también puede bloquear días (feriados, vacaciones).
- **Horarios y servicios:** se guardan en la base de datos y se editan desde `/admin`. Los datos iniciales son de 09:00 a 12:00 y de 14:00 a 16:00, en bloques de 30 minutos.
- **Validación:** el backend valida el RUT (dígito verificador), el correo y el teléfono. Todos los datos del paciente son obligatorios.
- **Formato:** las fechas se muestran en formato chileno.

## Próximos pasos sugeridos

- Pasar los estilos en línea a CSS.
- Agregar pruebas del flujo completo de reserva y del panel.
