const fs = require('fs');
const path = require('path')
const express = require('express')
const lowdb = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync.js')
const dataPath = path.join(__dirname, '.data', 'stories.json')
if (!fs.existsSync(dataPath)){
  fs.mkdirSync(dataPath, { recursive: true });
}
const adapter = new FileAsync(
  dataPath,
  {
    defaultValue: {
      stories: [
        {
          id: 0,
          x: 0,
          y: 0,
          text: 'Welcome to the origin.',
          time: '0/0/0 - The start of time.'
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

const app = express()
const port = (
  process.env.PORT // because glitch provides this for us
  || 3000
)

app.use(express.json()) // for parsing json encoded POST request

app.use(express.static('public'))
app.use(
  '/stories/stories.json',
  express.static(dataPath)
)

app.listen(
  port,
  () => {
    console.log(`Example app listening on port ${port}!`)
  }
)
