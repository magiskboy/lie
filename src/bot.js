const { WebClient } = require("@slack/web-api");
const {
  getNews,
  getCovidHanoi,
  getWeather,
  getYoutubeTrending,
} = require("./utils");
const {
  GET_NEWS,
  GET_WEATHER,
  GET_COVID19_STAT,
  GET_YOUTUBE_TRENDING,
} = require("./commands");

class SlackBot {
  constructor(config) {
    this.webClient = new WebClient(config.botToken);
  }

  say(message) {
    const now = new Date();
    console.log(
      `[${now.toLocaleTimeString("vi-VN")} - ${now.toLocaleDateString(
        "vi-VN"
      )}] ${message}`
    );
  }

  async invoke(action, ...args) {
    let message = null;
    switch (action) {
      case GET_WEATHER:
        message = await this.prepareWeather("#weather", ...args);
        break;
      case GET_NEWS:
        message = await this.prepareNews("#news", ...args);
        break;
      case GET_COVID19_STAT:
        message = await this.prepareCOVID19("#covid19", ...args);
        break;
      case GET_YOUTUBE_TRENDING:
        message = await this.prepareYoutubeTrending("#youtube", ...args);
        break;
    }
    if (!!message) {
      if (Array.isArray(message)) {
        await Promise.all(
          message.map((item) => this.webClient.chat.postMessage(item))
        );
      } else {
        await this.webClient.chat.postMessage(message);
      }
    }
  }

  async prepareWeather(channel, locations) {
    const { WEATHER_API_KEY } = process.env;
    const data = await getWeather(locations, WEATHER_API_KEY);
    return {
      channel: channel,
      text: "Get weather",
      blocks: data.map((item) => ({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${item.location.name}, ${item.location.country}*
        Nhiệt độ: ${item.current.temp} °C
        Độ ẩm: ${item.current.humidity} %
        Điều kiện: ${item.current.condition}
        Chỉ số UV: ${item.current.uv}
        Mật độ mây: ${item.current.cloud} %
        Tốc độ gió: ${item.current.wind_kph} km/h
        Gió giật: ${item.current.gust_kph} km/h`,
        },
      })),
    };
  }

  async prepareNews(channel, topics) {
    const MAX_ITEM_PER_BLOCK = 30;
    const data = await getNews(topics);
    return data
      .map((topic) => {
        if (topic.items.length > MAX_ITEM_PER_BLOCK) {
          topic.items = topic.items.slice(0, MAX_ITEM_PER_BLOCK);
        }
        return topic;
      })
      .map(({ name, items }) => ({
        channel: channel,
        text: `New - ${name}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${name}*`,
            },
          },
          ...items.map((item) => ({
            type: "section",
            text: {
              type: "mrkdwn",
              text: `<${item.link}|${item.title}>`,
            },
          })),
        ],
      }));
  }

  async prepareCOVID19(channel, cities) {
    const data = await getCovidHanoi(cities);
    return {
      channel: channel,
      text: "COVID19",
      blocks: data
        .filter((item) => Number.isInteger(item.total))
        .map((item) => ({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${item.name}\nSố ca nhiễm: ${item.total}\n${item.detail}`,
          },
        })),
    };
  }

  async prepareYoutubeTrending(channel) {
    const { YOUTUBE_API_KEY } = process.env;
    const data = await getYoutubeTrending(10, YOUTUBE_API_KEY);
    return data.map((item) => ({
      channel: channel,
      text: "Youtube trending",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: item.url,
          },
        },
      ],
    }));
  }
}

module.exports = {
  SlackBot,
};
