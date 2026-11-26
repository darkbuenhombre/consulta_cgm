# Genera casos_de_uso.svg (diagrama de casos de uso UML). Ejecutar: python3 casos_de_uso.py
from html import escape

W, H = 1600, 1000
RX = 150  # radio horizontal de las elipses
AZUL, TEAL, GRIS = "#12355b", "#1b8a9a", "#333"
out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="DejaVu Sans, Arial, sans-serif">',
       f'<rect width="{W}" height="{H}" fill="#fff"/>',
       '<defs><marker id="f" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="9" markerHeight="9" orient="auto">'
       f'<path d="M0,0 L10,5 L0,10" fill="none" stroke="{GRIS}" stroke-width="1.5"/></marker></defs>',
       f'<text x="{W/2}" y="46" text-anchor="middle" font-size="30" font-weight="bold" fill="{AZUL}">Diagrama de casos de uso – Sistema de reservas e inventario</text>']

def actor(x, y, nombre):
    out.append(f'<g stroke="{AZUL}" stroke-width="3" fill="none">'
               f'<circle cx="{x}" cy="{y-55}" r="16"/><line x1="{x}" y1="{y-39}" x2="{x}" y2="{y+5}"/>'
               f'<line x1="{x-28}" y1="{y-25}" x2="{x+28}" y2="{y-25}"/>'
               f'<line x1="{x}" y1="{y+5}" x2="{x-22}" y2="{y+40}"/><line x1="{x}" y1="{y+5}" x2="{x+22}" y2="{y+40}"/></g>')
    for i, t in enumerate(nombre.split("|")):
        out.append(f'<text x="{x}" y="{y+68+i*21}" text-anchor="middle" font-size="18" font-weight="bold" fill="{AZUL}">{escape(t)}</text>')

CU = {}
def caso(id_, x, y, texto, color=TEAL):
    CU[id_] = (x, y)
    out.append(f'<ellipse cx="{x}" cy="{y}" rx="{RX}" ry="44" fill="#fff" stroke="{color}" stroke-width="2.5"/>')
    lineas = [f"{id_}"] + texto.split("|")
    for i, t in enumerate(lineas):
        peso = ' font-weight="bold"' if i == 0 else ""
        out.append(f'<text x="{x}" y="{y-12+(i-(len(lineas)-2)/2)*19}" text-anchor="middle" font-size="15"{peso} fill="{GRIS}">{escape(t)}</text>')

def linea(x1, y1, x2, y2):
    out.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{GRIS}" stroke-width="1.8"/>')

def relacion(a, b, etiqueta, dx=0, dy=-8):
    (x1, y1), (x2, y2) = CU[a], CU[b]
    # recorta en el borde de las elipses para que la flecha no quede oculta
    import math
    ang = math.atan2(y2 - y1, x2 - x1)
    def borde(x, y, s):
        t = 1 / math.sqrt((math.cos(ang) / RX) ** 2 + (math.sin(ang) / 44) ** 2)
        return x + s * t * math.cos(ang), y + s * t * math.sin(ang)
    sx, sy = borde(x1, y1, 1)
    ex, ey = borde(x2, y2, -1)
    out.append(f'<line x1="{sx}" y1="{sy}" x2="{ex}" y2="{ey}" stroke="{GRIS}" stroke-width="1.8" stroke-dasharray="7,5" marker-end="url(#f)"/>')
    out.append(f'<text x="{(sx+ex)/2+dx}" y="{(sy+ey)/2+dy}" text-anchor="middle" font-size="14" fill="{GRIS}">«{etiqueta}»</text>')

# Límite del sistema
out.append(f'<rect x="300" y="80" width="1000" height="890" rx="18" fill="#f5fafb" stroke="{AZUL}" stroke-width="2"/>')
out.append(f'<text x="800" y="114" text-anchor="middle" font-size="19" font-weight="bold" fill="{AZUL}">Sistema web – Consulta Dr. Cleomenes García</text>')

# Casos del paciente (izquierda) y del odontólogo (derecha)
caso("CU01", 520, 200, "Consultar servicios")
caso("CU02", 520, 360, "Reservar hora")
caso("CU03", 460, 560, "Cancelar reserva")
caso("CU04", 1080, 175, "Iniciar sesión")
caso("CU05", 1080, 295, "Gestionar reservas")
caso("CU06", 1080, 415, "Gestionar servicios")
caso("CU07", 1080, 535, "Configurar horario|y días bloqueados")
caso("CU08", 1080, 655, "Gestionar inventario")
caso("CU09", 1080, 775, "Consultar alertas|de inventario")
caso("CU10", 820, 870, "Enviar notificación|por correo", AZUL)

# Actores y asociaciones
actor(130, 360, "Paciente")
for c in ("CU01", "CU02", "CU03"):
    x, y = CU[c]
    linea(165, 330, x - RX, y)
actor(1460, 470, "Odontólogo")
for c in ("CU04", "CU05", "CU06", "CU07", "CU08", "CU09"):
    x, y = CU[c]
    linea(1425, 440, x + RX, y)
actor(130, 830, "Servicio de|correo (Gmail)")
linea(165, 800, CU["CU10"][0] - RX, CU["CU10"][1])

# Relaciones entre casos de uso
relacion("CU02", "CU10", "include", dx=40, dy=0)
relacion("CU03", "CU10", "include", dx=-30, dy=20)
out.append(f'<polyline points="790,{870-44+3} 790,295 {1080-RX},295" fill="none" stroke="{GRIS}" stroke-width="1.8" stroke-dasharray="7,5" marker-end="url(#f)"/>')
out.append(f'<text x="800" y="600" font-size="14" fill="{GRIS}">«extend»</text>')
relacion("CU02", "CU01", "include", dx=50)

out.append(f'<text x="320" y="955" font-size="14" fill="{GRIS}">CU05 a CU09 requieren sesión iniciada (CU04). CU10 extiende CU05 solo cuando el odontólogo cancela una reserva.</text>')
out.append('</svg>')
open("casos_de_uso.svg", "w", encoding="utf-8").write("\n".join(out))
