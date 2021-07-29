const dev = process.env.NODE_ENV !== "production";
if (dev) {
  const dotenv = require("dotenv");
  dotenv.config();
}

const { SlackBot } = require("./bot");
const { GET_COVID19_STAT } = require("./commands");

const bot = new SlackBot({ botToken: process.env.SLACK_BOT_TOKEN });
bot.invoke(GET_COVID19_STAT);
