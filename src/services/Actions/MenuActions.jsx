import Informacion from '../../mockCalls/info.json';


export async function cargaInformacion() {


  try {
    await new Promise(res => setTimeout(res, 300)); // Simula una llamada async

    const data = Informacion;
    console.log('Respuesta simulada de la carga:');

    return data;

  } catch (error) {
    console.error('Error simulado al enviar defensa:', error);
  }
}