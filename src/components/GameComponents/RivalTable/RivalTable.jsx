import { Box, Paper } from '@mui/material';
import './RivalTable.css';

function RivalTable({ cartas, phase, onCardClick }) {


  return (
    <Box className="rival-table-container">
      {cartas.map((carta, index) => {

        const cardClass = `rival-card-table ${carta.position === 'attack' ? 'attack-position' : ''}`;
        return (
          <Paper key={index} className={cardClass} elevation={10} onClick={() => {
              if (phase === 'defense' && onCardClick) {
                console.log('Defender a carta:', carta);
                onCardClick(carta);
              }
            }}>
            
            <img
              src={carta.image}
              alt={`Carta ${index + 1}`}
              className="rival-card-table-image"
            />
            
          </Paper>
        );
      })}
    </Box>
  );
}


export default RivalTable;



