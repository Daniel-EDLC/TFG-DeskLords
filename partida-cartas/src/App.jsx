import { useEffect, useState } from 'react'
import './App.css'

const Carta = ({ nombre, tipo, ataque, vida, coste, habilidades, onClick, disabled, isSelected }) => (
  <div
    onClick={disabled ? undefined : onClick}
    style={{
      border: isSelected ? '2px solid gray' : '1px solid gray',
      margin: '10px',
      padding: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: vida <= 0 ? 0.5 : 1,
    }}
  >
    <h3>{nombre}</h3>
    <p>Ataque: {ataque}</p>
    <p>Tipo: {tipo}</p>
    <p>Vida:   {vida}</p>
    <p>Coste: {coste}</p>
    <p>Habilidad: {habilidades}</p>
  </div>
)

function App() {
  const [jugadorHand, setJugadorHand] = useState([])
  const [enemigoHand, setEnemigoHand] = useState([])
  //Este se usará para remarcar la carta seleccionada ya sea para defender, atacar o colocar
  const [seleccionJugador, setSeleccionJugador] = useState(null)
  const [seleccionCombate, setSeleccionCombate] = useState([])

  const [mesaJugador, setMesaJugador] = useState([])
  const [mesaEnemigo, setMesaEnemigo] = useState([])
  const [turno, setTurno] = useState('player')
  //Variable para cuando el enemigo ataque
  const [atacantesRival, setAtacantesRival] = useState([])
  const [ataqueRival, setAtaqueRival] = useState(null)
  //Vida de los jugadores
  const [vidaJugador, setVidaJugador] = useState(20)
  const [vidaRival, setVidaRival] = useState(20)
  //Maná
  const [manaJugador, setManaJugador] = useState(null)
  const [manaRival, setManaRival] = useState(null)
  //Maná global
  const [manaGlobal, setManaGlobal] = useState(20)
  //Mazos
  const [mazoRival, setMazoRival] = useState([])
  const [mazoJugador, setMazoJugador] = useState([])

  //Variables para conjuro o equipo
  const [equipoAUsar, setEquipoAUsar] = useState(null)
  const [usandoEquipo, setUsandoEquipo] = useState(false)

  const [conjuroAUsar, setConjuroAUsar] = useState(null)
  const [usandoConjuro, setUsandoConjuro] = useState(false)

  const [conjuroParaJugador, setConjuroParaJugador] = useState(false)
  const [conjuroParaRival, setConjuroParaRival] = useState(false)

  //Variables para final del juego
  const hasPerdido = false
  const hasGanado = false


  // Carga inicial del mazo
  useEffect(() => {
    fetch('/deck.json')
      .then(res => res.json())
      .then(data => {
        const mazoRivalLocal = [...data]
        const mazoJugadorLocal = [...data]

        //Función para robar
        const robar = (mazo, n) => {
          const mano = []
          for (let i = 0; i < n; i++) {
            const indice = Math.floor(Math.random() * mazo.length)
            mano.push(mazo.splice(indice, 1)[0])
          }
          return mano
        }

        //Manos locales
        const manoJugador = robar(mazoJugadorLocal, 5)
        const manoRival = robar(mazoRivalLocal, 5)

        //Cambiamos los mazos de cada jugador
        setMazoJugador(mazoJugadorLocal)
        setMazoRival(mazoRivalLocal)
        //Y agregamos las manos de cada jugador
        setJugadorHand(manoJugador)
        setEnemigoHand(manoRival)
      })
      .catch(err => console.error('ERROR', err))
  }, [])

  // Suma maná cuando el turno sea del jugador de nuevo y añade cartas a la mano
  useEffect(() => {
    if (turno == 'player') {
      //Si tienen cartas en los mazos y no supera el límite de mano, cada jugador roba una al azar
      if (mazoJugador.length > 0 && jugadorHand.length != 7) {
        const idxJ = Math.floor(Math.random() * mazoJugador.length);
        const cartaJ = mazoJugador[idxJ];
        setJugadorHand(prev => [...prev, cartaJ]);
        setMazoJugador(prev => prev.filter((_, i) => i !== idxJ));
      }

      if (mazoRival.length > 0 && enemigoHand.length != 7) {
        const idxR = Math.floor(Math.random() * mazoRival.length);
        const cartaR = mazoRival[idxR];
        setEnemigoHand(prev => [...prev, cartaR]);
        setMazoRival(prev => prev.filter((_, i) => i !== idxR));
      }

      //Se revisan ambas manos para ver si tienen habilidades temporales para borrarlas
      //Mano jugador
      setMesaJugador(prev =>
        prev.map(carta => {
          const habilidadesNormales = carta.habilidades.filter(hab => !hab.includes('1'))
          if (habilidadesNormales.length == carta.habilidades.length) {
            return carta
          } else {
            return {
              ...carta,
              habilidades: habilidadesNormales
            }
          }
        })
      )

      //Cambiamos el maná
      setManaGlobal(manaGlobal + 1)
      setManaJugador(manaGlobal)
      setManaRival(manaGlobal)
    }
    if (turno == 'enemy') {
      //Se revisan ambas manos para ver si tienen habilidades temporales para borrarlas      
      //Mano rival
      setMesaEnemigo(prev =>
        prev.map(carta => {
          const habilidadesNormales = carta.habilidades.filter(hab => !hab.includes('1'))
          if (habilidadesNormales.length == carta.habilidades.length) {
            return carta
          } else {
            return {
              ...carta,
              habilidades: habilidadesNormales
            }
          }
        })
      )
    }
  }, [turno])

  // Turno de la CPU: cuando turno pase a 'enemy', selecciona aleatoria tras 1s
  useEffect(() => {
    if (turno == 'enemy') {
      if (turno != 'enemy') return
      const timer = setTimeout(() => {
        //Variables locales
        let mesaLocal = [...mesaEnemigo]
        let manoLocal = [...enemigoHand]
        let manaLocal = manaRival
        let cartasValidas = []
        //Variable para demostrar que la carta se usó para restar maná
        let cartaUsada = false
        //Variable que soluciona problema de bucle
        let cartasInvalidas = []

        //Si no tiene atacantes el rival, es porque es el inicio de su turno
        if (atacantesRival.length == 0) {
          //El máximo de cartas a colocar son 5 en mesa
          if (mesaEnemigo.length < 5 && enemigoHand.length != 0) {
            //Hay que tener en cuenta que solo podrá colocar si tiene el maná necesario y no usa equipo
            cartasValidas = enemigoHand.filter(carta => (carta.coste <= manaRival))
            //Si hay cartas válidas se coloca alguna
            while (mesaLocal.length < 5 && cartasValidas.length != 0 && manaLocal != 0) {
              const aleatoria = cartasValidas[Math.floor(Math.random() * cartasValidas.length)]

              //Equipo
              if (aleatoria.tipo == 'equipo' && mesaLocal.length != 0) {
                //De nuestra mesa local seleccionamos una carta aleatoria y cambiamos sus atributos dependiendo de lo que aumente
                let cartaAMejorar = mesaLocal[Math.floor(Math.random() * mesaLocal.length)]
                //Dependiendo de la habilidad cambiará los atributos de una forma u otra
                aleatoria.habilidades.forEach(habilidad => {
                  if (habilidad.includes('ATQ')) {
                    //Se busca el número y se aumenta el ataque
                    const matchNum = habilidad.match(/([+-]\d+)/)
                    const valor = matchNum ? parseInt(matchNum[1], 10) : 0
                    cartaAMejorar.ataque = cartaAMejorar.ataque + valor
                  }
                  if (habilidad.includes('VID')) {
                    //Se busca el número y se aumenta la vida
                    const matchNum = habilidad.match(/([+-]\d+)/)
                    const valor = matchNum ? parseInt(matchNum[1], 10) : 0
                    cartaAMejorar.vida = cartaAMejorar.vida + valor
                  }
                  if (habilidad.includes('habilidad')) {
                    //Se incluye dicha habilidad a la carta
                    const habilidadNueva = habilidad.split(':')[1]?.trim()
                    cartaAMejorar.habilidades.push(habilidadNueva)
                  }
                })
                //Se cambia la carta en la mesa 
                mesaLocal = mesaLocal.map(c =>
                  c.nombre == cartaAMejorar.nombre
                    ? cartaAMejorar
                    : c
                )
                //Se usó la carta
                cartaUsada = true

              }

              //Conjuro
              else if (aleatoria.tipo == 'conjuro') {
                //Se observa cuál es el conjuro con un switch
                aleatoria.habilidades.forEach(habilidad => {
                  switch (true) {
                    case habilidad.includes('destruye la criatura'):
                      //Solo puede lanzar el hechizo si hay cartas en la mesa del jugador
                      if (mesaJugador.length != 0) {
                        let cartaADestruir = mesaJugador[Math.floor(Math.random() * mesaJugador.length)]
                        //Se destruye de la mesa
                        setMesaJugador(prev =>
                          prev.filter(c => c.nombre != cartaADestruir.nombre)
                        )
                        cartaUsada = true
                      } else {
                        //Se añade el conjuro a cartas que no se pueden usar para que no se genere un bucle
                        cartasInvalidas.push(aleatoria)
                      }
                      break;
                    case habilidad.includes('esta criatura es indestructible este turno'):
                      if (mesaLocal.length != 0) {
                        let cartaAModificar = mesaEnemigo[Math.floor(Math.random() * mesaEnemigo)]
                        // sólo la añadimos si no la tiene ya
                        if (!cartaAModificar.habilidades.some(h => h.includes('indestructible'))) {
                          cartaAModificar.habilidades.push('1 indestructible')
                        }
                        // reconstruimos la mesa con la versión (posiblemente) modificada
                        mesaLocal = mesaLocal.map(c =>
                          c.nombre === cartaAModificar.nombre
                            ? cartaAModificar
                            : c
                        )
                        cartaUsada = true
                      } else {
                        //Se añade el conjuro a cartas que no se pueden usar para que no se genere un bucle
                        cartasInvalidas.push(aleatoria)
                      }
                      break;
                    case habilidad.includes('todas tus criaturas son indestructibles este turno'):
                      if (mesaLocal.length != 0) {
                        mesaLocal = mesaLocal.map(c => {
                          // sólo añadimos si no la tiene ya
                          if (!c.habilidades.some(h => h.includes('indestructible'))) {
                            return {
                              ...c,
                              habilidades: [...c.habilidades, '1 indestructible']
                            }
                          }
                          return c
                        })
                        cartaUsada = true
                      } else {
                        //Se añade el conjuro a cartas que no se pueden usar para que no se genere un bucle
                        cartasInvalidas.push(aleatoria)
                      }
                      break;
                    default:
                      alert('ERROR')
                      //Se añade el conjuro a cartas que no se pueden usar para que no se genere un bucle
                      cartasInvalidas.push(aleatoria)
                      break;
                  }
                })

              }

              //Criatura
              else if (aleatoria.tipo == 'criatura') {
                //Se coloca la carta de la mesa y se elimina de la mano
                mesaLocal.push(aleatoria)
                cartaUsada = true
              }

              //Solo si se usó la carta se resta maná y se quita la carta de la mano del rival
              if (cartaUsada) {
                manoLocal = manoLocal.filter(c => c.nombre != aleatoria.nombre)
                manaLocal = manaLocal - aleatoria.coste
                cartaUsada = false
              }
              //Reiniciamos las válidas con el maná nuevo y teniendo en cuenta las cartas inválidas
              cartasValidas = []
              cartasValidas = manoLocal.filter(carta =>
                carta.coste <= manaLocal &&
                !cartasInvalidas.some(inv => inv.nombre == carta.nombre)
              )
            }
            setMesaEnemigo(mesaLocal)
            setManaRival(manaLocal)
            setEnemigoHand(manoLocal)
          } else {
            //Aunque haya 5 cartas en la mesa, puede agregar una carta de equipo
            cartasValidas = manoLocal.filter(carta =>
              carta.coste <= manaLocal &&
              carta.tipo != 'criatura'
            )
            if (cartasValidas.length != 0) {
              while (manaLocal > 0 && cartasValidas.length != 0) {
                const aleatoria = cartasValidas[Math.floor(Math.random() * cartasValidas.length)]

                //Equipo
                if (aleatoria.tipo == 'equipo' && mesaLocal.length != 0) {
                  //De nuestra mesa local seleccionamos una carta aleatoria y cambiamos sus atributos dependiendo de lo que aumente
                  let cartaAMejorar = mesaLocal[Math.floor(Math.random() * mesaLocal.length)]
                  //Dependiendo de la habilidad cambiará los atributos de una forma u otra
                  aleatoria.habilidades.forEach(habilidad => {
                    if (habilidad.includes('ATQ')) {
                      //Se busca el número y se aumenta el ataque
                      const matchNum = habilidad.match(/([+-]\d+)/)
                      const valor = matchNum ? parseInt(matchNum[1], 10) : 0
                      cartaAMejorar.ataque = cartaAMejorar.ataque + valor
                    }
                    if (habilidad.includes('VID')) {
                      //Se busca el número y se aumenta la vida
                      const matchNum = habilidad.match(/([+-]\d+)/)
                      const valor = matchNum ? parseInt(matchNum[1], 10) : 0
                      cartaAMejorar.vida = cartaAMejorar.vida + valor
                    }
                    if (habilidad.includes('habilidad')) {
                      //Se incluye dicha habilidad a la carta
                      const habilidadNueva = habilidad.split(':')[1]?.trim()
                      cartaAMejorar.habilidades.push(habilidadNueva)
                    }
                  })
                  //Se cambia la carta en la mesa 
                  mesaLocal = mesaLocal.map(c =>
                    c.nombre == cartaAMejorar.nombre
                      ? cartaAMejorar
                      : c
                  )
                  //Se usó la carta
                  cartaUsada = true

                }

                //Conjuro
                else if (aleatoria.tipo == 'conjuro') {
                  //Se observa cuál es el conjuro con un switch
                  conjuro.habilidades.forEach(habilidad => {
                    switch (true) {
                      case habilidad.includes('destruye la criatura'):
                        //Solo puede lanzar el hechizo si hay cartas en la mesa del jugador
                        if (mesaJugador.length != 0) {
                          let cartaADestruir = mesaJugador[Math.floor(Math.random() * mesaJugador.length)]
                          //Se destruye de la mesa
                          setMesaJugador(prev =>
                            prev.filter(c => c.nombre != cartaADestruir.nombre)
                          )
                          cartaUsada = true
                        } else {
                          //Se añade el conjuro a cartas que no se pueden usar para que no se genere un bucle
                          cartasInvalidas.push(aleatoria)
                        }
                        break;
                      case habilidad.includes('esta criatura es indestructible este turno'):
                        if (mesaLocal.length != 0) {
                          let cartaAModificar = mesaEnemigo[Math.floor(Math.random() * mesaEnemigo)]
                          // sólo la añadimos si no la tiene ya
                          if (!cartaAModificar.habilidades.some(h => h.includes('indestructible'))) {
                            cartaAModificar.habilidades.push('1 indestructible')
                          }
                          // reconstruimos la mesa con la versión (posiblemente) modificada
                          mesaLocal = mesaLocal.map(c =>
                            c.nombre === cartaAModificar.nombre
                              ? cartaAModificar
                              : c
                          )
                          cartaUsada = true
                        } else {
                          //Se añade el conjuro a cartas que no se pueden usar para que no se genere un bucle
                          cartasInvalidas.push(aleatoria)
                        }
                        break;
                      case habilidad.includes('todas tus criaturas son indestructibles este turno'):
                        if (mesaLocal.length != 0) {
                          mesaLocal = mesaLocal.map(c => {
                            // sólo añadimos si no la tiene ya
                            if (!c.habilidades.some(h => h.includes('indestructible'))) {
                              return {
                                ...c,
                                habilidades: [...c.habilidades, '1 indestructible']
                              }
                            }
                            return c
                          })
                          cartaUsada = true
                        } else {
                          //Se añade el conjuro a cartas que no se pueden usar para que no se genere un bucle
                          cartasInvalidas.push(aleatoria)
                        }
                        break;
                      default:
                        alert('ERROR')
                        //Se añade el conjuro a cartas que no se pueden usar para que no se genere un bucle
                        cartasInvalidas.push(aleatoria)
                        break;
                    }
                  })
                }

                //Solo si se usó la carta se resta maná y se quita la carta de la mano del rival
                if (cartaUsada) {
                  manoLocal = manoLocal.filter(c => c.nombre != aleatoria.nombre)
                  manaLocal = manaLocal - aleatoria.coste
                  cartaUsada = false
                }
                //Reiniciamos las válidas con el maná nuevo y teniendo en cuenta las cartas inválidas
                cartasValidas = []
                cartasValidas = manoLocal.filter(carta =>
                  carta.coste <= manaLocal &&
                  !cartasInvalidas.some(inv => inv.nombre == carta.nombre)
                )
              }
            }
          }

          //Se selecciona un conjunto de atacantes de la mesa
          const atacantes = [...mesaLocal]
          if (atacantes.length == 0) {
            //No hay cartas en mesa, por lo que se pasa el turno al jugador
            setTurno('player')
          }

          //Se escoge de forma aleatoria con qué va a atacar, mínimo una carta
          const atacantesSeleccionados = atacantes.filter(() => Math.random() < 0.5)
          if (atacantesSeleccionados.length == 0) {
            //Se añade mínimo 1
            atacantesSeleccionados.push(atacantes[
              Math.floor(Math.random() * atacantes.length)
            ])
          }

          if (mesaJugador.length == 0) {
            //Si el jugador no tiene cartas en la mesa, el ataque se dirige a la vida del jugador
            let vidaActual = vidaJugador
            atacantesSeleccionados.forEach(carta => {
              vidaActual = vidaActual - carta.ataque
              if (vidaActual <= 0) {
                alert('HAS PERDIDO')
                setVidaJugador(0)
                setTurno('loser')
                hasPerdido = true
              }
            })
            if (!hasPerdido) {
              //Tras acabar los ataques se actualiza la vida y pasa de turno
              setVidaJugador(vidaActual)
              setTurno('player')
            }
          } else {
            //Se guardan los atacantes
            setAtacantesRival(atacantesSeleccionados)
            //Y se selecciona un atacante rival
            setAtaqueRival(atacantesSeleccionados[0])
            //Se espera a que el jugador escoja una carta para defender el ataque del rival
            setTurno('defend')
            return
          }
        } else {
          //Tiene atacantes por lo cual se selecciona el siguiente atacante y se pasa a defender o recibe el ataque dependiendo de si tiene o no cartas en la mesa
          if (mesaJugador.length == 0) {
            const vidaActual = vidaJugador
            atacantesRival.forEach(atacante => {
              vidaActual = vidaActual - atacante.ataque
              if (vidaActual <= 0) {
                alert('HAS PERDIDO')
                setVidaJugador(0)
                setTurno('loser')
                hasPerdido = true
              }
            })
            if (!hasPerdido) {
              //Tras acabar los ataques se actualiza la vida y pasa de turno
              setVidaJugador(vidaActual)
              setTurno('player')
            }
          } else {
            //Se escoge en orden el siguiente atacante y se pasa a defender
            setAtaqueRival(atacantesRival[0])
            setTurno('defend')
          }

        }

      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [turno, enemigoHand, mesaEnemigo, mesaJugador, manaRival])

  //Funcion para colocar carta
  const handleColocar = carta => {
    if (turno != 'player' || !carta) return
    //Solo se coloca si tiene el maná para usar la carta
    if (carta.coste > manaJugador) {
      alert('No tienes el maná suficiente')
      return
    }

    //Añade la carta a la mesa, solo si es criatura
    if (carta.tipo == 'criatura' && mesaJugador.length != 5) {
      //Resta el maná usado
      setManaJugador(manaJugador - carta.coste)
      //Pone la carta en la mesa
      setMesaJugador(prev => [...prev, carta])
      //Quita la carta de la mano
      setJugadorHand(prev => prev.filter(c => c.nombre !== carta.nombre))
    }
    //Equipos
    if (carta.tipo == 'equipo') {
      if (mesaJugador.length == 0) {
        alert('No hay criaturas en la mesa')
        return
      } else {
        //Se pone el equipo como equipo a usar
        setEquipoAUsar(carta)
        //Y se deja claro que el usuario está usando un equipo
        setUsandoEquipo(true)
      }
    }
    //Conjuros
    if (carta.tipo == 'conjuro') {
      //Se pone el conjuro como conjuro a usar
      setConjuroAUsar(carta)
      //Y se deja claro que el usuario está usando un conjuro, dependiendo si es para él o para el rival
      carta.habilidades.forEach(habilidad => {
        if (habilidad.includes('destruye la criatura')) {
          setConjuroParaRival(true)
          setSeleccionJugador(null)
        }
        if (habilidad.includes('esta criatura es indestructible este turno')) {
          //Si es solo una criatura, se deja escoger cuál
          setConjuroParaJugador(true)
          setSeleccionJugador(null)
        }
        if (habilidad.includes('todas tus criaturas son indestructibles este turno')) {
          //Se añade una habilidad con el número de turnos y el nombre de la habilidad
          if (mesaJugador.length != 0) {
            //Tras eso se actualiza la mesa con las cartas cambiadas
            setMesaJugador(prev =>
              prev.map(c => {
                // si ya tiene cualquier habilidad que contenga "indestructible", no la volvemos a añadir
                const tieneIndestructible = c.habilidades.some(h =>
                  h.includes('indestructible')
                );
                if (tieneIndestructible) {
                  return c;
                }
                // si no la tiene, la añadimos
                return {
                  ...c,
                  habilidades: [...c.habilidades, '1 indestructible']
                };
              })
            )
            //Y se borra la carta de la mano
            setJugadorHand(prev =>
              prev.filter(c => c.nombre != carta.nombre)
            )
            //Quitamos la carta ya que ya fue usada
            setConjuroAUsar(null)
          } else {
            handleCancelar()
          }
        }
      })
    }
  }

  //Funciones para usar un equipamiento o cancelar el uso de dicha carta
  const handleConjurar = (carta, conjuro) => {
    if (!carta || !conjuro) return
    let cartaModificada = {
      ...carta,
      habilidades: [...(carta.habilidades || [])]
    }
    if (conjuroParaJugador) {
      //Solo conjuros para jugadores
      conjuro.habilidades.forEach(habilidad => {
        switch (true) {
          case habilidad.includes('esta criatura es indestructible este turno'):
            cartaModificada.habilidades.push('1 indestructible')
            //Se cambia la carta de la mesa
            setMesaJugador(prev =>
              prev.map(c =>
                c.nombre == carta.nombre
                  ? cartaModificada
                  : c
              ))
            break;
          default:
            alert('ERROR')
            break;
        }
      })
    }
    if (conjuroParaRival) {
      //Solo conjuros para rivales
      conjuro.habilidades.forEach(habilidad => {
        switch (true) {
          case habilidad.includes('destruye la criatura'):
            //Se destruye la carta
            setMesaEnemigo(prev => prev.filter(c => c.nombre != carta.nombre))
            break;
          default:
            alert('ERROR')
            break;
        }
      })
    }
    //Se borra el conjuro de la mano
    setJugadorHand(prev =>
      prev.filter(c => c.nombre != conjuro.nombre)
    )
    setConjuroAUsar(null)
    setConjuroParaJugador(false)
    setConjuroParaRival(false)
  }


  const handleEquipar = (carta, equipo) => {
    if (!carta || !equipo) return
    let cartaModificada = {
      ...carta,
      habilidades: [...(carta.habilidades || [])]
    }

    //Comprobaciones de qué le va a añadir a la carta
    equipo.habilidades.forEach(habilidad => {
      if (habilidad.includes('ATQ')) {
        //Se busca el número y se aumenta el ataque
        const matchNum = habilidad.match(/([+-]\d+)/)
        const valor = matchNum ? parseInt(matchNum[1], 10) : 0
        cartaModificada.ataque = cartaModificada.ataque + valor
      }
      if (habilidad.includes('VID')) {
        //Se busca el número y se aumenta la vida
        const matchNum = habilidad.match(/([+-]\d+)/)
        const valor = matchNum ? parseInt(matchNum[1], 10) : 0
        cartaModificada.vida = cartaModificada.vida + valor
      }
      if (habilidad.includes('habilidad')) {
        //Se incluye dicha habilidad a la carta
        const habilidadNueva = habilidad.split(':')[1]?.trim()
        cartaModificada.habilidades.push(habilidadNueva)
      }
    })
    //Resta el maná usado
    setManaJugador(manaJugador - equipo.coste)
    //Quita el equipo de la mano
    setJugadorHand(prev => prev.filter(c => c.nombre !== equipo.nombre))
    //Se actualiza mesa con la carta modificada
    setMesaJugador(prev =>
      prev.map(c =>
        c.nombre == carta.nombre
          ? cartaModificada
          : c
      )
    )
  }

  const handleCancelar = () => {
    if (!usandoEquipo && turno != 'player' && !conjuroAUsar) return
    if (equipoAUsar) {
      setEquipoAUsar(null)
      setUsandoEquipo(false)
    }
    if (conjuroAUsar) {
      setConjuroAUsar(null)
      setUsandoConjuro(false)
      setConjuroParaJugador(false)
      setConjuroParaRival(false)
    }
    setSeleccionJugador(null)
  }

  //Atacar, debe de haber una carta seleccionada
  const handleAtacar = cartas => {
    if (!cartas || cartas.length == 0) return
    let vidaEnemigo = vidaRival
    //Se hace un forEach de las cartas seleccionadas
    cartas.forEach(carta => {
      if (mesaEnemigo.length == 0) {
        //Ataca al rival 
        vidaEnemigo = vidaEnemigo - carta.ataque
        if (vidaEnemigo <= 0) {
          alert('GANASTE')
          setVidaRival(vidaEnemigo)
          setTurno('winner')
          hasGanado = true
        }
      } else {
        //La CPU se defenderá con una carta de su mesa al azar
        let defensa = mesaEnemigo[Math.floor(Math.random() * mesaEnemigo.length)]
        //Restamos la vida de ambas cartas, la nuestra y la suya, y si llega a 0 o menos, se destruye
        carta.vida = carta.vida - defensa.ataque
        defensa.vida = defensa.vida - carta.ataque

        if (carta.vida <= 0) {
          let indestructible = false
          //Se comprueba si es indestructible
          carta.habilidades.forEach(habilidad => {
            if (habilidad.includes('indestructible')) {
              indestructible = true
            }
          })
          if (indestructible) {
            //Se guarda con la vida restante
            setMesaJugador(prev =>
              prev.map(c =>
                c.nombre == carta.nombre
                  ? { ...c, vida: carta.vida }
                  : c
              )
            )
          } else {
            //Se destruye la carta si no es indestructible
            setMesaJugador(prev => prev.filter(c => c.nombre != carta.nombre))
          }
        } else {
          //Se guarda con la vida restante
          setMesaJugador(prev =>
            prev.map(c =>
              c.nombre == carta.nombre
                ? { ...c, vida: carta.vida }
                : c
            )
          )
        }

        if (defensa.vida <= 0) {
          let indestructible = false
          //Se comprueba si es indestructible
          defensa.habilidades.forEach(habilidad => {
            if (habilidad.includes('indestructible')) {
              indestructible = true
            }
          })
          if (indestructible) {
            setMesaEnemigo(prev =>
              prev.map(c =>
                c.nombre == defensa.nombre
                  ? { ...c, vida: defensa.vida }
                  : c
              )
            )
          } else {
            //Se destruye la carta si no es indestructible
            setMesaEnemigo(prev => prev.filter(c => c.nombre != defensa.nombre))
          }
        } else {
          //Se guarda con la vida restante
          setMesaEnemigo(prev =>
            prev.map(c =>
              c.nombre == defensa.nombre
                ? { ...c, vida: defensa.vida }
                : c
            )
          )
        }

      }
    })
    //Tras los cambios el turno es del adversario, si no has ganado
    if (!hasGanado) {
      setVidaRival(vidaEnemigo)
      setTurno('enemy')
    }
  }

  //Defender
  const handleDefender = carta => {

    if (!carta || !ataqueRival) return

    let mesaRivalLocal = [...mesaEnemigo]
    let mesaJugadorLocal = [...mesaJugador]
    let atacantesLocal = atacantesRival

    let vidaNueva = null
    //Actualizamos la mesa del jugador
    vidaNueva = carta.vida - ataqueRival.ataque
    mesaJugadorLocal = mesaJugadorLocal
      .map(c =>
        c.nombre === carta.nombre
          ? { ...c, vida: vidaNueva }
          : c
      )
      .filter(c => c.vida > 0);
    setMesaJugador(mesaJugadorLocal);
    //Actualizamos mesa del rival
    vidaNueva = ataqueRival.vida - carta.ataque
    mesaRivalLocal = mesaRivalLocal
      .map(c =>
        c.nombre === ataqueRival.nombre
          ? { ...c, vida: vidaNueva }
          : c
      )
      .filter(c => c.vida > 0);
    setMesaEnemigo(mesaRivalLocal)

    //Quitamos al atacante de los atacantes y lo actualizamos
    atacantesLocal = atacantesLocal.filter(atacante => atacante.nombre != ataqueRival.nombre)
    setAtacantesRival(atacantesLocal)

    //Se quita la defensa y el ataque
    setSeleccionJugador(null)
    setAtaqueRival(null)

    //Si no quedan atacantes se pasa al turno del jugador
    if (atacantesLocal.length == 0 || mesaRivalLocal.length == 0) {
      setTurno('player')
    } else {
      //Vuelve al enemigo para seguir atacando si quedan atacantes
      setTurno('enemy')
    }
  }

  //Pasar turno
  const handlePasarTurno = () => {
    if (turno != 'player') return
    //Si saltamos para atacar, se comprueba que no estemos ya atacando y que haya cartas en la mesa
    if (mesaJugador.length > 0 && turno != 'battle') {
      setTurno('battle')
      return
    }
    setTurno('enemy')
  }

  return (
    <div>
      {turno == 'defend' && ataqueRival && (
        <div style={{ margin: '20px 0', color: 'crimson' }}>
          <p>¡El rival ataca con <strong>{ataqueRival.nombre}</strong> (ATQ {ataqueRival.ataque})!</p>
          <p>Elige una de tus cartas en mesa para defender:</p>
        </div>
      )}

      <h1>Rival</h1>
      <h2>{vidaRival}</h2>
      <h3>{manaRival}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {enemigoHand.map(c => (
          <Carta key={c.nombre} {...c} disabled />
        ))}
        {mazoRival.length > 0 && (
          <div
            style={{
              border: '1px solid gray',
              float: 'right',
              borderRadius: '4px',
              width: '120px',
              height: '160px',
              margin: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fafafa',
            }}
          >
            <h3 style={{ margin: 0 }}>Mazo</h3>
            <p style={{ margin: '4px 0' }}>{mazoRival.length} cartas</p>
          </div>
        )}
      </div>

      <h2>Carta rival en mesa</h2>
      {mesaEnemigo.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {mesaEnemigo.map(c => (
            <Carta
              key={c.nombre}
              {...c}
              onClick={() => setSeleccionJugador(c)}
              //Solo se pueden seleccionar para conjuros
              disabled={(!conjuroParaRival)}
              isSelected />
          ))}

        </div>
      ) : (
        <p>Sin carta en mesa</p>
      )}


      <hr />

      <h1>Tu mano</h1>
      <h2>{vidaJugador}</h2>
      <h3>{manaJugador}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {jugadorHand.map(c => (
          <Carta
            key={c.nombre}
            {...c}
            onClick={() => {
              setSeleccionJugador(c)
            }}
            disabled={(turno != 'player' || usandoEquipo || conjuroParaRival || conjuroParaJugador)}
            isSelected={seleccionJugador?.nombre == c.nombre}
          />
        ))}

        {mazoJugador.length > 0 && (
          <div
            style={{
              border: '1px solid gray',
              float: 'right',
              borderRadius: '4px',
              width: '120px',
              height: '160px',
              margin: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fafafa',
            }}
          >
            <h3 style={{ margin: 0 }}>Mazo</h3>
            <p style={{ margin: '4px 0' }}>{mazoJugador.length} cartas</p>
          </div>
        )}
      </div>

      <h2>Tu mesa</h2>
      {mesaJugador.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {mesaJugador.map(c => (
            <Carta
              key={c.nombre}
              {...c}
              disabled={!(turno == 'battle' ||
                turno == 'defend' ||
                usandoEquipo ||
                !hasGanado ||
                conjuroParaJugador)}
              onClick={() => {
                //Si no es el turno de atacar o defender, se vuelve
                if (!(turno == 'battle' || turno == 'defend' || usandoEquipo || conjuroParaJugador)) return
                //Sino, se comprueba cuál de los dos es para saber cómo se interactua con las cartas
                if (turno == 'battle') {
                  setSeleccionCombate(prev => {
                    //Si ya fue seleccionada se quita la carta de la selección
                    if (prev.find(carta => carta.nombre == c.nombre)) {
                      return prev.filter(carta => carta.nombre != c.nombre)
                    }
                    //Sino, se añade
                    return [...prev, c]
                  })
                }
                if (turno == 'defend' || usandoEquipo) {
                  setSeleccionJugador(c)
                }
                if (conjuroParaJugador) {
                  setSeleccionJugador(c)
                }
              }}
              //Dependiendo del turno, la selección será diferente
              isSelected={
                turno == 'battle' ? seleccionCombate.some(carta => carta.nombre == c.nombre)
                  : (turno == 'defend' || usandoEquipo || conjuroParaJugador) ? seleccionJugador?.nombre == c.nombre
                    : false
              }
            />
          ))}
        </div>
      ) : (
        <p>Sin carta en mesa</p>
      )}


      {/* Boton colocar */}
      {seleccionJugador && turno == 'player' && !usandoEquipo && !conjuroParaJugador && !conjuroParaRival && (
        <button onClick={() => handleColocar(seleccionJugador)}>
          Colocar
        </button>
      )}
      {/* Boton atacar */}
      {seleccionCombate && turno == 'battle' && mesaJugador.length > 0 && (
        <button onClick={() => handleAtacar(seleccionCombate)} style={{ marginTop: '20px' }}>
          Atacar
        </button>
      )}
      {/* Boton defender */}
      {seleccionJugador && turno == 'defend' && mesaJugador.length > 0 && (
        <button onClick={() => handleDefender(seleccionJugador)} style={{ marginTop: '20px' }}>
          Defender
        </button>
      )}
      {/* Boton para pasar de turno al querer colocar o atacar */}
      {(turno == 'player' || turno == 'battle') && !usandoEquipo && !conjuroParaJugador && !conjuroParaRival && (
        <button onClick={handlePasarTurno}>
          Pasar
        </button>
      )}
      {/* Botones para cuando vaya a colocar una carta de equipo */}
      {(turno == 'player' && usandoEquipo) && (
        <div>
          <button onClick={() => handleEquipar(seleccionJugador, equipoAUsar)}>
            Usar
          </button>
          <button onClick={handleCancelar}>
            Cancelar
          </button>
        </div>
      )}
      {/* Botones para cuando vaya a colocar una carta de conjuro */}
      {(turno == 'player' && (conjuroParaJugador || conjuroParaRival)) && (
        <div>
          <button onClick={() => handleConjurar(seleccionJugador, conjuroAUsar)}>
            Usar
          </button>
          <button onClick={handleCancelar}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

export default App