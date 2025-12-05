const { createClient } = require("redis");

require("dotenv").config();

const config = {
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  password: process.env.REDIS_PASSWORD,
};

const client = createClient(config);
client.connect().then(() => console.log("✅ Redis client connected"));

const subscriber = createClient(config);
subscriber.connect().then(() => console.log("✅ Redis subscriber connected"));

client.on("error", (err) => console.error("❌ Client error:", err));
subscriber.on("error", (err) => console.error("❌ Subscriber error:", err));

module.exports = { client, subscriber };
