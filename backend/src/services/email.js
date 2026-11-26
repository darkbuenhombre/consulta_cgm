import nodemailer from "nodemailer"
import config from "../config.js"

// Si no hay cuenta de Gmail configurada, los correos solo se muestran en la consola.
const transporte = config.gmailUser && config.gmailAppPassword
  ? nodemailer.createTransport({
      service: "gmail",
      auth: { user: config.gmailUser, pass: config.gmailAppPassword }
    })
  : null

function escaparHtml(texto) {
  return String(texto).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])
}

function fechaLegible(fecha) {
  const [anio, mes, dia] = fecha.split("-").map(Number)
  return new Date(anio, mes - 1, dia).toLocaleDateString("es-CL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  })
}

async function enviar({ para, asunto, html }) {
  if (!transporte) {
    console.log(`[correo no enviado: falta configurar Gmail] Para: ${para} | Asunto: ${asunto}`)
    return
  }
  await transporte.sendMail({
    from: `"Consulta Dr. Cleomenes García" <${config.gmailUser}>`,
    to: para,
    subject: asunto,
    html
  })
}

function plantilla(contenido) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #222;">
      <h2 style="color: #2C5F4A; margin-bottom: 0;">Dr. Cleomenes García</h2>
      <p style="margin-top: 4px; color: #666;">Odontología General</p>
      ${contenido}
    </div>`
}

// "reserva" tiene la forma que devuelve SELECT_RESERVA (services/agenda.js).
export function enviarConfirmacion(reserva) {
  const enlace = `${config.frontendUrl}/cancelar/${reserva.token_cancelacion}`
  return enviar({
    para: reserva.email,
    asunto: "Tu hora está reservada",
    html: plantilla(`
      <p>Hola ${escaparHtml(reserva.nombre)}, tu hora quedó reservada:</p>
      <ul>
        <li><strong>Servicio:</strong> ${escaparHtml(reserva.servicio)}</li>
        <li><strong>Fecha:</strong> ${fechaLegible(reserva.fecha)}</li>
        <li><strong>Hora:</strong> ${reserva.hora} hrs</li>
      </ul>
      <p>Si no puedes asistir, cancela tu hora desde este enlace:</p>
      <p><a href="${enlace}" style="color: #2C5F4A;">${enlace}</a></p>`)
  })
}

export function enviarCancelacion(reserva) {
  return enviar({
    para: reserva.email,
    asunto: "Tu hora fue cancelada",
    html: plantilla(`
      <p>Hola ${escaparHtml(reserva.nombre)}, tu hora de ${escaparHtml(reserva.servicio)} del
      ${fechaLegible(reserva.fecha)} a las ${reserva.hora} hrs fue cancelada.</p>
      <p>Puedes reservar una nueva hora cuando quieras en <a href="${config.frontendUrl}" style="color: #2C5F4A;">${config.frontendUrl}</a>.</p>`)
  })
}

// Envía un correo sin que un fallo (por ejemplo, Gmail caído) afecte la respuesta de la API.
export async function enviarSinFallar(envio, reserva) {
  try {
    await envio(reserva)
  } catch (error) {
    console.error(`No se pudo enviar el correo a ${reserva.email}:`, error.message)
  }
}
