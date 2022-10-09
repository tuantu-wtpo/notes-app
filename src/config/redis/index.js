require("dotenv").config();
const Redis = require("redis");
const client = Redis.createClient({
  url: process.env.REDIS_CONNECT_URL,
});

client.on("ready", () => console.log("Redis connected"));

client.on("error", (err) => console.log("Redis Client Error:", err));

(async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error("error while connecting redis", error);
  }
})();

module.exports = { client };
