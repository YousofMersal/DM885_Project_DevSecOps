import express from 'express'

const app = express()
const port = process.env.PORT || 8080

app.get('/api/v1/auth', (req, res) => {
  res.send('This is the API service')
})

const server = app.listen(port, () => {
  console.log(`Authentication service listening on port ${port}`)
})

app.use((req, res, next) => {
  res
    .status(404)
    .send(
      `404 auth service route '${req.path}' not found, note service is served under /api/v1/auth`
    )
})

registerGracefulExit()
function registerGracefulExit() {
  const exit = () => {
    process.stdout.write(`shutting down gracefully...\n`)
    process.exit()
  }

  process.on('exit', exit)
  //catches ctrl+c event
  process.on('SIGINT', exit)
  process.on('SIGTERM', exit)
  // catches 'kill pid' (for example: nodemon restart)
  process.on('SIGUSR1', exit)
  process.on('SIGUSR2', exit)
}
