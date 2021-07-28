const dev = process.env.NODE_ENV !== "production";
if (dev) {
  const dotenv = require("dotenv");
  dotenv.config();
}

const { CronJob } = require("cron");
const { SlackBot } = require("./bot");
const {
  GET_NEWS,
  GET_WEATHER,
  GET_COVID19_STAT,
  GET_YOUTUBE_TRENDING,
} = require("./commands");

const bot = new SlackBot({ botToken: process.env.SLACK_BOT_TOKEN });

const getWeatherJob = new CronJob("0 0 */1 * * *", () => {
  bot.say("Get weather");
  bot.invoke(GET_WEATHER, ["Hanoi", "Thanh Hoa"]);
});

const getCOVID19Job = new CronJob("0 0 */4 * * *", () => {
  bot.say("Get COVID19 statistics");
  bot.invoke(GET_COVID19_STAT, ["1", "38"]);
});

const getNewsJob = new CronJob("0 0 */8 * * *", () => {
  bot.say("Get daily news");
  const topics = [
    { name: "Tin nổi bật", code: "tin-noi-bat" },
    { name: "Tin mới nhất", code: "tin-moi-nhat" },
    { name: "Tin xem nhiều", code: "tin-xem-nhieu" },
  ];
  bot.invoke(GET_NEWS, topics);
});

const getYoutubeTrendingJob = new CronJob("0 0 */8 * * *", () => {
  bot.say("Get youtube trending");
  bot.invoke(GET_YOUTUBE_TRENDING);
});

getWeatherJob.start();
getCOVID19Job.start();
getNewsJob.start();
getYoutubeTrendingJob.start();
