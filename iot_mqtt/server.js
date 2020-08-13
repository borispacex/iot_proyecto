'use strict'

const debug = require('debug')('iot_mqtt:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('iot_db')
const { parsePayload } = require('./utils')

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

const settings = {
  port: 1883,
  backend
}

const config = {
  database: process.env.DB_NAME || 'iot_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: s => debug(s)
}

const server = new mosca.Server(settings)
const clients = new Map()

let Agent, Metric

// cuando un cliente de MQTT se conecta a nuestro servidor
server.on('clientConnected', client => {
  debug(`Client CONNECTED: ${client.id}`)
  clients.set(client.id, null)
})

// cuando un cliente de MQTT se desconecta de nuestro servidor
server.on('clientDisconnected', async client => {
  debug(`Client DISCONNECTED: ${client.id}`)
  const agent = clients.get(client.id)
  
  if (agent) {
    // Marcar agente como desconectado
    agent.connected = false

    try {
      await Agent.createOrUpdate(agent)
    } catch (e) {
      return handleError(e)
    }

    // Borrar agente desde la lista de clients
    clients.delete(client.id)

    server.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })
    debug(`Client (${client.id}) associated to Agent (${agent.uuid}) marked as disconnected`)
  }
})

// cuando hay un mensaje publicado en nuestro servidor
server.on('published', async (packet, client) => {
  debug(`Received: ${packet.topic}`) // tipo de mensaje: 'agent connected, disconnected, message'

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`) // el mensaje viene en payload
      break
    case 'agent/message':
      debug(`Payload: ${packet.payload}`)
      const payload = parsePayload(packet.payload)
      console.log(payload)
      if (payload) {
        payload.agent.connected = true
        
        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError(e)
        }


        debug(`Agent ${agent.uuid} saved`)

        // Notificar Agente conectado
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }
        // Store Metrics
        // for (let metric of payload.metrics) {
        //   let m
        //   try {
        //     m = await Metric.create(agent.uuid, metric)
        //   } catch (error) {
        //       return handleError(error)
        //   }
        //   debug(`Metric ${m.id} saved on Agent ${agent.uuid}`)    
        // }
        const metricInsersionPromises = payload.metrics.map(metric => Metric.create(agent.uuid, metric))
        let metrics
        try {
          metrics = await Promise.all(metricInsersionPromises)
        } catch (e) {
          return handleError(e)
        }
        metrics.forEach(m => debug(`Metric: ${m.id} saved on agent ${agent.uuid}`))
      }
      break
  }
})

// cuando este correctamente
server.on('ready', async () => {
  const services = await db(config).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[iot_mqtt-mqtt]')} server is running`)
})


// cuando tenemos algun error
server.on('error', handleFatalError)

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

function handleError (err) {
  console.error(`${chalk.red('[error]')} ${err.message}`)
  console.error(err.stack)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
