import amqp from 'amqplib'

const queue = 'tasks'
const conn = await amqp.connect('amqp://user:secret@rabbitmq')

// Sender
const ch = await conn.createChannel()

setInterval(() => {
  console.log('Producing to queue...')
  ch.sendToQueue(queue, Buffer.from('something to do'))
}, 1000)
