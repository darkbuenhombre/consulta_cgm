import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { cerrarSesion, obtenerToken } from "../api"
import AdminHorario from "../components/admin/AdminHorario"
import AdminReservas from "../components/admin/AdminReservas"
import AdminServicios from "../components/admin/AdminServicios"
import Header from "../components/Header"
import { botonSecundario, contenedor } from "../estilos"

const pestanaBase = {
  padding: "var(--esp-3) var(--esp-4)", border: "none", borderBottom: "2px solid transparent",
  marginBottom: "-1px", fontSize: "var(--texto-base)", whiteSpace: "nowrap"
}

const PESTANAS = {
  reservas: { titulo: "Reservas", Componente: AdminReservas },
  servicios: { titulo: "Servicios", Componente: AdminServicios },
  horario: { titulo: "Horario", Componente: AdminHorario }
}

function AdminPanel() {
  const navigate = useNavigate()
  const [pestana, setPestana] = useState("reservas")

  if (!obtenerToken()) return <Navigate to="/admin/login" replace />

  function salir() {
    cerrarSesion()
    navigate("/admin/login", { replace: true })
  }

  const { Componente } = PESTANAS[pestana]

  return (
    <div style={{ ...contenedor, maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--esp-3)", flexWrap: "wrap" }}>
        <Header />
        <button onClick={salir} style={botonSecundario}>Cerrar sesión</button>
      </div>

      <nav aria-label="Secciones" style={{ display: "flex", gap: "var(--esp-1)", borderBottom: "1px solid var(--borde)", margin: "var(--esp-6) 0 var(--esp-5)", overflowX: "auto" }}>
        {Object.entries(PESTANAS).map(([clave, { titulo }]) => {
          const activa = pestana === clave
          return (
            <button key={clave} onClick={() => setPestana(clave)} aria-current={activa ? "page" : undefined}
              style={{
                ...pestanaBase, cursor: "pointer", backgroundColor: "transparent",
                borderBottom: `2px solid ${activa ? "var(--azul-600)" : "transparent"}`,
                color: activa ? "var(--azul-600)" : "var(--texto-suave)", fontWeight: activa ? 600 : 500
              }}>
              {titulo}
            </button>
          )
        })}
        <Link to="/admin/inventario" style={{ ...pestanaBase, color: "var(--texto-suave)", fontWeight: 500, textDecoration: "none" }}>
          Inventario
        </Link>
      </nav>

      <Componente />
    </div>
  )
}

export default AdminPanel
