# Genera ishikawa.svg (diagrama causa-efecto 6M). Ejecutar: python3 ishikawa.py
from html import escape

EFECTO = ["Baja captación de", "pacientes y gestión", "interna ineficiente"]
# (categoría, [causas]); cada causa puede tener 2 líneas separadas por "|"
ARRIBA = [
    ("MÉTODO", ["Difusión solo por boca a boca", "80% de reservas por|teléfono o WhatsApp", "Agenda e inventario en|cuaderno físico"]),
    ("MANO DE OBRA", ["Doctor dedica ~2 h/semana|a tareas administrativas", "Sin personal dedicado|a difusión", "Falta de tiempo para buscar|nuevos canales de difusión"]),
    ("TECNOLOGÍA", ["Sin sitio web ni|redes sociales", "Sin sistema de reservas|en línea", "Sin alertas automáticas|de stock ni de citas"]),
]
ABAJO = [
    ("MEDIO AMBIENTE", ["Mercado odontológico|saturado", "Competencia de Isapres|y sistema público", "~80% de pacientes busca|en internet antes de elegir"]),
    ("MATERIALES", ["Sobrecompra de insumos|por desconocer el stock", "Stock no visible|en tiempo real", "Sin registro de consumo|por procedimiento"]),
    ("MEDICIÓN", ["No se mide de dónde|llegan los pacientes", "~5 errores de agenda|por trimestre sin registro", "No se mide la satisfacción|del paciente"]),
]

W, H, Y = 1600, 900, 450          # lienzo y altura de la espina
X0S, DX = [300, 680, 1060], 180   # inicio de cada espina y avance horizontal
AZUL, TEAL, GRIS = "#12355b", "#1b8a9a", "#333"
out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="DejaVu Sans, Arial, sans-serif">',
       f'<rect width="{W}" height="{H}" fill="#fff"/>',
       f'<text x="{W/2}" y="48" text-anchor="middle" font-size="30" font-weight="bold" fill="{AZUL}">Diagrama de Ishikawa – Consulta Dr. Cleomenes García</text>',
       f'<line x1="60" y1="{Y}" x2="1265" y2="{Y}" stroke="{AZUL}" stroke-width="6"/>',
       f'<polygon points="1265,{Y-14} 1290,{Y} 1265,{Y+14}" fill="{AZUL}"/>',
       f'<rect x="1295" y="{Y-80}" width="280" height="160" rx="14" fill="{AZUL}"/>']
for i, linea in enumerate(EFECTO):
    out.append(f'<text x="1435" y="{Y-28+i*34}" text-anchor="middle" font-size="22" font-weight="bold" fill="#fff">{escape(linea)}</text>')

def espina(x0, yt, cat, causas):
    out.append(f'<line x1="{x0}" y1="{yt}" x2="{x0+DX}" y2="{Y}" stroke="{TEAL}" stroke-width="4"/>')
    by = yt - 28 if yt < Y else yt + 28   # caja de la categoría en el extremo de la espina
    out.append(f'<rect x="{x0-130}" y="{by-22}" width="260" height="44" rx="10" fill="{TEAL}"/>')
    out.append(f'<text x="{x0}" y="{by+7}" text-anchor="middle" font-size="19" font-weight="bold" fill="#fff">{escape(cat)}</text>')
    for k, causa in enumerate(causas):
        cy = yt + (k + 1) * (Y - yt) / 4
        bx = x0 + DX * (cy - yt) / (Y - yt)
        out.append(f'<line x1="{bx-30}" y1="{cy}" x2="{bx}" y2="{cy}" stroke="{TEAL}" stroke-width="2.5"/>')
        out.append(f'<circle cx="{bx}" cy="{cy}" r="5" fill="{AZUL}"/>')
        lineas = causa.split("|")
        for j, t in enumerate(lineas):
            ty = cy + 6 + (j - (len(lineas) - 1) / 2) * 21
            out.append(f'<text x="{bx-38}" y="{ty}" text-anchor="end" font-size="17" fill="{GRIS}">{escape(t)}</text>')

for x0, (cat, causas) in zip(X0S, ARRIBA):
    espina(x0, 130, cat, causas)
for x0, (cat, causas) in zip(X0S, ABAJO):
    espina(x0, 770, cat, causas)
out.append('</svg>')
open("ishikawa.svg", "w", encoding="utf-8").write("\n".join(out))
