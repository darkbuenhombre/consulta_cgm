import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { api, guardarToken, obtenerToken } from "../api"
import Header from "../components/Header"
import { botonPrincipal, contenedor, input, mensajeError } from "../estilos"

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
    <div style={{ ...contenedor, maxWidth: "400px" }}>
      <Header />
      <h2>Acceso administrador</h2>
      <form onSubmit={ingresar} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input type="email" placeholder="Correo" value={email} required autoComplete="username"
          onChange={e => setEmail(e.target.value)} style={input} />
        <input type="password" placeholder="Contraseña" value={password} required autoComplete="current-password"
          onChange={e => setPassword(e.target.value)} style={input} />
        {error && <div style={mensajeError}>{error}</div>}
        <button type="submit" disabled={enviando} style={{ ...botonPrincipal, marginTop: "8px" }}>
          {enviando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  )
}

export default AdminLogin
