const fs = require('fs');
const path = require('path')
const pick = require('lodash/pick')
const crypto = require('crypto')
const express = require('express')
const lowdb = require('lowdb')
const app = express()
const port = (
  process.env.PORT // because glitch provides this for us
  || 3000
)
const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})
const io = require('socket.io')(server)
const FileAsync = require('lowdb/adapters/FileAsync.js')
const dataDir = path.join(__dirname, '.data')
const dataPath = path.join(dataDir, 'stories.json')
if (!fs.existsSync(dataDir)){
  fs.mkdirSync(dataDir, { recursive: true });
}
const adapter = new FileAsync(
  dataPath,
  {
    defaultValue: {
      stories: [
        {
          id: 'f00000000000000d',
          x: 0,
          y: 0,
          text: 'Welcome to the origin.',
          time: 0
        }
      ]
    }
  }
)
let db
lowdb(adapter).then(async (result) => {
  db = result
  console.log('db ready')
  console.log(db.getState())
})

app.use(express.json()) // for parsing json encoded POST request

app.use(express.static('public'))
app.use(
  '/stories/stories.json',
  express.static(dataPath)
)

const generateId = () => {
  return crypto.randomBytes(8).toString('hex')
}
const storyMask = 'x,y,text'.split(',')
const handleStory = (unsanitizedStory) => {
  let result
  const incoming = pick(unsanitizedStory, storyMask)
  const missingProperties = storyMask.filter((name) => (
    !incoming.hasOwnProperty(name) ||
    (name === 'text' && !incoming[name])
  ))
  if (missingProperties.length) {
    result = { error: `Request was missing required parameters: '${missingProperties.join(', ')}'` }
    console.error(result)
  } else {
    const sanitizedStory = {
      id: generateId(),
      x: parseFloat(incoming.x) || 0,
      y: parseFloat(incoming.y) || 0,
      text: incoming.text,
      time: new Date().getTime()
    }
    console.log('New story', {
      sanitizedStory
    })
    io.emit('story', sanitizedStory)
    db.get('stories').push(sanitizedStory).write()
    result = sanitizedStory
  }
  return result
}

let usersNeedUpdate = false
let users = []
io.on('connection', (socket) => {
  console.log('a user connected', socket.id)
  const socketUser = {
    id: socket.id,
    x: 0,
    y: 0,
    hue: parseFloat(Math.random().toString().slice(0,6))
  }
  usersNeedUpdate = true
  users.push(socketUser)
  socket.on('ready', () => {
    socket.emit('users', users)
  })
  socket.on('move', (move) => {
    if (
      socketUser.x !== move.x && // only send changes if there -are- changes!
      socketUser.y !== move.y
    ) {
      usersNeedUpdate = true
      socketUser.x = move.x
      socketUser.y = move.y
    }
  })
  socket.on('disconnect', () => {
    usersNeedUpdate = true
    users = users.filter((user) => user !== socketUser)
  })
  socket.on('story', (story) => {
    socket.emit('response', handleStory(story))
  })
})
setInterval(() => {
  if (usersNeedUpdate) {
    usersNeedUpdate = false
    io.emit('users', users)
  }
}, 100)

app.post('/stories/', async (request, response) => {
  let result = handleStory(request.body)
  if (result.error) {
    response.status(400)
  }
  response.json(result)
})
