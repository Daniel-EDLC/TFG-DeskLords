import { Box, Paper } from '@mui/material';
import './RivalTable.css';

function RivalTable({ cartas, phase, onCardClick }) {
  return (
    <Box className="rival-table-container">
      {cartas.map((carta, index) => {
        const cardClass = ` ${carta.position === 'attack' ? 'attack-position' : ''}`;

        return (
          <div key={index} className="rival-card-wrapper">
            <div className={`rival-card-table`}>
            <Paper
              className={cardClass}
              elevation={10}
              onClick={() => {
                if (phase === 'defense' && onCardClick) {
                  console.log('Defender a carta:', carta);
                  onCardClick(carta);
                }
              }}
            >
              <img
                src={carta.image}
                alt={`Carta ${index + 1}`}
                className="rival-card-image"
              />

              {carta.equipements && carta.equipements.length > 0 && (
                            <div className="rival-equipment-count">
                              {carta.equipements.length}</div>
                          )}

              {carta.equipements && carta.equipements.length > 0 && (
                <div className="rival-equipment-preview">
                  {carta.equipements.map((equipo) => (
                    <img
                      key={equipo.id}
                      src={equipo.image}
                      alt={equipo.id}
                      className="rival-equipment-image"
                    />
                  ))}
                </div>
              )}
            </Paper>
            </div>
          </div>
        );
      })}
    </Box>
  );
}

export default RivalTable;




