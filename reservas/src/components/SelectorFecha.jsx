import { useState } from "react"

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
      <div>
        <button onClick={mesAnterior}>←</button>
        <span> {MESES[mes]} {anio} </span>
        <button onClick={mesSiguiente}>→</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginTop: '10px' }}>
        {DIAS.map(d => <div key={d} style={{ textAlign: 'center', fontWeight: 'bold' }}>{d}</div>)}
        {Array(primerDia).fill(null).map((_, i) => <div key={'vacio-' + i}></div>)}
        {Array(diasEnMes).fill(null).map((_, i) => {
          const dia = i + 1
          const deshabilitado = esPasado(dia) || esDomingo(dia)
          const seleccionado = esSeleccionado(dia)
          return (
            <div key={dia}
              onClick={() => !deshabilitado && seleccionarFecha(dia)}
              style={{
                textAlign: 'center', padding: '6px',
                cursor: deshabilitado ? 'default' : 'pointer',
                color: deshabilitado ? '#ccc' : seleccionado ? 'white' : 'black',
                backgroundColor: seleccionado ? '#2C5F4A' : 'transparent',
                borderRadius: '6px'
              }}>
              {dia}
            </div>
          )
        })}
      </div>
      {fechaSeleccionada && <p>Fecha: {fechaSeleccionada.toLocaleDateString('es-CL')}</p>}
    </div>
  )
}

export default SelectorFecha