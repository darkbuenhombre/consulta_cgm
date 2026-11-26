import { useState } from "react"

const CAMPOS = [
  ["nombre", "text", "Nombre", "Nombre"],
  ["apellido_paterno", "text", "Apellido Paterno", "Apellido paterno"],
  ["apellido_materno", "text", "Apellido Materno", "Apellido materno"],
  ["rut", "text", "10.333.222-k", "RUT"],
  ["telefono", "tel", "Teléfono", "Teléfono"],
  ["email", "email", "Correo electrónico", "Correo electrónico"]
]

function DatosPaciente({ onCambio }) {
  const [datos, setDatos] = useState({
    nombre: "", apellido_paterno: "",
    apellido_materno: "", rut: "",
    telefono: "", email: ""
  })

  function manejoCambios(e) {
    const nuevosDatos = { ...datos, [e.target.name]: e.target.value }
    setDatos(nuevosDatos)
    onCambio(nuevosDatos)
  }

  return (
    <div>
      <h2>Datos del Paciente</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--esp-3)" }}>
        {CAMPOS.map(([nombre, tipo, placeholder, etiqueta]) => (
          <input key={nombre} type={tipo} name={nombre} placeholder={placeholder} aria-label={etiqueta}
            value={datos[nombre]} onChange={manejoCambios} maxLength={nombre === "rut" ? 12 : undefined}
            style={{ width: "100%" }} />
        ))}
      </div>
    </div>
  )
}

export default DatosPaciente
