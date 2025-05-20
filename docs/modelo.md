# Modelo

## Usuario (user)

El jugador.

```json
{
    "id": "usr_8ea2f79b-651a-43db-89fd-3e0483da6666", // ID único generado
    "status": "active", // Calculado en el back, active | suspended | banned | deleted
    "name": "Manolito", // Del registro
    "register_date": "20250607", // Del registro
    "profile_image": "", // Imagen de perfil en un site publico
    "player_level": 1, // Calculado en el back con las partidas que ha jugado
    "owned_decks": [], // En Mazo (deck), calculado en el back con las partidas que ha jugado
    "actual_map": "",
    "hand": [], // Solo en Juego (game)
    "table": [], // Solo en Juego (game)
    "pending_deck": 9, // Solo en Juego (game)
    "health": 100, // Solo en Juego (game)
    "mana": 80 // Solo en Juego (game)
}
```

## Rival (rival)

El oponent

```json
{
    "id": "usr_8ea2f79b-651a-43db-89fd-3e0483da6666", // ID único generado
    "name": "Manolito", // Calculado
    "image": "", // Imagen en un site publico
    "deck": {}, // En Mazo (deck)
    "hand": 8, // Solo en Juego (game)
    "table": [], // Solo en Juego (game)
    "pending_deck": 9, // Solo en Juego (game)
    "health": 100, // Solo en Juego (game)
    "mana": 80 // Solo en Juego (game)
}
```

## Mapa (map)

```json
{
    "id": "map_36ec0d19-9fc8-40bb-ae5f-6202d44d0547",
    "name": "Tierras de Tarraco",
    "image": "", // Imagen en un site publico
    "level": 1, // Calculado
    "rival": {} // De Rival (rival)
}
```

## Mazo (deck)

```json
{
    "id": "dck_d710eb86-a78f-44d1-b808-7c522b940ee1",
    "name": "Mazo de agua",
    "image": "", // Imagen en un site publico
    "cards": [] // De Carta (card)
}
```

## Carta (card)

```json
{
    "id": "crd_d710eb86-a78f-44d1-b808-7c522b940ee1",
    "type": "criature", // criature | spell | equipement
    "name": "Guarruzo",
    "description": "Puede atacar sorteando las defensas con un 1:2 de posibilidades",
    "image": "", // Imagen en un site publico
    "element": "light", // light | army | darkness | magic
    "cost": 1, // Mana cost
    "status": "cemetery", // deck | hand | table | cemetery  Only in Juego (game)
    "set": {
        "id": "set_c6d457a8-4083-4ef4-8816-4b2628b99bf8" // Set ID
    }
}
```

### Criature (criature)

```json
{
    [...] // Común
    "habilities": [
        {
            "id": "hbl_276429d1-e98e-447c-b5e8-c2a5107e7501",
            "name": "",
            "description": ""
        }
    ],
    "attack": 100,
    "defense": 200
}
```

### Hechizo (spell)

```json
{
    [...] // Común
    "action": {
        "type": "kill", // kill | protect_one | protect_all
    }
}
```

### Equipamiento (equipement)

```json
{
    [...] // Común
    "attack": 10,
    "defense": 33
}
```

## Juego (game)

```json
{
    "id": "gam_d595ad1a-263a-485f-b6fc-70c513edf40d",
    "status": "in_progress", // in_progress | abandoned | finished
    "result": "win", // win | loss Solo para finished
    "start_at": "2025-05-02T13:00:00.00+02:00", // ISO8601 with timezone,
    // Siempre devolver como estado del juego al terminar una accion turn, user, rival
    "turn": { 
        "number": 1,
        "whose": "user", // user | rival
        "phase": "hand" // hand | table
    },
    "user": {}, // De Usuario (user) de la parte de juego
    "rival": {} // De Rival (rival) de la parte de juego
}
```

## Resultado de acción (result)

```json
{
    "type": "" // defense, attack, end_turn
}
```
