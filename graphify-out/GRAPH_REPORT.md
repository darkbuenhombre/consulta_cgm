# Graph Report - trabajo_consulta  (2026-10-31)

## Corpus Check
- Corpus is ~9,474 words - fits in a single context window. You may not need a graph.

## Summary
- 241 nodes · 513 edges · 12 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Backend Core y Scripts
- Dependencias Frontend
- Dependencias Backend
- Agenda, Horarios y RUT
- Admin Horario y Servicios
- Formulario de Reserva
- Estilos Compartidos
- Rutas y Cancelación
- Selectores de Reserva
- Sesión Admin y Login
- Admin Reservas y Fechas
- Manifest PWA

## God Nodes (most connected - your core abstractions)
1. `api()` - 28 edges
2. `Reserva()` - 17 edges
3. `react` - 14 edges
4. `HttpError` - 9 edges
5. `fechaChilena()` - 9 edges
6. `Header()` - 9 edges
7. `SelectorFecha()` - 9 edges
8. `AdminLogin()` - 8 edges
9. `config` - 7 edges
10. `enviarCancelacion()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `cambiarEstado()` --calls--> `api()`  [EXTRACTED]
  reservas/src/components/admin/AdminReservas.jsx → reservas/src/api.js
- `cancelar()` --calls--> `api()`  [EXTRACTED]
  reservas/src/pages/Cancelar.jsx → reservas/src/api.js
- `leerId()` --calls--> `HttpError`  [EXTRACTED]
  backend/src/routes/admin.js → backend/src/utils/errores.js
- `buscarPorToken()` --calls--> `HttpError`  [EXTRACTED]
  backend/src/routes/publico.js → backend/src/utils/errores.js
- `esFutura()` --calls--> `ahoraEnChile()`  [EXTRACTED]
  backend/src/routes/publico.js → backend/src/utils/disponibilidad.js

## Import Cycles
- None detected.

## Communities (12 total, 0 thin omitted)

### Community 0 - "Backend Core y Scripts"
Cohesion: 0.09
Nodes (34): datos, [email, password], app, config, crearEsquema(), enTransaccion(), pool, requiereAdmin() (+26 more)

### Community 1 - "Dependencias Frontend"
Cohesion: 0.06
Nodes (33): react-app, react-app/jest, react-dom, react-scripts, @testing-library/dom, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event (+25 more)

### Community 2 - "Dependencias Backend"
Cohesion: 0.07
Nodes (35): dependencies, bcryptjs@^3.0.3, cors@^2.8.6, dotenv@^18.0.9, express@^5.3.0, jsonwebtoken@^9.0.3, nodemailer@^10.2.1, pg@^8.23.1 (+27 more)

### Community 3 - "Agenda, Horarios y RUT"
Cohesion: 0.20
Nodes (13): obtenerDisponibilidad(), aHora(), ahoraEnChile(), aMinutos(), calcularDisponibilidad(), diaSemana(), generarBloques(), calcularDv() (+5 more)

### Community 4 - "Admin Horario y Servicios"
Cohesion: 0.18
Nodes (10): api(), AdminHorario(), DiasBloqueados(), agregar(), quitar(), HorarioSemanal(), guardar(), AdminServicios() (+2 more)

### Community 5 - "Formulario de Reserva"
Cohesion: 0.13
Nodes (3): DatosPaciente(), SelectorFecha(), Reserva()

### Community 6 - "Estilos Compartidos"
Cohesion: 0.31
Nodes (9): DIAS, NUEVO, botonChico, botonSecundario, contenedor, input, mensajeError, VERDE (+1 more)

### Community 7 - "Rutas y Cancelación"
Cohesion: 0.24
Nodes (8): react-router-dom, App(), botonPrincipal, tarjeta, root, Cancelar(), cancelar(), ESTADOS

### Community 8 - "Selectores de Reserva"
Cohesion: 0.29
Nodes (4): react, SelectorHora(), SelectorServicio(), RESERVA_VACIA

### Community 9 - "Sesión Admin y Login"
Cohesion: 0.36
Nodes (8): cerrarSesion(), guardarToken(), obtenerToken(), Header(), AdminLogin(), ingresar(), AdminPanel(), salir()

### Community 10 - "Admin Reservas y Fechas"
Cohesion: 0.24
Nodes (8): aTextoFecha(), fechaChilena(), AdminReservas(), cambiarEstado(), celda, COLORES_ESTADO, ESTADOS, enviarReserva()

### Community 11 - "Manifest PWA"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

## Knowledge Gaps
- **2 isolated node(s):** `react-app`, `react-app/jest`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 70 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Selectores de Reserva` to `Dependencias Frontend`, `Estilos Compartidos`, `Rutas y Cancelación`, `Sesión Admin y Login`, `Admin Reservas y Fechas`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **What connects `react-app`, `react-app/jest` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend Core y Scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.09049773755656108 - nodes in this community are weakly interconnected._
- **Why does `api()` connect `Admin Horario y Servicios` to `Formulario de Reserva`, `Estilos Compartidos`, `Rutas y Cancelación`, `Selectores de Reserva`, `Sesión Admin y Login`, `Admin Reservas y Fechas`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `Dependencias Frontend` be split into smaller, more focused modules?**
  _Cohesion score 0.06456456456456457 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `Rutas y Cancelación` to `Selectores de Reserva`, `Dependencias Frontend`, `Sesión Admin y Login`, `Estilos Compartidos`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Should `Dependencias Backend` be split into smaller, more focused modules?**
  _Cohesion score 0.06984126984126984 - nodes in this community are weakly interconnected._