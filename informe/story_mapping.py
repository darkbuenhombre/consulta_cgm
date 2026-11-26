# Genera story_mapping.svg (Visual Story Mapping). Ejecutar: python3 story_mapping.py
from html import escape

AZUL, TEAL, GRIS, LINEA = "#12355b", "#1b8a9a", "#333", "#d5dde3"
# Actividades del recorrido del usuario (columnas), agrupadas por tipo de usuario
ACTIVIDADES = [
    ("Paciente", "Conocer la|consulta"), ("Paciente", "Reservar|una hora"), ("Paciente", "Confirmar o|cancelar"),
    ("Odontólogo", "Acceder al|panel"), ("Odontólogo", "Gestionar|las reservas"), ("Odontólogo", "Configurar|la consulta"),
    ("Odontólogo", "Controlar el|inventario"),
]
# (entrega, color de fondo, {columna: [historias]})
ENTREGAS = [
    ("Incremento 1|S4–S7", "#e8f3f5", {0: ["HU01 Ver servicios|y precios"], 1: ["HU02 Elegir servicio,|fecha y hora", "HU03 Ingresar datos|con RUT validado", "HU04 Evitar horarios|ya tomados"]}),
    ("Incremento 2|S7–S8", "#e8f3f5", {3: ["HU05 Iniciar sesión|segura"], 4: ["HU06 Ver reservas|con filtros", "HU07 Cambiar estado|de una reserva"], 5: ["HU08 Administrar|servicios", "HU09 Definir horario|semanal", "HU10 Bloquear días|sin atención"]}),
    ("Incremento 3|S8–S9", "#e8f3f5", {6: ["HU11 Registrar|materiales", "HU12 Ajustar stock|con historial", "HU13 Ver alertas de|stock y vencimiento", "HU14 Buscar y filtrar|materiales"]}),
    ("Incremento 4|S10–S11", "#e8f3f5", {2: ["HU15 Recibir correo|de confirmación", "HU16 Cancelar desde|enlace personal", "HU17 Recibir correo|de cancelación"]}),
    ("Puesta en marcha|S12", "#fbf1e4", {1: ["HU18 Aceptar aviso|de privacidad"], 4: ["HU19 Respaldo semanal|de la información"]}),
    ("Versión 1.1|propuesta", "#f3f3f3", {0: ["HU20 Página informativa|del doctor", "HU26 Mejorar el|diseño visual"], 4: ["HU21 Aviso por correo|de nueva reserva"]}),
    ("Versión 2.0|mejoras futuras", "#f3f3f3", {2: ["HU22 Recordatorio|antes de la cita"], 3: ["HU23 Perfiles para|el personal"], 4: ["HU24 Agenda para varios|odontólogos"], 6: ["HU25 Descontar stock|por procedimiento"]}),
]

X0, CW, CARD_H, GAP = 210, 196, 54, 10
W = X0 + CW * len(ACTIVIDADES) + 20
alto_fila = [max(len(v) for v in h.values()) * (CARD_H + GAP) + 20 for _, _, h in ENTREGAS]
Y_ACT = 150
Y_FILAS = Y_ACT + 90
H = Y_FILAS + sum(alto_fila) + 60
out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="DejaVu Sans, Arial, sans-serif">',
       f'<rect width="{W}" height="{H}" fill="#fff"/>',
       f'<text x="{W/2}" y="46" text-anchor="middle" font-size="30" font-weight="bold" fill="{AZUL}">Visual Story Mapping – Consulta Dr. Cleomenes García</text>']

def texto(x, y, lineas, size=14, color=GRIS, bold=False, anchor="middle"):
    peso = ' font-weight="bold"' if bold else ""
    for i, t in enumerate(lineas):
        out.append(f'<text x="{x}" y="{y + i*(size+4)}" text-anchor="{anchor}" font-size="{size}"{peso} fill="{color}">{escape(t)}</text>')

# Usuarios (agrupan actividades)
for usuario, color in (("Paciente", AZUL), ("Odontólogo", TEAL)):
    cols = [i for i, (u, _) in enumerate(ACTIVIDADES) if u == usuario]
    x1, x2 = X0 + cols[0] * CW + 5, X0 + (cols[-1] + 1) * CW - 5
    out.append(f'<rect x="{x1}" y="80" width="{x2-x1}" height="44" rx="10" fill="{color}"/>')
    texto((x1 + x2) / 2, 108, [usuario], 18, "#fff", True)
texto(20, 108, ["Usuario"], 16, AZUL, True, "start")
texto(20, Y_ACT + 40, ["Actividades"], 16, AZUL, True, "start")

# Actividades (columna vertebral del mapa)
for i, (_, act) in enumerate(ACTIVIDADES):
    x = X0 + i * CW + 5
    out.append(f'<rect x="{x}" y="{Y_ACT}" width="{CW-10}" height="70" rx="8" fill="{AZUL}" opacity="0.9"/>')
    lineas = act.split("|")
    texto(x + (CW - 10) / 2, Y_ACT + 30 + (2 - len(lineas)) * 9, lineas, 16, "#fff", True)

# Entregas (filas) con sus historias
y = Y_FILAS
for (nombre, fondo, historias), alto in zip(ENTREGAS, alto_fila):
    out.append(f'<rect x="10" y="{y}" width="{W-20}" height="{alto}" fill="{fondo}"/>')
    out.append(f'<line x1="10" y1="{y}" x2="{W-10}" y2="{y}" stroke="{AZUL}" stroke-width="2" stroke-dasharray="8,5"/>')
    texto(20, y + 30, nombre.split("|"), 15, AZUL, True, "start")
    for col, hs in historias.items():
        for k, h in enumerate(hs):
            cx, cy = X0 + col * CW + 8, y + 10 + k * (CARD_H + GAP)
            borde = "#d08a2c" if fondo == "#fbf1e4" else ("#999" if fondo == "#f3f3f3" else TEAL)
            out.append(f'<rect x="{cx}" y="{cy}" width="{CW-16}" height="{CARD_H}" rx="6" fill="#fff" stroke="{borde}" stroke-width="2"/>')
            texto(cx + (CW - 16) / 2, cy + 23, h.split("|"), 13)
    y += alto
out.append(f'<line x1="10" y1="{y}" x2="{W-10}" y2="{y}" stroke="{AZUL}" stroke-width="2" stroke-dasharray="8,5"/>')
texto(20, y + 35, ["Fondo celeste: implementado (versión 1.0).   Fondo anaranjado: pendiente para la puesta en marcha.   Fondo gris: mejoras propuestas, fuera del alcance de este proyecto."], 14, GRIS, False, "start")
out.append('</svg>')
open("story_mapping.svg", "w", encoding="utf-8").write("\n".join(out))
print(W, H + 0)
