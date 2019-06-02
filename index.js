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
app.post('/stories/', async (request, response) => {
  const incoming = pick(request.body, storyMask)
  const missingProperties = storyMask.filter((name) => !incoming.hasOwnProperty(name))
  if (missingProperties.length) {
    response.status(400)
    response.json({ error: `Request was missing required parameters: '${missingProperties.join(', ')}'` })
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
    response.json(sanitizedStory)
    io.emit('story', sanitizedStory)
    db.get('stories').push(sanitizedStory).write()
  }
})
