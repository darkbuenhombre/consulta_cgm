# Genera roadmap.svg (Product Roadmap por fases). Ejecutar: python3 roadmap.py
from html import escape

AZUL, GRIS = "#12355b", "#333"
# (fase, periodo, color, estado, objetivo, [entregables], métrica de éxito)
FASES = [
    ("Fundamentos", "Semanas 1–3", "#12355b", "Completada",
     "Definir el problema|y diseñar la solución",
     ["Problema, objetivos y", "requerimientos", "Arquitectura y modelo", "de datos (PostgreSQL)", "Entorno de desarrollo"],
     "Diseño aprobado|para construir"),
    ("Versión 1.0", "Semanas 4–11", "#1b8a9a", "Completada",
     "Reserva en línea y|gestión interna digital",
     ["Inc. 1: sitio público", "y reservas (OE1, OE2)", "Inc. 2: panel de", "administración (OE5)", "Inc. 3: inventario (OE3)", "Inc. 4: notificaciones", "por correo (OE4)"],
     "31 de 31 pruebas|automatizadas aprobadas"),
    ("Puesta en marcha", "Semanas 12–16", "#d08a2c", "Pendiente",
     "Sistema en uso real|en la consulta",
     ["Aviso de privacidad", "(Ley 21.719)", "Respaldo semanal de datos", "Publicación con HTTPS", "Capacitación del", "personal"],
     "Métricas de los OE|medidas en el 1.er mes"),
    ("Versión 1.1", "Después del 1.er mes", "#6b7a8f", "Propuesta",
     "Mejorar la captación|de pacientes",
     ["Página informativa", "del doctor", "Mejora del diseño visual", "Precios en el formulario", "Aviso al odontólogo", "de nuevas reservas"],
     "Más pacientes nuevos|captados por la web"),
    ("Versión 2.0", "Futuro", "#999999", "Fuera de alcance",
     "Escalar la gestión|de la consulta",
     ["Versión para celular", "Recordatorios previos", "a la cita", "Varios odontólogos", "y perfiles de personal", "Descuento de insumos", "por procedimiento"],
     "Menos inasistencias|y menos tareas manuales"),
]

W, H, X0, CW = 1600, 700, 40, 304
out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="DejaVu Sans, Arial, sans-serif">',
       f'<rect width="{W}" height="{H}" fill="#fff"/>',
       f'<text x="{W/2}" y="46" text-anchor="middle" font-size="30" font-weight="bold" fill="{AZUL}">Product Roadmap – Consulta Dr. Cleomenes García</text>',
       f'<line x1="{X0}" y1="120" x2="{W-40}" y2="120" stroke="{AZUL}" stroke-width="5"/>',
       f'<polygon points="{W-40},108 {W-15},120 {W-40},132" fill="{AZUL}"/>']

def texto(x, y, lineas, size=15, color=GRIS, bold=False):
    peso = ' font-weight="bold"' if bold else ""
    for i, t in enumerate(lineas):
        out.append(f'<text x="{x}" y="{y + i*(size+5)}" text-anchor="middle" font-size="{size}"{peso} fill="{color}">{escape(t)}</text>')

for i, (fase, periodo, color, estado, objetivo, entregables, metrica) in enumerate(FASES):
    x = X0 + i * CW
    cx = x + (CW - 16) / 2
    out.append(f'<circle cx="{cx}" cy="120" r="14" fill="{color}" stroke="#fff" stroke-width="4"/>')
    texto(cx, 88, [periodo], 15, color, True)
    out.append(f'<rect x="{x}" y="150" width="{CW-16}" height="520" rx="14" fill="#fff" stroke="{color}" stroke-width="2"/>')
    out.append(f'<rect x="{x}" y="150" width="{CW-16}" height="80" rx="14" fill="{color}"/>')
    out.append(f'<rect x="{x}" y="210" width="{CW-16}" height="20" fill="{color}"/>')
    texto(cx, 184, [fase], 22, "#fff", True)
    texto(cx, 213, [estado], 15, "#fff")
    texto(cx, 262, ["OBJETIVO"], 13, color, True)
    texto(cx, 288, objetivo.split("|"), 16, AZUL, True)
    out.append(f'<line x1="{x+20}" y1="335" x2="{x+CW-36}" y2="335" stroke="#ddd"/>')
    texto(cx, 362, ["ENTREGABLES"], 13, color, True)
    texto(cx, 392, entregables, 15)
    out.append(f'<line x1="{x+20}" y1="560" x2="{x+CW-36}" y2="560" stroke="#ddd"/>')
    texto(cx, 587, ["MÉTRICA DE ÉXITO"], 13, color, True)
    texto(cx, 615, metrica.split("|"), 15, AZUL, True)
out.append('</svg>')
open("roadmap.svg", "w", encoding="utf-8").write("\n".join(out))
