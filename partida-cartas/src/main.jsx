import { StrictMode, Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))
//Función para añadir cartas
const crearCartas = ({ text }) => {
  return (
    <button>{text}</button>
  )
}

//Jugador1
let Jugador1 = () => (
  <>
    {crearCartas({ text: 'carta1' })}
    {crearCartas({ text: 'carta2' })}
    {crearCartas({ text: 'carta3' })}
    {crearCartas({ text: 'carta4' })}
    {crearCartas({ text: 'carta5' })}
  </>
)
//CPU
let CPU = () => (
  <>
    {crearCartas({ text: 'cartaR1' })}
    {crearCartas({ text: 'cartaR2' })}
    {crearCartas({ text: 'cartaR3' })}
    {crearCartas({ text: 'cartaR4' })}
    {crearCartas({ text: 'cartaR5' })}
  </>
)

//Raiz principal
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)

