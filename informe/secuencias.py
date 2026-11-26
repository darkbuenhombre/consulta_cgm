# Genera los diagramas de secuencia UML (secuencia_cuXX.svg). Ejecutar: python3 secuencias.py
from html import escape

AZUL, TEAL, GRIS = "#12355b", "#1b8a9a", "#333"
W = 1600

# Mensajes: ("msg", de, a, texto) llamada | ("ret", de, a, texto) respuesta | ("self", p, texto)
# Fragmentos: ("alt"/"opt"/"loop", guardia) ... ("else", guardia) ... ("end",)
DIAGRAMAS = {
    "secuencia_cu02": ("CU02 – Reservar hora",
        [("pac", "Paciente", "actor"), ("ui", "Interfaz web|(React)", "obj"), ("api", "API|(Express)", "obj"),
         ("bd", "Base de datos|(PostgreSQL)", "obj"), ("mail", "Gmail|(SMTP)", "obj")],
        [("msg", "pac", "ui", "Selecciona servicio y fecha"),
         ("msg", "ui", "api", "GET /api/disponibilidad?fecha"),
         ("msg", "api", "bd", "Horario del día, días bloqueados y reservas"),
         ("ret", "bd", "api", "Tramos, bloqueo y horas ocupadas"),
         ("self", "api", "Calcular bloques disponibles"),
         ("ret", "api", "ui", "Lista de horarios"),
         ("msg", "pac", "ui", "Elige hora, ingresa datos y confirma"),
         ("msg", "ui", "api", "POST /api/reservas"),
         ("self", "api", "Validar datos (Zod) y RUT"),
         ("alt", "datos inválidos"),
         ("ret", "api", "ui", "400: mensaje de error"),
         ("else", "datos válidos"),
         ("msg", "api", "bd", "BEGIN; verificar servicio y bloque libre"),
         ("alt", "el bloque ya fue tomado"),
         ("ret", "api", "ui", "409: horario no disponible"),
         ("else", "el bloque está libre"),
         ("msg", "api", "bd", "INSERT paciente (o actualizar por RUT) e INSERT reserva; COMMIT"),
         ("ret", "bd", "api", "Reserva creada (estado pendiente)"),
         ("msg", "api", "mail", "Enviar correo de confirmación con enlace de cancelación"),
         ("ret", "api", "ui", "201: datos de la reserva"),
         ("ret", "ui", "pac", "Muestra la confirmación"),
         ("end",), ("end",)]),
    "secuencia_cu03": ("CU03 – Cancelar reserva",
        [("pac", "Paciente", "actor"), ("ui", "Interfaz web|(React)", "obj"), ("api", "API|(Express)", "obj"),
         ("bd", "Base de datos|(PostgreSQL)", "obj"), ("mail", "Gmail|(SMTP)", "obj")],
        [("msg", "pac", "ui", "Abre el enlace del correo"),
         ("msg", "ui", "api", "GET /api/reservas/cancelar/:token"),
         ("msg", "api", "bd", "Buscar reserva por token"),
         ("ret", "bd", "api", "Reserva"),
         ("alt", "token inválido o inexistente"),
         ("ret", "api", "ui", "404: reserva no encontrada"),
         ("else", "reserva encontrada"),
         ("ret", "api", "ui", "Servicio, fecha, hora y si es cancelable"),
         ("msg", "pac", "ui", "Confirma la cancelación"),
         ("msg", "ui", "api", "POST /api/reservas/cancelar/:token"),
         ("alt", "ya cancelada, completada o con hora pasada"),
         ("ret", "api", "ui", "409: ya no se puede cancelar"),
         ("else", "pendiente o confirmada y futura"),
         ("msg", "api", "bd", "UPDATE estado = 'cancelada'"),
         ("msg", "api", "mail", "Enviar correo de cancelación"),
         ("ret", "api", "ui", "Reserva cancelada"),
         ("ret", "ui", "pac", "Muestra la cancelación"),
         ("end",), ("end",)]),
    "secuencia_cu04": ("CU04 – Iniciar sesión",
        [("odo", "Odontólogo", "actor"), ("ui", "Interfaz web|(React)", "obj"), ("api", "API|(Express)", "obj"),
         ("bd", "Base de datos|(PostgreSQL)", "obj")],
        [("msg", "odo", "ui", "Ingresa correo y contraseña"),
         ("msg", "ui", "api", "POST /api/auth/login"),
         ("alt", "más de 10 intentos en 15 minutos desde la IP"),
         ("ret", "api", "ui", "429: espera 15 minutos"),
         ("else", "dentro del límite"),
         ("msg", "api", "bd", "Buscar administrador por correo"),
         ("ret", "bd", "api", "Hash de la contraseña"),
         ("self", "api", "Comparar contraseña (bcrypt)"),
         ("alt", "credenciales incorrectas"),
         ("ret", "api", "ui", "401: correo o contraseña incorrectos"),
         ("else", "credenciales correctas"),
         ("self", "api", "Firmar token JWT (8 horas)"),
         ("ret", "api", "ui", "Token de sesión"),
         ("self", "ui", "Guardar token en el navegador"),
         ("ret", "ui", "odo", "Muestra el panel de administración"),
         ("end",), ("end",)]),
    "secuencia_cu07": ("CU07 – Bloquear un día sin atención",
        [("odo", "Odontólogo", "actor"), ("ui", "Interfaz web|(React)", "obj"), ("api", "API|(Express)", "obj"),
         ("bd", "Base de datos|(PostgreSQL)", "obj")],
        [("msg", "odo", "ui", "Ingresa fecha y motivo, y presiona Bloquear día"),
         ("msg", "ui", "api", "POST /api/admin/dias-bloqueados (con token)"),
         ("self", "api", "Verificar token JWT y validar fecha"),
         ("msg", "api", "bd", "Contar reservas pendientes o confirmadas de la fecha"),
         ("ret", "bd", "api", "Cantidad de reservas activas"),
         ("alt", "hay reservas activas"),
         ("ret", "api", "ui", "409: tiene N reservas activas, cancélalas primero"),
         ("ret", "ui", "odo", "Muestra el aviso"),
         ("else", "no hay reservas activas"),
         ("msg", "api", "bd", "INSERT día bloqueado"),
         ("ret", "api", "ui", "201: día bloqueado"),
         ("ret", "ui", "odo", "Agrega el día a la lista"),
         ("end",)]),
    "secuencia_cu08": ("CU08 – Ajustar stock de un material",
        [("odo", "Odontólogo", "actor"), ("ui", "Interfaz web|(React)", "obj"), ("api", "API|(Express)", "obj"),
         ("bd", "Base de datos|(PostgreSQL)", "obj")],
        [("msg", "odo", "ui", "Presiona Ajustar stock e ingresa cantidad y motivo"),
         ("msg", "ui", "api", "POST /api/admin/materials/:id/adjust (con token)"),
         ("self", "api", "Verificar token y validar cantidad y motivo"),
         ("msg", "api", "bd", "BEGIN; UPDATE stock si el material está activo y no queda negativo"),
         ("alt", "el stock quedaría negativo"),
         ("ret", "api", "ui", "409: el stock no puede quedar negativo"),
         ("else", "ajuste válido"),
         ("msg", "api", "bd", "INSERT movimiento (cantidad, motivo, usuario); COMMIT"),
         ("ret", "bd", "api", "Material con stock y alertas actualizadas"),
         ("ret", "api", "ui", "Material actualizado"),
         ("ret", "ui", "odo", "Actualiza la lista y las alertas"),
         ("end",)]),
}

PASO, PASO_SELF, Y_CAB = 50, 62, 150

def dibujar(nombre, titulo, participantes, mensajes):
    n = len(participantes)
    xs = {pid: 150 + i * (W - 300) / (n - 1) for i, (pid, _, _) in enumerate(participantes)}
    out, frames, y = [], [], Y_CAB + 70

    def texto(x, yy, t, size=15, color=GRIS, anchor="middle", bold=False):
        peso = ' font-weight="bold"' if bold else ""
        out.append(f'<text x="{x}" y="{yy}" text-anchor="{anchor}" font-size="{size}"{peso} fill="{color}" stroke="#fff" stroke-width="4" paint-order="stroke">{escape(t)}</text>')

    for m in mensajes:
        tipo = m[0]
        if tipo in ("alt", "opt", "loop"):
            frames.append({"tipo": tipo, "y0": y - 8, "partes": [(y - 8, m[1])], "prof": len(frames)})
            y += 34
        elif tipo == "else":
            frames[-1]["partes"].append((y - 8, m[1]))
            y += 34
        elif tipo == "end":
            f = frames.pop()
            x0, x1 = 40 + f["prof"] * 14, W - 40 - f["prof"] * 14
            out.append(f'<rect x="{x0}" y="{f["y0"]}" width="{x1-x0}" height="{y-f["y0"]}" fill="none" stroke="{TEAL}" stroke-width="1.6"/>')
            out.append(f'<path d="M{x0},{f["y0"]} h62 v20 l-10,10 h-52 z" fill="#e8f3f5" stroke="{TEAL}" stroke-width="1.6"/>')
            texto(x0 + 26, f["y0"] + 20, f["tipo"], 15, TEAL, bold=True)
            for i, (yp, guardia) in enumerate(f["partes"]):
                if i > 0:
                    out.append(f'<line x1="{x0}" y1="{yp}" x2="{x1}" y2="{yp}" stroke="{TEAL}" stroke-width="1.4" stroke-dasharray="8,5"/>')
                texto(x0 + 76 if i == 0 else x0 + 12, yp + 20, f"[{guardia}]", 14, TEAL, "start", True)
            y += 14
        elif tipo == "self":
            x = xs[m[1]]
            out.append(f'<path d="M{x},{y} h46 v24 h-40" fill="none" stroke="{GRIS}" stroke-width="1.8"/>')
            out.append(f'<polygon points="{x+6},{y+24} {x+16},{y+19} {x+16},{y+29}" fill="{GRIS}"/>')
            texto(x + 56, y + 17, m[2], 14, anchor="start")
            y += PASO_SELF
        else:
            x1, x2 = xs[m[1]], xs[m[2]]
            d = 1 if x2 > x1 else -1
            if tipo == "msg":
                out.append(f'<line x1="{x1}" y1="{y}" x2="{x2 - d*10}" y2="{y}" stroke="{GRIS}" stroke-width="1.8"/>')
                out.append(f'<polygon points="{x2},{y} {x2 - d*12},{y-6} {x2 - d*12},{y+6}" fill="{GRIS}"/>')
            else:
                out.append(f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="{GRIS}" stroke-width="1.5" stroke-dasharray="7,5"/>')
                out.append(f'<path d="M{x2 - d*12},{y-6} L{x2},{y} L{x2 - d*12},{y+6}" fill="none" stroke="{GRIS}" stroke-width="1.5"/>')
            texto((x1 + x2) / 2, y - 8, m[3], 14)
            y += PASO

    H = y + 60
    cab = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="DejaVu Sans, Arial, sans-serif">',
           f'<rect width="{W}" height="{H}" fill="#fff"/>']
    texto_titulo = f'<text x="{W/2}" y="46" text-anchor="middle" font-size="28" font-weight="bold" fill="{AZUL}">Diagrama de secuencia – {escape(titulo)}</text>'
    vidas = []
    for pid, etiqueta, tipo in participantes:
        x = xs[pid]
        vidas.append(f'<line x1="{x}" y1="{Y_CAB+20}" x2="{x}" y2="{H-30}" stroke="#9aa7b3" stroke-width="1.5" stroke-dasharray="6,6"/>')
        lineas = etiqueta.split("|")
        if tipo == "actor":
            vidas.append(f'<g stroke="{AZUL}" stroke-width="3" fill="none"><circle cx="{x}" cy="{Y_CAB-62}" r="13"/>'
                         f'<line x1="{x}" y1="{Y_CAB-49}" x2="{x}" y2="{Y_CAB-15}"/><line x1="{x-22}" y1="{Y_CAB-38}" x2="{x+22}" y2="{Y_CAB-38}"/>'
                         f'<line x1="{x}" y1="{Y_CAB-15}" x2="{x-18}" y2="{Y_CAB+8}"/><line x1="{x}" y1="{Y_CAB-15}" x2="{x+18}" y2="{Y_CAB+8}"/></g>')
            vidas.append(f'<text x="{x}" y="{Y_CAB+30}" text-anchor="middle" font-size="16" font-weight="bold" fill="{AZUL}" stroke="#fff" stroke-width="5" paint-order="stroke">{escape(lineas[0])}</text>')
        else:
            vidas.append(f'<rect x="{x-110}" y="{Y_CAB-70}" width="220" height="66" rx="8" fill="{AZUL}"/>')
            for i, t in enumerate(lineas):
                vidas.append(f'<text x="{x}" y="{Y_CAB-42+i*22}" text-anchor="middle" font-size="16" font-weight="bold" fill="#fff">{escape(t)}</text>')
    svg = "\n".join(cab + [texto_titulo] + vidas + out + ["</svg>"])
    open(f"{nombre}.svg", "w", encoding="utf-8").write(svg)
    return H

for nombre, (titulo, participantes, mensajes) in DIAGRAMAS.items():
    print(nombre, dibujar(nombre, titulo, participantes, mensajes))
