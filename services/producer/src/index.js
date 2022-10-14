import amqp from 'amqplib'

const RABBIT_URL = process.env.RABBIT_URL
if (!RABBIT_URL) {
  console.error('Environment variable RABBIT_URL is not set')
  process.exit(1)
}

const queue = 'tasks'
const conn = await amqp.connect(RABBIT_URL)

// Sender
const ch = await conn.createChannel()

setInterval(() => {
  console.log('Producing to queue...')
  ch.sendToQueue(queue, Buffer.from('something to do'))
}, 1000)
