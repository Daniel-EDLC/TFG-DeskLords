# maps

## Aterrizaje

Selección de mapa.

1. Listar maps

GET /maps (Ordenado por level en orden ascendente)

```json
{
    "total": 10,
    "data": [
        {
            "id": "map_a0ea77ea-e28c-4c57-be6d-63d34c63696a",
            "name": "Terror",
            "level": 1,
            "image_url": "https://publicwhatever.com/maps/map_a0ea77ea-e28c-4c57-be6d-63d34c63696a/general.png"
        }
    ]
}
```

2. Detalle del mapa

GET /maps/{map_id}

```json
{
    "id": "map_a0ea77ea-e28c-4c57-be6d-63d34c63696a",
    "name": "Terror",
    "level": 1,
    "image": "https://publicwhatever.com/maps/map_a0ea77ea-e28c-4c57-be6d-63d34c63696a/general.png",
    "rival": {
        "id": "rvl_8a1af633-415c-4b3a-b16d-e92fabf2b4f0",
        "image":"https://publicwhatever.com/maps/rvl_a0ea77ea-e28c-4c57-be6d-63d34c63696a/general.png",
        "deck":{
            "id":"dck_b8814c82-7e1c-4238-a96b-0a6c31e81072",
            "name": "Mazo agua"
        }
    }
}
```

## Usuario

1. Detalles de usuario

GET /me
Authorization: Cookie {cookie} // User id from the cookie

```json
{
    "id": "usr_74eefa91-3d04-493f-9609-afac67716ffc",
    "email": "my-email@gmail.com",
    "decks": [
        {
            "id": "dck_47690572-f6e3-4d2b-9472-77e75ca83c41",
            "name": ""
        }
    ]
}
```
