import React, { useState, useEffect } from "react";
import "./Shop.css";
import {
  Dialog,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Box
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { buyProduct } from "../../../services/Actions/GameActions";


function Shop({ shop , coins }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tabActiva, setTabActiva] = useState(0);
  
const handleCompra = async (producto) => {
  if (coins < producto.price) {
    alert("No tienes saldo suficiente para comprar este producto.");
    return;
  }

  try {
    await buyProduct(producto.id, producto.type);
    alert(`Has comprado: ${producto.name}`);
    // Aquí puedes actualizar el balance, productos, etc.
    // Por ejemplo:
    // reloadShopData();
  } catch (error) {
    console.error("Error en la compra:", error);
    alert("Hubo un error al procesar la compra.");
  }
};





 const mazos = shop.decks
  .filter((deck) => deck.available === false)
  .map((deck) => ({
    id: deck._id,
    name: deck.name,
    description: deck.description,
    image: deck.image,
    price: deck.price || 0,
    type: "deck",
  }));

const avatares = shop.avatars
  .filter((avatar) => avatar.available === false)
  .map((avatar) => ({
    id: avatar._id,
    name: avatar.name,
    description: `Avatar disponible en tienda.`,
    image: avatar.url,
    price: avatar.price || 0,
    type: "avatar",
  }));


  const items = [...mazos, ...avatares];
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const intervalo = setInterval(() => {
      setIndice((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(intervalo);
  }, [items.length]);

  if (items.length === 0) {
    return <p className="tienda-empty">No hay objetos en la tienda actualmente.</p>;
  }

  const siguiente = () => {
    setIndice((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const anterior = () => {
    setIndice((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const item = items[indice];

  return (
    <div className="tienda-container">
      <div className="tienda-carrusel">
        <button className="flecha" onClick={anterior}>
          &#8249;
        </button>

        <div className="mazo-card" onClick={() => setModalAbierto(true)} style={{ cursor: "pointer" }}>
          <h2>Tienda</h2>
          <img src={item.image} alt={item.name} className="mazo-imagen" />
          <h3>{item.type === "deck" ? `Desbloquea ${item.name}` : item.name}</h3>
          <p>{item.description}</p>
        </div>

        <button className="flecha" onClick={siguiente}>
          &#8250;
        </button>
      </div>

      <Dialog
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "rgba(30,30,30,0.95)",
            color: "white",
            borderRadius: "12px",
            padding: "1rem",
          },
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 1rem",
          }}
        >
          <Tabs
            value={tabActiva}
            onChange={(e, val) => setTabActiva(val)}
            textColor="inherit"
            indicatorColor="primary"
          >
            <Tab label="Mazos" />
            <Tab label="Avatares" />
          </Tabs>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <span style={{ color: "#c0b303", fontWeight: "bold" }}>
             {coins ?? 0} 🪙
            </span>
            <IconButton onClick={() => setModalAbierto(false)} style={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>


        <DialogContent dividers>
          <div className="tienda-scroll">
            {(tabActiva === 0 ? mazos : avatares).map((producto) => (
              <div
                key={producto.id}
                className="modal-card"
                onClick={() => handleCompra(producto)}
                style={{ cursor: "pointer" }}
              >
                <img src={producto.image} alt={producto.name} className="mazo-imagen" />
                <h3>{producto.type === "deck" ? `Desbloquea ${producto.name}` : producto.name}</h3>
                <p>{producto.description}</p>
                <p className="precio">{producto.price} 🪙</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Shop;
