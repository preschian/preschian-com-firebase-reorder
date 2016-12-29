const hapi = require('hapi')
const moment = require('moment')
const firebase = require('firebase')

// environment variables see: https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true })

// config hapi
const server = new hapi.Server()
server.connection({
  port: process.env.PORT || 8000,
  routes: {
    cors: {
      origin: ['*']
    }
  }
})

// firebase config
const config = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId
}
firebase.initializeApp(config)
const database = firebase.database()

function runReorder() {
  return database.ref('/').orderByChild('order').once('value').then((snap) => {
    let data = []
    let queue = 1
    snap.forEach((val) => {
      const key = val.key
      const date = moment(new Date(val.child('date').val())).format('MMMM DD, YYYY')
      const content = val.child('content').val().replace(new RegExp('http://', 'g'), 'https://')
      const update = {
        content,
        date,
        order: queue
      }

      database.ref(`/${key}`).update(update)
      console.log(queue, val.child('title').val())

      queue += 1
    })
  })
}

server.route([{
  method: 'GET',
  path: '/',
  handler(request, reply) {
    runReorder().then(() => {
      reply('done')
    })
  }
}])

server.start(err => {
  if (err)
    throw err

  console.log('Server running at:', server.info.uri)
})