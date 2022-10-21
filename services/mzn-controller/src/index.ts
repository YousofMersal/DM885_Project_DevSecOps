import amqp from "amqplib"

const RABBIT_URL = process.env.RABBIT_URL
if (!RABBIT_URL) {
  console.error("Environment variable RABBIT_URL is not set")
  process.exit(1)
}

const queue = "tasks"
const conn = await amqp.connect(RABBIT_URL)

// Listener
const ch = await conn.createChannel()
await ch.assertQueue(queue)

setInterval(async () => {
  await ch.consume(queue, (msg) => {
    if (msg !== null) {
      console.log("Recieved:", msg.content.toString())
      ch.ack(msg)
    } else {
      console.log("Consumer cancelled by server")
    }
  })
}, 500)

console.log("Minizinc controller: running")
