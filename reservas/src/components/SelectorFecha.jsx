import { useState } from "react"

const botonNav = {
  width: '40px', height: '40px', borderRadius: 'var(--radio-sm)', cursor: 'pointer',
  border: '1px solid var(--borde-control)', backgroundColor: 'var(--accion-suave)', color: 'var(--accion)'
}

function SelectorFecha({ onSeleccionar }) {
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
  const hoy = new Date()

  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)

  function mesAnterior() {
    if (mes === 0) { setMes(11); setAnio(anio - 1) }
    else setMes(mes - 1)
  }

  function mesSiguiente() {
    if (mes === 11) { setMes(0); setAnio(anio + 1) }
    else setMes(mes + 1)
  }

  function seleccionarFecha(dia) {
    const fecha = new Date(anio, mes, dia)
    setFechaSeleccionada(fecha)
    onSeleccionar(fecha)
  }

  function esPasado(dia) {
    const fecha = new Date(anio, mes, dia)
    const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    return fecha < hoyInicio
  }

  function esDomingo(dia) {
    return new Date(anio, mes, dia).getDay() === 0
  }

  function esSeleccionado(dia) {
    if (!fechaSeleccionada) return false
    return new Date(anio, mes, dia).toDateString() === fechaSeleccionada.toDateString()
  }

  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  return (
    <div>
      <h2>Seleccionar fecha</h2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '360px' }}>
        <button onClick={mesAnterior} aria-label="Mes anterior" style={botonNav}>←</button>
        <span aria-live="polite" style={{ fontWeight: 600 }}>{MESES[mes]} {anio}</span>
        <button onClick={mesSiguiente} aria-label="Mes siguiente" style={botonNav}>→</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--esp-1)', marginTop: 'var(--esp-3)', maxWidth: '360px' }}>
        {DIAS.map(d => <div key={d} aria-hidden="true" style={{ textAlign: 'center', fontSize: 'var(--texto-xs)', fontWeight: 600, color: 'var(--texto-suave)', paddingBottom: 'var(--esp-1)' }}>{d}</div>)}
        {Array(primerDia).fill(null).map((_, i) => <div key={'vacio-' + i}></div>)}
        {Array(diasEnMes).fill(null).map((_, i) => {
          const dia = i + 1
          const deshabilitado = esPasado(dia) || esDomingo(dia)
          const seleccionado = esSeleccionado(dia)
          return (
            <button key={dia} onClick={() => seleccionarFecha(dia)} disabled={deshabilitado} aria-pressed={seleccionado}
              aria-label={`${dia} de ${MESES[mes]} de ${anio}`}
              style={{
                aspectRatio: '1', minHeight: '40px', padding: 0, border: 'none',
                borderRadius: 'var(--radio-sm)', fontWeight: deshabilitado ? 400 : 600,
                cursor: deshabilitado ? 'not-allowed' : 'pointer',
                color: deshabilitado ? 'var(--borde-control)' : seleccionado ? 'var(--texto-sobre-azul)' : 'var(--azul-800)',
                backgroundColor: seleccionado ? 'var(--accion)' : deshabilitado ? 'transparent' : 'var(--accion-tenue)'
              }}>
              {dia}
            </button>
          )
        })}
      </div>
      {fechaSeleccionada && <p style={{ marginTop: 'var(--esp-3)', color: 'var(--texto-suave)' }}>Fecha: {fechaSeleccionada.toLocaleDateString('es-CL')}</p>}
    </div>
  )
}

export default SelectorFecha