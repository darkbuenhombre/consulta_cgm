# Genera cronograma.svg (Carta Gantt por semanas). Ejecutar: python3 cronograma.py
from html import escape

SEMANAS = 16
# (etapa, color, [(tarea, [(semana_inicio, semana_fin), ...])])
ETAPAS = [
    ("Gestión", "#12355b", [
        ("Definición del problema y objetivos", [(1, 1)]),
        ("Arquitectura y modelo de datos", [(2, 2)]),
        ("Configuración del entorno", [(3, 3)]),
    ]),
    ("Desarrollo (incrementos)", "#1b8a9a", [
        ("Inc. 1: Interfaz del sitio público", [(4, 5)]),
        ("Inc. 1: Módulo de reservas", [(6, 7)]),
        ("Inc. 2: Panel de administración", [(7, 8)]),
        ("Inc. 3: Módulo de inventario", [(8, 9)]),
        ("Inc. 4: Módulo de notificaciones", [(10, 11)]),
    ]),
    ("Pruebas y puesta en marcha", "#d08a2c", [
        ("Pruebas al cierre de cada incremento", [(5, 5), (7, 7), (9, 9), (11, 11)]),
        ("Pruebas de integración y manuales", [(11, 11)]),
        ("Pruebas de usabilidad y aceptación", [(12, 12)]),
        ("Publicación del sistema y capacitación", [(12, 12)]),
        ("Funcionamiento y medición de métricas", [(13, 16)]),
    ]),
    ("Monitoreo y control", "#6b7a8f", [
        ("Elaboración del informe", [(9, 12)]),
        ("Revisión de avance por incremento", [(3, 3), (5, 5), (7, 7), (9, 9), (11, 11)]),
    ]),
]
HITOS = [(7, "Reserva en línea operativa (OE1)"), (11, "Sistema completo"), (12, "Puesta en marcha"), (16, "Medición de métricas")]

W, X0, Y0, FILA = 1600, 470, 120, 38
CW = (W - X0 - 30) / SEMANAS
filas = sum(1 + len(t) for _, _, t in ETAPAS)
H = Y0 + filas * FILA + 150
AZUL, GRIS, LINEA = "#12355b", "#333", "#d5dde3"
out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="DejaVu Sans, Arial, sans-serif">',
       f'<rect width="{W}" height="{H}" fill="#fff"/>',
       f'<text x="{W/2}" y="46" text-anchor="middle" font-size="30" font-weight="bold" fill="{AZUL}">Cronograma del proyecto – Consulta Dr. Cleomenes García</text>']

# cabecera de semanas
for s in range(SEMANAS):
    x = X0 + s * CW
    fondo = "#eef4f6" if s < 12 else "#fbf1e4"
    out.append(f'<rect x="{x}" y="{Y0-44}" width="{CW}" height="{filas*FILA+44}" fill="{fondo}" stroke="{LINEA}"/>')
    out.append(f'<text x="{x+CW/2}" y="{Y0-16}" text-anchor="middle" font-size="15" font-weight="bold" fill="{AZUL}">S{s+1}</text>')
out.append(f'<text x="30" y="{Y0-16}" font-size="16" font-weight="bold" fill="{AZUL}">Etapa / tarea</text>')

y = Y0
for etapa, color, tareas in ETAPAS:
    out.append(f'<rect x="20" y="{y}" width="{W-50}" height="{FILA}" fill="{color}" opacity="0.12"/>')
    out.append(f'<text x="30" y="{y+25}" font-size="17" font-weight="bold" fill="{color}">{escape(etapa)}</text>')
    y += FILA
    for tarea, tramos in tareas:
        out.append(f'<line x1="20" y1="{y+FILA}" x2="{W-30}" y2="{y+FILA}" stroke="{LINEA}"/>')
        out.append(f'<text x="44" y="{y+25}" font-size="15" fill="{GRIS}">{escape(tarea)}</text>')
        for a, b in tramos:
            out.append(f'<rect x="{X0+(a-1)*CW+4}" y="{y+8}" width="{(b-a+1)*CW-8}" height="{FILA-16}" rx="6" fill="{color}"/>')
        y += FILA

# hitos
yh = y + 30
for s, texto in HITOS:
    cx = X0 + (s - 0.5) * CW
    out.append(f'<line x1="{cx}" y1="{Y0-44}" x2="{cx}" y2="{yh-12}" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="5,4"/>')
    out.append(f'<polygon points="{cx},{yh-12} {cx+10},{yh} {cx},{yh+12} {cx-10},{yh}" fill="#c0392b"/>')
ley = "   ◆ ".join(f"S{s}: {t}" for s, t in HITOS)
out.append(f'<text x="30" y="{yh+5}" font-size="16" font-weight="bold" fill="#c0392b">Hitos</text>')
out.append(f'<text x="30" y="{yh+45}" font-size="15" fill="{GRIS}">◆ {escape(ley)}</text>')
out.append(f'<text x="30" y="{yh+75}" font-size="14" fill="{GRIS}">Semanas 1 a 12: desarrollo del proyecto.  Semanas 13 a 16 (fondo anaranjado): primer mes de funcionamiento, en el que se miden las métricas de los objetivos específicos.</text>')
out.append('</svg>')
open("cronograma.svg", "w", encoding="utf-8").write("\n".join(out))
print(W, H)
