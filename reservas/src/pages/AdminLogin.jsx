import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { api, guardarToken, obtenerToken } from "../api"
import Header from "../components/Header"
import { botonPrincipal, contenedor, input, mensajeError, tarjeta } from "../estilos"

function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [enviando, setEnviando] = useState(false)

  if (obtenerToken()) return <Navigate to="/admin" replace />

  async function ingresar(e) {
    e.preventDefault()
    setError("")
    setEnviando(true)
    try {
      const { token } = await api("/auth/login", { method: "POST", body: { email, password } })
      guardarToken(token)
      navigate("/admin", { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{ ...contenedor, maxWidth: "420px", paddingTop: "var(--esp-7)" }}>
      <Header />
      <h2>Acceso administrador</h2>
      <form onSubmit={ingresar} style={{ ...tarjeta, display: "flex", flexDirection: "column", gap: "var(--esp-3)" }}>
        <input type="email" placeholder="Correo" aria-label="Correo" value={email} required autoComplete="username"
          onChange={e => setEmail(e.target.value)} style={input} />
        <input type="password" placeholder="Contraseña" aria-label="Contraseña" value={password} required autoComplete="current-password"
          onChange={e => setPassword(e.target.value)} style={input} />
        {error && <div role="alert" style={{ ...mensajeError, marginTop: 0 }}>{error}</div>}
        <button type="submit" disabled={enviando} style={{ ...botonPrincipal, marginTop: "8px" }}>
          {enviando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  )
}

export default AdminLogin
