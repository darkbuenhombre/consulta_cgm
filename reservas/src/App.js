import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AdminInventario from "./pages/AdminInventario"
import AdminLogin from "./pages/AdminLogin"
import AdminPanel from "./pages/AdminPanel"
import Cancelar from "./pages/Cancelar"
import Reserva from "./pages/Reserva"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Reserva />} />
        <Route path="/cancelar/:token" element={<Cancelar />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/inventario" element={<AdminInventario />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
