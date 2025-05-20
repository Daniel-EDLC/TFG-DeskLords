# Juego

- [Juego](#juego)
  - [Reglas generales](#reglas-generales)
  - [Pasos](#pasos)
    - [Empezar partida](#empezar-partida)
    - [Usar cartas de la mano](#usar-cartas-de-la-mano)
      - [Usar criature](#usar-criature)
      - [Usar spell](#usar-spell)
      - [Usar equipement](#usar-equipement)
    - [Finalizar fase](#finalizar-fase)
    - [Atacar](#atacar)
    - [Finalizar turno sin atacar](#finalizar-turno-sin-atacar)
    - [Defender](#defender)

## Reglas generales

- El front solo manda IDs porque el back tiene que validar que esos IDs son validos, pertenecen a las cartas, mazos, etc para recuperar el estado de la carta, sus propiedades y si se pueden usar o no
- El back tiene toda la lógica del juego, el front solo permite al usuario seleccionar acciones
- El front recibe el estado en cada llamada al back para poder pintarlo
  - Para el usuario muestra los detalles porque el usuario lo puede conocer
  - Para el rival solo se usan totales: numero de cartas, vidas, etc., nunca IDs ni detalles de carta porque el usuario podría verlo en la network del navegador.
- Devolver al front:
  - Para el rival, el número de cartas en la mano y el mazo pero nunca los detalles de las cartas que deberían ser secretos.
  - Para el usuario, los detalles de las cartas de la mano y la mesa pero no del mazo.
- User ID from cookie que se pasa en el header `Authorization` como `Cookie {cookie}`.
  pero no computa nada del juego.

## Pasos

### Empezar partida

- Generar ID y fecha de inicio de partida con el deck del usuario para ese mapa
- Barajar deck del rival
- Barajar deck del usuario
- Asignar 7 cartas al rival y 7 al usuario

POST /games

```json
{
  "map": {
    "id": "map_a0ea77ea-e28c-4c57-be6d-63d34c63696a"
  },
  "user": {
    "deck": {
      "id": "dck_47690572-f6e3-4d2b-9472-77e75ca83c41"
    }
  }
}
```

201 Created

```json
{
  "id": "gam_d595ad1a-263a-485f-b6fc-70c513edf40d",
  "status": "in_progress",
  "start_at": "2025-05-02T13:00:00.00+02:00", // ISO8601 with timezone,
  // En cada acción se devuelve el estado del juego
  "turn": {
    "number": 1,
    "whose": "user", // user | rival
    "phase": "hand" // hand | table
  },
  "user": {
    "hand": [
      {
        "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
        "type": "criature", // criature | equipement | spell
        "image": "/cards/card1.jpg",
        "cost": 10,
        "health": 100,
        "attack": 111,
        "defense": 222,
        "equipements": []
      }, // 7 cartas
      {
        "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
        "type": "criature", // criature | equipement | spell
        "image": "/cards/card1.jpg",
        "cost": 10,
        "health": 100,
        "attack": 111,
        "defense": 222,
        "equipements": []
      },
      {
        "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
        "type": "criature", // criature | equipement | spell
        "image": "/cards/card1.jpg",
        "cost": 10,
        "health": 100,
        "attack": 111,
        "defense": 222,
        "equipements": []
      },
      {
        "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
        "type": "criature", // criature | equipement | spell
        "image": "/cards/card1.jpg",
        "cost": 10,
        "health": 100,
        "attack": 111,
        "defense": 222,
        "equipements": []
      },
      {
        "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
        "type": "criature", // criature | equipement | spell
        "image": "/cards/card1.jpg",
        "cost": 10,
        "health": 100,
        "attack": 111,
        "defense": 222,
        "equipements": []
      },
      {
        "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
        "type": "criature", // criature | equipement | spell
        "image": "/cards/card1.jpg",
        "cost": 10,
        "health": 100,
        "attack": 111,
        "defense": 222,
        "equipements": []
      },
      {
        "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
        "type": "criature", // criature | equipement | spell
        "image": "/cards/card1.jpg",
        "cost": 10,
        "health": 100,
        "attack": 111,
        "defense": 222,
        "equipements": []
      }
    ],
    "table": [], // No aparece en la creación
    "pending_deck": 8,
    "health": 30,
    "mana": 1
  },
  "rival": {
    "hand": 7,
    "table": [], // No aparece en la creación
    "pending_deck": 8,
    "health": 30,
    "mana": 1
  }
}
```

### Usar cartas de la mano

POST /games/{game_id}/cards/{card_id}/use

#### Usar criature

```json
{
  "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
  "type": "criature"
}
```

200 OK

```json
{
  "action_result": {
    "type": "use"
  },
  // Estado final en cada acción. Solo se indica ejemplo de cambio
  "user": {
    "hand": [], // Carta eliminada de la mano
    "table": [], // Carta añadida a table
    "mana": -1
  }
}
```

#### Usar spell

```json
{
  "type": "spell",
  "action": {
    "type": "kill", // kill | protect_one | protect_all
    "target": {
      // Solo para kill o protect_one
      "id": "crd_bd011b5f-dbdf-4f99-8421-dbfc80f4cfcb"
    }
  }
}
```

200 OK

```json
{
  "action_result": {
    "type": "use"
  },
  // Estado final en cada acción. Solo se indica ejemplo de cambio
  "user": {
    "hand": [], // Carta spell eliminada de la mano
    "table": [], // Carta spell añadida a table. Se elimina al siguente turno del usuario
    "mana": -1
  }
}
```

#### Usar equipement

```json
{
  "action_result": {
    "type": "use"
  },
  "type": "equipement",
  "target": {
    // Target card
    "id": "crd_bd011b5f-dbdf-4f99-8421-dbfc80f4cfcb"
  }
}
```

200 OK

```json
{
  // Estado final en cada acción. Solo se indica ejemplo de cambio
  "user": {
    "hand": [], // Carta equipement eliminada de la mano
    "table": [], // Carta equipement añadida a table a una de las criaturas
    "mana": -1
  }
}
```

### Finalizar fase

Para pasar de fase mano a fase ataque

POST /games/{game_id}/end_phase
sin body

OK 200

```json
    // Estado final en cada acción
```

### Atacar

POST /games/{game_id}/attack

```json
{
  "cards": [
    {
      "id": "crd_50482b04-4903-4512-993b-a03f68ee0d48"
    },
    {
      "id": "crd_5e29d7ba-9dd7-45a1-a035-6fcdde451fb1"
    }
  ]
}
```

200 OK

```json
{
  "action_result": {
    "type": "attack",
    "battle": [
      {
        "attacker": {
          "id": "crd_50482b04-4903-4512-993b-a03f68ee0d48",
          "status": "cemetery",
          "health": 0
        },
        "defender": {
          // Opcional
          "id": "crd_514e3c93-0b92-4ba6-99c3-97fd0d77f7a2",
          "status": "table",
          "health": 5
        },
        "health": 0
      },
      {
        "attacker": {
          "id": "crd_5e29d7ba-9dd7-45a1-a035-6fcdde451fb1",
          "status": "table",
          "health": 10
        },
        "health": -5
      }
    ],
    "rival": {
      "health": -5
    }
  },
  "rival_steps": {
    // Simulation of next steps
    "steal_deck": true, // true | false,
    "hand": [
      {
        "id": "crd_477c2998-e050-4b4b-8f5c-b65f80b356f1", // Spell card ID
        "type": "spell",
        "action": {
          "type": "kill", // kill | protect_one | protect_all
          "target": {
            // Solo para kill o protect_one
            "id": "crd_bd011b5f-dbdf-4f99-8421-dbfc80f4cfcb"
          }
        },
        "action_result": {
          "type": "use",
          "mana": -1
        }
      }
    ],
    "attack": [
      {
        "id": "crd_87ae8a50-6afb-426b-abb9-4cdccc495d65"
      }
    ]
  }

  // Estado final en cada acción
}
```

### Finalizar turno sin atacar

POST /games/{game_id}/end_turn
sin body

```json
{
  "rival_steps": {
    // Simulation of next steps igual que en ataque
    "steal_deck": true, // true | false,
    "hand": [
      {
        "id": "crd_477c2998-e050-4b4b-8f5c-b65f80b356f1", // Spell card ID
        "type": "spell",
        "action": {
          "type": "kill", // kill | protect_one | protect_all
          "target": {
            // Solo para kill o protect_one
            "id": "crd_bd011b5f-dbdf-4f99-8421-dbfc80f4cfcb"
          }
        },
        "action_result": {
          "type": "use",
          "mana": -1
        }
      }
    ],
    "attack": [
      {
        "id": "crd_87ae8a50-6afb-426b-abb9-4cdccc495d65"
      }
    ]
  }
  // Estado final en cada acción
}
```

### Defender

POST /games/{game_id}/defend

```json
{
  "cards": [
    {
      "id": "crd_f960c45c-d6d7-44ea-8db9-1869be85ca95", // ID del defensa
      "attacker": {
        "id": "crd_ccc8232f-16dc-45d6-9d84-1d8d6b9a3fe1"
      }
    },
    {
      "id": "crd_defender_id_2",
      "attacker": {
        "id": "crd_ccc8232f-16dc-45d6-9d84-1d8d6b9a3fe1"
      }
    }
  ]
}
```

200 OK

```json
{
  "action_result": {
    "type": "defense",
    "battle": [
      {
        "defender": {
          // Opcional
          "id": "crd_514e3c93-0b92-4ba6-99c3-97fd0d77f7a2",
          "status": "table"
        },
        "attacker": {
          "id": "crd_50482b04-4903-4512-993b-a03f68ee0d48",
          "status": "cemetery"
        },
        "health": 0
      },
      {
        "attacker": {
          "id": "crd_5e29d7ba-9dd7-45a1-a035-6fcdde451fb1",
          "status": "table"
        },
        "health": -5
      }
    ],
    "turn": {
      "number": 1,
      "whose": "user", // user | rival
      "phase": "hand" // hand | table
    }
  },
  "user": {
    "hand": [
      {
        "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
        "type": "criature", // criature | equipement | spell
        "image": "/cards/card1.jpg",
        "cost": 10,
        "health": 100,
        "attack": 111,
        "defense": 222,
        "equipements": []
      }, // 7 cartas
      {
        "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
        "type": "criature", // criature | equipement | spell
        "image": "/cards/card1.jpg",
        "cost": 10,
        "health": 100,
        "attack": 111,
        "defense": 222,
        "equipements": []
      },
      {
        "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
        "type": "criature", // criature | equipement | spell
        "image": "/cards/card1.jpg",
        "cost": 10,
        "health": 100,
        "attack": 111,
        "defense": 222,
        "equipements": []
      },
      {
        "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
        "type": "criature", // criature | equipement | spell
        "image": "/cards/card1.jpg",
        "cost": 10,
        "health": 100,
        "attack": 111,
        "defense": 222,
        "equipements": []
      },
      {
        "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
        "type": "criature", // criature | equipement | spell
        "image": "/cards/card1.jpg",
        "cost": 10,
        "health": 100,
        "attack": 111,
        "defense": 222,
        "equipements": []
      },
      {
        "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
        "type": "criature", // criature | equipement | spell
        "image": "/cards/card1.jpg",
        "cost": 10,
        "health": 100,
        "attack": 111,
        "defense": 222,
        "equipements": []
      },
      {
        "id": "crd_b18f9a2d-5a50-4d88-946a-e0f9f6ce37ec",
        "type": "criature", // criature | equipement | spell
        "image": "/cards/card1.jpg",
        "cost": 10,
        "health": 100,
        "attack": 111,
        "defense": 222,
        "equipements": []
      }
    ],
    "table": [], // No aparece en la creación
    "pending_deck": 8,
    "health": 30,
    "mana": 1
  },
  "rival": {
    "hand": 7,
    "table": [], // No aparece en la creación
    "pending_deck": 8,
    "health": 30,
    "mana": 1
  }
}
// Estado final en cada acción
```
