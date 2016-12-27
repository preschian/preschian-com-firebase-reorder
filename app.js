const moment = require('moment')
const firebase = require('firebase')

// environment variables see: https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true })

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

database.ref('/').orderByChild('order').once('value').then((snap) => {
  let queue = 1
  snap.forEach((val) => {
    const key = val.key
    const date = moment(new Date(val.child('date').val())).format('MMMM DD, YYYY')
    const content = val.child('content').val().replace(new RegExp('http://', 'g'), 'https://')

    database.ref(`/${key}`).update({
      content: content,
      date: date,
      order: queue
    })
    console.log(queue, val.child('title').val())

    queue += 1
  })
}).then(() => console.log('done!'))