import { useState } from "react"

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
      <input type="text" name="nombre" placeholder="Nombre"
        value={datos.nombre} onChange={manejoCambios} />
      <input type="text" name="apellido_paterno" placeholder="Apellido Paterno"
        value={datos.apellido_paterno} onChange={manejoCambios} />
      <input type="text" name="apellido_materno" placeholder="Apellido Materno"
        value={datos.apellido_materno} onChange={manejoCambios} />
      <input type="text" name="rut" placeholder="10.333.222-k"
        value={datos.rut} onChange={manejoCambios} maxLength={12} />
      <input type="tel" name="telefono" placeholder="Teléfono"
        value={datos.telefono} onChange={manejoCambios} />
      <input type="email" name="email" placeholder="Correo electrónico"
        value={datos.email} onChange={manejoCambios} />
    </div>
  )
}

export default DatosPaciente