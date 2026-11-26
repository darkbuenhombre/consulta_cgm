import { useState } from "react"
import { botonChico, botonSecundario, input, tarjeta } from "../../estilos"

const VACIO = {
  name: "", category: "", sku: "", unit: "", quantity_on_hand: 0, minimum_threshold: 0,
  expiry_date: "", supplier: "", unit_cost: ""
}

const CAMPOS = [
  ["name", "Nombre *", "text"],
  ["category", "Categoría *", "text"],
  ["sku", "SKU", "text"],
  ["unit", "Unidad (caja, jeringa…)", "text"],
  ["minimum_threshold", "Stock mínimo", "number"],
  ["expiry_date", "Vencimiento", "date"],
  ["supplier", "Proveedor", "text"],
  ["unit_cost", "Costo unitario ($)", "number"]
]

// Formulario para crear (material = null) o editar un material.
// La cantidad solo se ingresa al crear; después se cambia con "Ajustar stock".
function FormMaterial({ material, categorias, onGuardar, onCancelar }) {
  const [valores, setValores] = useState(() => {
    const base = { ...VACIO, ...material }
    for (const k of Object.keys(VACIO)) if (base[k] == null) base[k] = ""
    return base
  })
  const [guardando, setGuardando] = useState(false)

  function cambiar(e) {
    setValores(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function enviar(e) {
    e.preventDefault()
    setGuardando(true)
    await onGuardar(valores)
    setGuardando(false)
  }

  const campos = material ? CAMPOS : [...CAMPOS.slice(0, 4), ["quantity_on_hand", "Cantidad inicial", "number"], ...CAMPOS.slice(4)]

  return (
    <form onSubmit={enviar} style={{ ...tarjeta, marginBottom: "16px" }}>
      <h3 style={{ marginTop: 0 }}>{material ? `Editar: ${material.name}` : "Nuevo material"}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
        {campos.map(([nombre, etiqueta, tipo]) => (
          <label key={nombre} style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "14px" }}>
            {etiqueta}
            <input name={nombre} type={tipo} value={valores[nombre]} onChange={cambiar} style={input}
              min={tipo === "number" ? 0 : undefined} step={nombre === "unit_cost" ? "0.01" : undefined}
              required={nombre === "name" || nombre === "category"}
              list={nombre === "category" ? "categorias-materiales" : undefined} />
          </label>
        ))}
      </div>
      <datalist id="categorias-materiales">
        {categorias.map(c => <option key={c} value={c} />)}
      </datalist>
      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <button type="submit" disabled={guardando} style={botonChico}>{material ? "Guardar" : "Crear"}</button>
        <button type="button" onClick={onCancelar} style={botonSecundario}>Cancelar</button>
      </div>
    </form>
  )
}

export default FormMaterial
