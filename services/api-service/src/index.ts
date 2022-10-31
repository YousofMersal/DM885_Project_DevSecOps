import express from 'express'

const app = express()
const port = process.env.PORT || 8080

app.get('/', (req, res) => {
  res.send('This is the API service')
})

const server = app.listen(port, () => {
  console.log(`API service listening on port ${port}`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server...')
  server.close(() => {
    console.log('HTTP server stopped')
  })
})
