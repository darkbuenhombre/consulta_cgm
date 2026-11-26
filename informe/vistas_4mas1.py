# Genera vista_desarrollo.svg y vista_fisica.svg (modelo 4+1). Ejecutar: python3 vistas_4mas1.py
from html import escape

AZUL, TEAL, NARANJA, GRIS, CLARO = "#12355b", "#1b8a9a", "#d08a2c", "#333", "#e8f3f5"
W = 1600

def nuevo(H, titulo):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="DejaVu Sans, Arial, sans-serif">',
            f'<rect width="{W}" height="{H}" fill="#fff"/>',
            '<defs><marker id="f" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="9" markerHeight="9" orient="auto">'
            f'<path d="M0,0 L10,5 L0,10" fill="none" stroke="{GRIS}" stroke-width="1.6"/></marker></defs>',
            f'<text x="{W/2}" y="46" text-anchor="middle" font-size="28" font-weight="bold" fill="{AZUL}">{escape(titulo)}</text>']

def texto(out, x, y, t, size=14, color=GRIS, anchor="middle", bold=False):
    peso = ' font-weight="bold"' if bold else ""
    out.append(f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="{size}"{peso} fill="{color}" stroke="#fff" stroke-width="4" paint-order="stroke">{escape(t)}</text>')

def paquete(out, x, y, w, h, nombre, color):
    # pestaña de paquete UML + cuerpo
    out.append(f'<rect x="{x}" y="{y}" width="{len(nombre)*9.5+24}" height="26" fill="{color}"/>')
    out.append(f'<rect x="{x}" y="{y+26}" width="{w}" height="{h-26}" fill="{CLARO}" stroke="{color}" stroke-width="2"/>')
    out.append(f'<text x="{x+10}" y="{y+19}" font-size="15" font-weight="bold" fill="#fff">{escape(nombre)}</text>')

def modulo(out, x, y, w, nombre, detalle="", color=TEAL):
    h = 46 if detalle else 32
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="#fff" stroke="{color}" stroke-width="1.8"/>')
    texto(out, x + w / 2, y + 21, nombre, 14, GRIS, bold=True)
    if detalle:
        texto(out, x + w / 2, y + 38, detalle, 12, "#667")
    return (x, y, w, h)

def dep(out, puntos, etiqueta="", lx=0, ly=-8):
    out.append(f'<polyline points="{" ".join(f"{a},{b}" for a, b in puntos)}" fill="none" stroke="{GRIS}" stroke-width="1.8" stroke-dasharray="7,5" marker-end="url(#f)"/>')
    if etiqueta:
        (x1, y1), (x2, y2) = puntos[-2], puntos[-1]
        texto(out, (x1 + x2) / 2 + lx, (y1 + y2) / 2 + ly, etiqueta, 13, AZUL, bold=True)

# ---------- Vista de desarrollo ----------
H = 900
out = nuevo(H, "Vista de desarrollo – Organización del código")

# Frontend
paquete(out, 40, 90, 620, 720, "reservas/src (React)", TEAL)
modulo(out, 230, 135, 240, "App.js", "rutas de la aplicación")
paquete(out, 60, 210, 580, 150, "pages", TEAL)
for i, p in enumerate(["Reserva", "Cancelar", "AdminLogin", "AdminPanel", "AdminInventario"]):
    modulo(out, 75 + (i % 3) * 188, 250 + (i // 3) * 50, 175, p)
paquete(out, 60, 390, 580, 210, "components", TEAL)
for i, c in enumerate(["Header", "SelectorServicio", "SelectorFecha", "SelectorHora", "DatosPaciente"]):
    modulo(out, 75 + (i % 3) * 188, 430 + (i // 3) * 46, 175, c)
paquete(out, 75, 520, 550, 70, "admin", TEAL)
for i, c in enumerate(["AdminReservas", "AdminServicios", "AdminHorario", "FormMaterial"]):
    modulo(out, 82 + i * 136, 552, 130, c)
modulo(out, 75, 640, 270, "estilos.js", "estilos compartidos")
modulo(out, 365, 640, 270, "api.js", "cliente HTTP y sesión")
paquete(out, 60, 715, 580, 80, "pruebas", TEAL)
modulo(out, 75, 752, 550, "App.test.js", "", TEAL)

# Backend
paquete(out, 760, 90, 800, 720, "backend (Node.js + Express)", AZUL)
modulo(out, 790, 135, 220, "index.js / app.js", "arranque y rutas", AZUL)
modulo(out, 1030, 135, 240, "config.js", "variables de entorno", AZUL)
modulo(out, 1290, 135, 240, "db.js", "conexión y transacciones", AZUL)
paquete(out, 780, 210, 370, 150, "routes", AZUL)
for i, r in enumerate(["publico", "auth", "admin", "inventario"]):
    modulo(out, 795 + (i % 2) * 175, 250 + (i // 2) * 50, 165, r, "", AZUL)
paquete(out, 1170, 210, 370, 150, "middleware", AZUL)
modulo(out, 1185, 250, 340, "auth", "verifica el token JWT", AZUL)
modulo(out, 1185, 305, 340, "limite", "intentos por IP", AZUL)
modulo(out, 780, 390, 370, "validators.js", "esquemas Zod", AZUL)
paquete(out, 780, 450, 370, 150, "services", AZUL)
for i, s in enumerate(["agenda", "inventario", "email"]):
    modulo(out, 795, 490 + i * 34, 340, s, "", AZUL)
paquete(out, 1170, 390, 370, 210, "utils", AZUL)
for i, (u, d) in enumerate([("disponibilidad", "cálculo de bloques"), ("rut", "validación del RUT"), ("errores", "HttpError")]):
    modulo(out, 1185, 430 + i * 54, 340, u, d, AZUL)
paquete(out, 780, 630, 370, 165, "db", NARANJA)
modulo(out, 795, 670, 165, "schema.sql", "", NARANJA)
modulo(out, 970, 670, 165, "seed.sql", "", NARANJA)
modulo(out, 795, 712, 340, "migraciones/001, 002", "", NARANJA)
modulo(out, 795, 754, 340, "scripts: init-db, migrar, crear-admin", "", NARANJA)
paquete(out, 1170, 630, 370, 165, "test", AZUL)
for i, t in enumerate(["rut.test.js", "disponibilidad.test.js", "api.test.js"]):
    modulo(out, 1185, 668 + i * 40, 340, t, "", AZUL)

# Dependencias
dep(out, [(635, 663), (700, 663), (700, 275), (795, 275)], "HTTP / JSON", lx=-47, ly=110)
dep(out, [(965, 360), (965, 390)])
dep(out, [(1150, 285), (1170, 285)])
dep(out, [(1150, 530), (1170, 530)])
texto(out, 40, 850, "Flechas punteadas: dependencia («usa»). Las páginas usan los componentes y api.js; api.js se comunica con las rutas del backend; las rutas usan middleware,", 14, anchor="start")
texto(out, 40, 872, "validación y servicios; los servicios usan utils y db.js. Los paquetes db y test contienen los scripts de la base de datos y las pruebas automatizadas.", 14, anchor="start")
out.append("</svg>")
open("vista_desarrollo.svg", "w", encoding="utf-8").write("\n".join(out))

# ---------- Vista física ----------
H = 760
out = nuevo(H, "Vista física – Despliegue propuesto")

def nodo(x, y, w, h, nombre, estereotipo, color=AZUL):
    d = 16
    out.append(f'<polygon points="{x},{y+d} {x+d},{y} {x+w+d},{y} {x+w+d},{y+h-d} {x+w},{y+h}" fill="#d8e2ea" stroke="{color}" stroke-width="2"/>')
    out.append(f'<rect x="{x}" y="{y+d}" width="{w}" height="{h-d}" fill="#f5fafb" stroke="{color}" stroke-width="2"/>')
    texto(out, x + w / 2, y + d + 24, f"«{estereotipo}»", 13, "#667")
    texto(out, x + w / 2, y + d + 46, nombre, 17, color, bold=True)

def artefacto(x, y, w, nombre, detalle, color=TEAL):
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="58" rx="6" fill="#fff" stroke="{color}" stroke-width="1.8"/>')
    texto(out, x + w / 2, y + 24, nombre, 14, GRIS, bold=True)
    texto(out, x + w / 2, y + 44, detalle, 12, "#667")

def con(puntos, etiqueta, lx=0, ly=-10):
    out.append(f'<polyline points="{" ".join(f"{a},{b}" for a, b in puntos)}" fill="none" stroke="{AZUL}" stroke-width="2.5"/>')
    (x1, y1), (x2, y2) = puntos[0], puntos[-1]
    texto(out, (x1 + x2) / 2 + lx, (y1 + y2) / 2 + ly, etiqueta, 14, AZUL, bold=True)

nodo(40, 110, 300, 150, "Dispositivo del paciente", "device")
artefacto(70, 190, 240, "Navegador web", "computador o celular")
nodo(40, 380, 300, 150, "Equipo del odontólogo", "device")
artefacto(70, 460, 240, "Navegador web", "panel de administración")

nodo(470, 90, 560, 470, "Servidor de aplicación", "execution environment: Linux")
artefacto(510, 180, 480, "Nginx", "HTTPS (certificado TLS) · sirve el build de React · proxy /api")
artefacto(510, 275, 480, "Build de React", "archivos estáticos (npm run build)")
artefacto(510, 370, 480, "API Node.js 22 + Express", "proceso en el puerto 4000 · variables en .env")
artefacto(510, 465, 480, "Tarea programada (cron)", "respaldo diario con pg_dump hacia el servidor de base de datos")

nodo(1160, 110, 400, 260, "Servidor de base de datos", "execution environment: Linux")
artefacto(1200, 200, 320, "PostgreSQL", "base de datos consulta")
artefacto(1200, 290, 320, "Respaldos diarios", "copias fuera del servidor")
nodo(1160, 440, 400, 150, "Gmail", "external system", NARANJA)
artefacto(1200, 520, 320, "Servidor SMTP", "smtp.gmail.com", NARANJA)

con([(340, 230), (510, 210)], "HTTPS 443")
con([(340, 495), (420, 495), (420, 230), (510, 215)], "HTTPS 443", lx=0, ly=0)
con([(990, 388), (1080, 388), (1080, 230), (1200, 230)], "TCP 5432 (SSL)", lx=-15, ly=0)
con([(990, 412), (1110, 412), (1110, 550), (1200, 550)], "SMTP 587 (TLS)", lx=10, ly=20)
# Nginx sirve el build y reenvía /api a la API (por el borde izquierdo, sin tapar textos)
out.append(f'<polyline points="510,222 492,222 492,304 510,304" fill="none" stroke="{GRIS}" stroke-width="1.6" stroke-dasharray="6,5" marker-end="url(#f)"/>')
out.append(f'<polyline points="492,304 492,399 510,399" fill="none" stroke="{GRIS}" stroke-width="1.6" stroke-dasharray="6,5" marker-end="url(#f)"/>')

texto(out, 40, 640, "Despliegue propuesto para la puesta en marcha: el proveedor de hosting aún no está definido. Separa el servidor de aplicación del servidor de base de datos.", 14, anchor="start")
texto(out, 40, 664, "Detrás de Nginx, la API debe activar app.set(\"trust proxy\", 1) para que el límite de intentos identifique la IP real de cada usuario.", 14, anchor="start")
texto(out, 40, 688, "En el ambiente de desarrollo, todos los componentes se ejecutan en un solo equipo (React en el puerto 3000, API en el 4000 y PostgreSQL local).", 14, anchor="start")
out.append("</svg>")
open("vista_fisica.svg", "w", encoding="utf-8").write("\n".join(out))
