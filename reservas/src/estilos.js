// Estilos compartidos entre páginas. Los valores vienen de los tokens de index.css.
export const AZUL = "var(--azul-600)"

export const contenedor = { maxWidth: "700px", margin: "0 auto", padding: "var(--esp-6) var(--esp-4) var(--esp-7)" }

const botonBase = {
  border: "1px solid transparent",
  borderRadius: "var(--radio-sm)",
  fontWeight: 600,
  cursor: "pointer",
  lineHeight: 1.2
}

export const botonPrincipal = {
  ...botonBase,
  marginTop: "var(--esp-5)",
  padding: "14px 28px",
  backgroundColor: "var(--accion)",
  color: "var(--texto-sobre-azul)",
  fontSize: "var(--texto-base)",
  width: "100%",
  boxShadow: "var(--sombra-sm)"
}

export const botonChico = {
  ...botonBase,
  padding: "8px 14px",
  minHeight: "36px",
  backgroundColor: "var(--accion)",
  color: "var(--texto-sobre-azul)",
  fontSize: "var(--texto-sm)"
}

export const botonSecundario = {
  ...botonChico,
  backgroundColor: "var(--accion-suave)",
  color: "var(--accion)",
  borderColor: "var(--borde-control)"
}

// Para acciones destructivas (eliminar, cancelar una hora).
export const botonPeligro = {
  ...botonSecundario,
  color: "var(--peligro)",
  borderColor: "var(--peligro)"
}

// Los campos ya tienen su estilo en index.css; esto queda para ajustes puntuales.
export const input = {}

export const mensajeError = {
  marginTop: "var(--esp-4)",
  padding: "var(--esp-3) var(--esp-4)",
  borderRadius: "var(--radio-sm)",
  backgroundColor: "var(--error-fondo)",
  color: "var(--error)",
  borderLeft: "3px solid var(--error)"
}

export const mensajeExito = { color: "var(--exito)", fontWeight: 500 }

export const textoSuave = { color: "var(--texto-suave)" }

export const tarjeta = {
  padding: "var(--esp-5)",
  borderRadius: "var(--radio-md)",
  border: "1px solid var(--borde)",
  backgroundColor: "var(--fondo)",
  boxShadow: "var(--sombra-md)"
}
