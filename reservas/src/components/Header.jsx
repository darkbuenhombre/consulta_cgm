function Header() {
  return (
    <header style={{ display: "flex", alignItems: "center", gap: "var(--esp-3)" }}>
      <span aria-hidden="true" style={{
        width: "40px", height: "40px", borderRadius: "var(--radio-sm)", flexShrink: 0,
        backgroundColor: "var(--azul-600)", color: "var(--texto-sobre-azul)",
        display: "grid", placeItems: "center", fontWeight: 700, fontSize: "var(--texto-sm)"
      }}>CG</span>
      <div>
        <h1>Dr. Cleomenes García</h1>
        <p style={{ margin: 0, color: "var(--texto-suave)", fontSize: "var(--texto-sm)" }}>Odontología General</p>
      </div>
    </header>
  )
}

export default Header
