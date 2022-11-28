import startRestAPI from './api/restApi.js'
import { configureK8sClient } from './jobs/k8s-client.js'

const k8sClient = await configureK8sClient()

const server = startRestAPI(k8sClient)

registerGracefulExit()
function registerGracefulExit() {
  const exit = () => {
    console.log('shutting down gracefully...')

    server.close((err) => {
      if (err) console.error('Error shutting down express', err)
      else console.log('Web server closed successfully')
      process.exit()
    })
  }

  process.on('exit', exit)
  //catches ctrl+c event
  process.on('SIGINT', exit)
  process.on('SIGTERM', exit)
  // catches 'kill pid' (for example: nodemon restart)
  process.on('SIGUSR1', exit)
  process.on('SIGUSR2', exit)
}