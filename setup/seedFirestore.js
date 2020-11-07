const fs = require('fs')
const firebase = require('firebase')
const pizzas = require('./pizzas.json')

function checkConfigFile () {
  const firebaseConfigPath = './src/firebase-config.js'
  if (fs.existsSync(firebaseConfigPath)) {
    return true

  } else {
    return false
  }
}

function checkPermissions () {
  const config = require('../src/firebase-config')

  firebase.initializeApp(config)
  const db = firebase.firestore()

  return db.collection('test').get().then(() => {
    return true
  }).catch(err => {
    if (err.code === 'permission-denied') {
      return false
    }
    return true
  })
}

function seed () {
  const db = firebase.firestore()
  const pizzasCollection = db.collection('pizzas')

  return Promise.all(pizzas.map(pizza => pizzasCollection.add(pizza)))
}

module.exports = { seed, checkPermissions, checkConfigFile }