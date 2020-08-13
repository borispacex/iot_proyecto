'use strict'

const debug = require('debug')('iot_db:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const db = require('./')

const prompt = inquirer.createPromptModule()

async function setup () {
  const answer = await prompt([
      {
          type: 'confirm',
          name: 'setup',
          message: 'Esto va a destruir la DB, esta seguro ?'
      }
  ])
  
  if (!answer.setup) {
      return console.log('No pasa nada!')
  }

  const config = {
    database: process.env.DB_NAME || 'iot_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }

  await db(config).catch(handleFatalError)
  console.log('Success!')
  process.exit(0)
}

function handleFatalError (err) {
  console.log(`${chalk.red('[Fatal error]')} ${err.message}`)
  console.log(err.stack)
  process.exit(1)
}

setup()
