
## `agent/connected`

``` js
{
    agent: {
        uuid,       // auto generar
        username,   // definir por configuracion
        name,       // definir por configuracion
        hostname,   // obtener del sistema operativo
        pid         // obtener del proceso
    }
}
```

## `agent/disconnected`

``` js
{
    agent: {
        uuid
    }
}
```

## `agent/message`

``` js
{
    agent,
    metrics: [
        {
            type,
            value
        }
    ],
    timestamp       // generar cuando creamos el mensaje
}
```

## Instalamos los modulos NODEMON  y STANDARD

npm i --save-dev standard nodemon

## Instalamos el modulo DEBUG, MOSCA, REDIS, CHALK

npm i --save debug mosca redis chalk

## Instalamos MQTT con nodejs

npm install -g mqtt@4.0.0
mqtt pub -t 'agent/message' -h localhost -m '{"hello": "servidor"}'

## Probamos

mqtt pub -t 'agent/message' -m 'hello'

mqtt pub -t 'agent/message' -m '{"agent": {"uuid": "yyy", "name": "platzi", "username": "platzi", "pid": 10, "hostname": "platzibogota"}, "metrics": [{"type": "memory", "value": "1001"}, {"type": "temp", "value": "33"}]}'
