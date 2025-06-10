import React, { useState } from 'react';
import './Tutorial.css';

const Tutorial = ({ tutorialDeck, onFinish }) => {
  const [step, setStep] = useState(0);

  const scenes = [
    { img: 'https://storage.googleapis.com/imagenes-desklords/Imagenes_Tutorial/tutorial1-final.png', className: 'scene1 fade-in', text: '' },
    { img: 'https://storage.googleapis.com/imagenes-desklords/Imagenes_Tutorial/tutorial1-final.png', className: 'scene2 fade-in', text: '...' },
    { img: 'https://storage.googleapis.com/imagenes-desklords/Imagenes_Tutorial/tutorial2-final.png', className: 'scene3 fade-in', text: 'Hola viajero, has luchado valientemente a mi servicio todo este tiempo...' },
    { img: 'https://storage.googleapis.com/imagenes-desklords/Imagenes_Tutorial/tutorial2-final.png', className: 'scene4', text: 'Como sabes, durante años lideré estas tierras... pero ya no tengo fuerzas. Mis soldados necesitan a alguien joven, fuerte... como tú.' },
    { img: 'https://storage.googleapis.com/imagenes-desklords/Imagenes_Tutorial/tutorial3-final.png', className: 'scene5 fade-in', text: 'Te lo suplico... toma mi lugar y guía a estos guerreros.' },
    { img: 'https://storage.googleapis.com/imagenes-desklords/Imagenes_Tutorial/tutorial4-final.png', className: 'scene6 fade-in', text: '¡Tú eres el elegido! Ha llegado tu momento, toma estos soldados y lideralos hasta la victoria. ¡Devuélvenos la esperanza!' },
    { img: 'https://storage.googleapis.com/imagenes-desklords/Imagenes_Tutorial/tutorial5-final.png', className: 'scene7 fade-in', text: 'Ahora es tu turno. Lidera. Lucha. Y trae paz a este mundo...' },
    { img: 'https://storage.googleapis.com/imagenes-desklords/Imagenes_Tutorial/tutorial5-final.png', className: 'scene8 fade-in', text: 'Yo no puedo seguir luchando... no me quedan fuerzas... ' },
    { img: 'https://storage.googleapis.com/imagenes-desklords/Imagenes_Tutorial/tutorial5-final.png', className: 'scene9 fade-in', text: 'No los dejes solos...' },
    { img: 'https://storage.googleapis.com/imagenes-desklords/Imagenes_Tutorial/tutorial5-final.png', className: 'scene10 fade-in', text: 'Fuerza al reino...' },
  ];

  const handleNext = () => {
    if (step < scenes.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="tutorial-container">
      {step === 5 && tutorialDeck && (
        <div className="tutorial-deck-preview-tutorial">
          <img
            src={typeof tutorialDeck === 'string' ? tutorialDeck : tutorialDeck.image}
            alt="Deck desbloqueado"
            className="deck-image fade-in"
          />
        </div>
      )}
<img
  key={`back-${step}`}
  src={scenes[step].img}
  alt="scene"
  className="tutorial-image-back"
/>

<img
  key={`front-${step}`}
  src={scenes[step].img}
  alt="scene"
  className={`tutorial-image-tutorial ${scenes[step].className} `}
/>


      <div className="tutorial-overlay">
        <p className="tutorial-text">{scenes[step].text}</p>

        <button className="tutorial-button" onClick={handleNext}>
          {step === scenes.length - 1 ? 'Finalizar' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};

export default Tutorial;