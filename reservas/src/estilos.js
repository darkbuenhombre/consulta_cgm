// Estilos compartidos entre páginas.
export const VERDE = "#2C5F4A"

export const contenedor = { maxWidth: "700px", margin: "0 auto", padding: "24px" }

export const botonPrincipal = {
  marginTop: "24px",
  padding: "14px 28px",
  backgroundColor: VERDE,
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  cursor: "pointer",
  width: "100%"
}

export const botonChico = {
  padding: "6px 12px",
  backgroundColor: VERDE,
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
}

export const botonSecundario = {
  ...botonChico,
  backgroundColor: "white",
  color: VERDE,
  border: `1px solid ${VERDE}`
}

export const input = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc"
}

export const mensajeError = {
  marginTop: "16px",
  padding: "12px",
  borderRadius: "8px",
  backgroundColor: "#fdecea",
  color: "#a12622"
}

export const tarjeta = {
  padding: "20px",
  borderRadius: "10px",
  border: `1px solid ${VERDE}`,
  backgroundColor: "#f3f8f5"
}
