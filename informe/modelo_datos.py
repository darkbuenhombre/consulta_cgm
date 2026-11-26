# Genera modelo_datos.svg (modelo entidad-relación de PostgreSQL). Ejecutar: python3 modelo_datos.py
from html import escape

AZUL, TEAL, NARANJA, GRIS = "#12355b", "#1b8a9a", "#d08a2c", "#333"
W, H, ANCHO, CAB, FILA = 1600, 1010, 430, 40, 26

# nombre: (x, y, color, [(columna, tipo, clave)])
TABLAS = {
    "pacientes": (40, 100, TEAL, [("id", "SERIAL", "PK"), ("rut", "TEXT", "UQ"), ("nombre", "TEXT", ""),
        ("apellido_paterno", "TEXT", ""), ("apellido_materno", "TEXT", ""), ("telefono", "TEXT", ""),
        ("email", "TEXT", ""), ("creado_en", "TIMESTAMPTZ", "")]),
    "reservas": (585, 100, TEAL, [("id", "SERIAL", "PK"), ("paciente_id", "INTEGER", "FK"), ("servicio_id", "INTEGER", "FK"),
        ("fecha", "DATE", "UQ*"), ("hora", "TIME", "UQ*"), ("estado", "TEXT", ""), ("token_cancelacion", "UUID", "UQ"),
        ("creado_en", "TIMESTAMPTZ", "")]),
    "servicios": (1130, 100, TEAL, [("id", "SERIAL", "PK"), ("codigo", "TEXT", "UQ"), ("nombre", "TEXT", ""),
        ("duracion_min", "INTEGER", ""), ("precio", "INTEGER", ""), ("activo", "BOOLEAN", "")]),
    "horario_semanal": (1130, 330, TEAL, [("id", "SERIAL", "PK"), ("dia_semana", "SMALLINT", ""), ("hora_inicio", "TIME", ""),
        ("hora_fin", "TIME", ""), ("intervalo_min", "INTEGER", "")]),
    "dias_bloqueados": (1130, 535, TEAL, [("fecha", "DATE", "PK"), ("motivo", "TEXT", "")]),
    "materials": (40, 420, NARANJA, [("id", "SERIAL", "PK"), ("name", "TEXT", ""), ("category", "TEXT", ""), ("sku", "TEXT", "UQ"),
        ("unit", "TEXT", ""), ("quantity_on_hand", "INTEGER", ""), ("minimum_threshold", "INTEGER", ""), ("expiry_date", "DATE", ""),
        ("supplier", "TEXT", ""), ("unit_cost", "NUMERIC(10,2)", ""), ("active", "BOOLEAN", ""), ("created_at", "TIMESTAMPTZ", ""),
        ("updated_at", "TIMESTAMPTZ", ""), ("updated_by", "INTEGER", "FK")]),
    "stock_adjustments": (585, 420, NARANJA, [("id", "SERIAL", "PK"), ("material_id", "INTEGER", "FK"), ("delta", "INTEGER", ""),
        ("reason", "TEXT", ""), ("user_id", "INTEGER", "FK"), ("created_at", "TIMESTAMPTZ", "")]),
    "admin": (1130, 680, AZUL, [("id", "SERIAL", "PK"), ("email", "TEXT", "UQ"), ("password_hash", "TEXT", "")]),
}

def y_col(tabla, col):
    x, y, _, cols = TABLAS[tabla]
    i = [c[0] for c in cols].index(col)
    return y + CAB + i * FILA + FILA / 2

out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="DejaVu Sans, Arial, sans-serif">',
       f'<rect width="{W}" height="{H}" fill="#fff"/>',
       f'<text x="{W/2}" y="46" text-anchor="middle" font-size="30" font-weight="bold" fill="{AZUL}">Modelo de datos – PostgreSQL</text>']

def texto(x, y, t, size=14, color=GRIS, anchor="start", bold=False):
    peso = ' font-weight="bold"' if bold else ""
    out.append(f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="{size}"{peso} fill="{color}" stroke="#fff" stroke-width="4" paint-order="stroke">{escape(t)}</text>')

# Relaciones (dibujadas primero, quedan detrás de las tablas)
def relacion(puntos, uno, muchos):
    out.append(f'<polyline points="{" ".join(f"{x},{y}" for x, y in puntos)}" fill="none" stroke="{GRIS}" stroke-width="2"/>')
    (x1, y1), (x2, y2) = puntos[0], puntos[-1]
    texto(x1 + uno[0], y1 + uno[1], "1", 16, GRIS, "middle", True)
    texto(x2 + muchos[0], y2 + muchos[1], "N", 16, GRIS, "middle", True)

xp, xr, xs = TABLAS["pacientes"][0], TABLAS["reservas"][0], TABLAS["servicios"][0]
relacion([(xp + ANCHO, y_col("pacientes", "id")), (xp + ANCHO + 30, y_col("pacientes", "id")),
          (xp + ANCHO + 30, y_col("reservas", "paciente_id")), (xr, y_col("reservas", "paciente_id"))], (12, -8), (-12, -8))
relacion([(xs, y_col("servicios", "id")), (xs - 30, y_col("servicios", "id")),
          (xs - 30, y_col("reservas", "servicio_id")), (xr + ANCHO, y_col("reservas", "servicio_id"))], (-12, -8), (12, -8))
xm, xa, xad = TABLAS["materials"][0], TABLAS["stock_adjustments"][0], TABLAS["admin"][0]
relacion([(xm + ANCHO, y_col("materials", "id")), (xm + ANCHO + 30, y_col("materials", "id")),
          (xm + ANCHO + 30, y_col("stock_adjustments", "material_id")), (xa, y_col("stock_adjustments", "material_id"))], (12, -8), (-12, -8))
relacion([(xad, y_col("admin", "id")), (xad - 30, y_col("admin", "id")),
          (xad - 30, y_col("stock_adjustments", "user_id")), (xa + ANCHO, y_col("stock_adjustments", "user_id"))], (-12, -8), (12, -8))
yb = y_col("materials", "updated_by")
y_admin_fondo = TABLAS["admin"][1] + CAB + 3 * FILA
relacion([(xad + ANCHO / 2, y_admin_fondo), (xad + ANCHO / 2, 900), (xm + ANCHO + 55, 900),
          (xm + ANCHO + 55, yb), (xm + ANCHO, yb)], (14, 20), (12, -8))

# Tablas
for nombre, (x, y, color, cols) in TABLAS.items():
    alto = CAB + len(cols) * FILA
    out.append(f'<rect x="{x}" y="{y}" width="{ANCHO}" height="{alto}" rx="8" fill="#fff" stroke="{color}" stroke-width="2"/>')
    out.append(f'<path d="M{x},{y+CAB} v-{CAB-8} a8,8 0 0 1 8,-8 h{ANCHO-16} a8,8 0 0 1 8,8 v{CAB-8} z" fill="{color}"/>')
    texto(x + ANCHO / 2, y + 26, nombre, 17, "#fff", "middle", True)
    out[-1] = out[-1].replace('stroke="#fff" stroke-width="4" ', '')
    for i, (col, tipo, clave) in enumerate(cols):
        yy = y + CAB + i * FILA
        if i % 2:
            out.append(f'<rect x="{x+2}" y="{yy}" width="{ANCHO-4}" height="{FILA}" fill="#f4f7f9"/>')
        texto(x + 14, yy + 18, col, 14, GRIS, bold=clave == "PK")
        texto(x + 230, yy + 18, tipo, 13, "#667")
        if clave:
            c = {"PK": "#c0392b", "FK": TEAL}.get(clave, "#667")
            texto(x + ANCHO - 14, yy + 18, clave, 13, c, "end", True)

texto(40, 935, "PK: clave primaria.  FK: clave foránea.  UQ: valor único.  UQ*: fecha + hora únicas entre las reservas no canceladas (índice reservas_bloque_unico).", 14)
texto(40, 960, "Celeste: agenda.  Anaranjado: inventario.  Azul oscuro: seguridad.  horario_semanal y dias_bloqueados son tablas de configuración, sin relaciones con otras tablas.", 14)
out.append('</svg>')
open("modelo_datos.svg", "w", encoding="utf-8").write("\n".join(out))
