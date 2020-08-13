# iot-db

## Usage

``` js
const setupDatabase = requiere('iot_db')
setupDatabase(config).then(db => {
    // const { Agent, Metric } = db
    const Agent = db.Agent
    const Metric = db.Metric
}).catch(err => console.log(err))
```

### Instalamos el modulo STANDARD

npm i --save-dev standard

## Ejecutamos el script lint

npm run lint --fix

## Instalamos el modulo SEQUELIZE

npm install sequelize pg pg-hstore --save

## Instalamos modulo de DEBUG

npm i debug --save

## Ejecutamos setup para poder crear la base de datos

npm run setup

## Instalamos el modulo INQUIRER que permite hacer preguntas en la consola y CHALK que estiliza strings

npm i inquirer chalk --save

## probamos un error

DB_PASS='foo' npm run setup

## Instalamos un modulo AVA.JS para pruebas unitarias

npm install ava --save-dev

## Instalamos modulo DEFAULTS, para valores.

npm i defaults --save

## Instalamos SQLITE para hacer pruebas

npm i sqlite3 --save-dev

## Instalamos el modulo NYC, para el set de pruebas

npm install nyc --save-dev

## Instalamos el modulo SINON y PROXYQUIRE para acceder a los modelos, sobre-escribir

npm install sinon --save-dev
npm install proxyquire --save-dev


