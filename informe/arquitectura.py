# Genera arquitectura.svg (cliente-servidor en tres capas). Ejecutar: python3 arquitectura.py
from html import escape

W, H = 1600, 900
AZUL, TEAL, CLARO, GRIS = "#12355b", "#1b8a9a", "#e8f3f5", "#333"
out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="DejaVu Sans, Arial, sans-serif">',
       f'<rect width="{W}" height="{H}" fill="#fff"/>',
       '<defs><marker id="f" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
       f'<path d="M0,0 L10,5 L0,10 z" fill="{AZUL}"/></marker></defs>',
       f'<text x="{W/2}" y="48" text-anchor="middle" font-size="30" font-weight="bold" fill="{AZUL}">Arquitectura del sistema – Consulta Dr. Cleomenes García</text>']

def capa(x, y, w, h, titulo, sub):
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="{CLARO}" stroke="{TEAL}" stroke-width="2"/>')
    out.append(f'<text x="{x+w/2}" y="{y+36}" text-anchor="middle" font-size="22" font-weight="bold" fill="{AZUL}">{escape(titulo)}</text>')
    out.append(f'<text x="{x+w/2}" y="{y+62}" text-anchor="middle" font-size="16" fill="{GRIS}">{escape(sub)}</text>')

def caja(x, y, w, h, titulo, lineas, color=TEAL):
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#fff" stroke="{color}" stroke-width="2"/>')
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="34" rx="10" fill="{color}"/>')
    out.append(f'<rect x="{x}" y="{y+20}" width="{w}" height="14" fill="{color}"/>')
    out.append(f'<text x="{x+w/2}" y="{y+23}" text-anchor="middle" font-size="16" font-weight="bold" fill="#fff">{escape(titulo)}</text>')
    for i, t in enumerate(lineas):
        out.append(f'<text x="{x+14}" y="{y+58+i*22}" font-size="15" fill="{GRIS}">{escape(t)}</text>')

def flecha(x1, y1, x2, y2, texto="", dy=-10, doble=False, dx=0):
    ini = ' marker-start="url(#f)"' if doble else ""
    out.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{AZUL}" stroke-width="3" marker-end="url(#f)"{ini}/>')
    if texto:
        partes = texto.split("|")
        cx, cy = (x1+x2)/2 + dx, (y1+y2)/2 + dy
        out.append(f'<rect x="{cx-72}" y="{cy-17}" width="144" height="{len(partes)*19+8}" rx="6" fill="#fff" stroke="{AZUL}" stroke-width="1"/>')
        for i, t in enumerate(partes):
            out.append(f'<text x="{cx}" y="{cy+i*19}" text-anchor="middle" font-size="15" font-weight="bold" fill="{AZUL}">{escape(t)}</text>')

# Usuarios
caja(40, 150, 200, 80, "Paciente", ["Navegador web"], AZUL)
caja(40, 560, 200, 80, "Odontólogo", ["Navegador web"], AZUL)

# Capa de presentación
capa(300, 90, 380, 770, "Capa de presentación", "React · navegador")
caja(325, 175, 330, 200, "Sitio público", ["Formulario de reserva:", " servicio, fecha, hora", " y datos del paciente", "Cancelación por enlace", " personal"])
caja(325, 400, 330, 250, "Panel de administración", ["Inicio de sesión", "Reservas", "Servicios", "Horario y días bloqueados", "Inventario y alertas", "", "(token guardado en el navegador)"])
caja(325, 675, 330, 110, "api.js", ["Cliente HTTP compartido por", "ambas interfaces (fetch + JSON)"])

# Capa de lógica de negocio
capa(780, 90, 420, 770, "Capa de lógica de negocio", "Node.js · Express · API REST")
caja(805, 175, 370, 120, "Middleware", ["CORS", "Límite de intentos por IP", "Autenticación JWT (rutas admin)"])
caja(805, 315, 370, 150, "Rutas (API REST)", ["/api — servicios, disponibilidad,", "   reservas y cancelación", "/api/auth — inicio de sesión", "/api/admin — gestión e inventario"])
caja(805, 485, 370, 80, "Validación", ["Zod: datos de entrada y RUT"])
caja(805, 585, 370, 150, "Servicios", ["agenda: disponibilidad de horas", "inventario: stock y alertas", "email: confirmación y", "   cancelación"])
caja(805, 755, 370, 80, "Manejo central de errores", ["Respuestas JSON con mensaje claro"])

# Capa de datos y servicios externos
capa(1300, 90, 270, 520, "Capa de datos", "PostgreSQL")
caja(1320, 175, 230, 410, "Tablas", ["servicios", "horario_semanal", "dias_bloqueados", "pacientes", "reservas", "admin", "materials", "stock_adjustments", "", "Índice único:", "una reserva por", "fecha y hora"])
capa(1300, 650, 270, 210, "Servicio externo", "")
caja(1320, 700, 230, 110, "Gmail (SMTP)", ["Envío de correos", "al paciente"], AZUL)

# Flechas
flecha(240, 190, 325, 260)
flecha(240, 600, 325, 520)
out.append(f'<polyline points="325,330 312,330 312,730 325,730" fill="none" stroke="{AZUL}" stroke-width="3" marker-end="url(#f)"/>')
flecha(490, 650, 490, 675)
flecha(655, 730, 805, 400, "HTTP|JSON", dy=-20, doble=True)
flecha(990, 295, 990, 315)
flecha(990, 465, 990, 485)
flecha(990, 565, 990, 585)
flecha(1175, 640, 1320, 380, "SQL|parametrizado", dy=0, doble=True)
flecha(1175, 700, 1320, 755, "Nodemailer", dy=50, dx=0)

out.append('</svg>')
open("arquitectura.svg", "w", encoding="utf-8").write("\n".join(out))
