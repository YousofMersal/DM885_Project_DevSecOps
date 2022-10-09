import amqp from 'amqplib'

const queue = 'tasks'
const conn = await amqp.connect('amqp://user:secret@rabbitmq')

// Listener
const ch = await conn.createChannel()
await ch.assertQueue(queue)

setInterval(async () => {
  await ch.consume(queue, (msg) => {
    if (msg !== null) {
      console.log('Recieved:', msg.content.toString())
      ch.ack(msg)
    } else {
      console.log('Consumer cancelled by server')
    }
  })
}, 500)
