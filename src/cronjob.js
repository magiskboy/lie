const { getNews, getCOVID19, getWeather } = require("./utils");
const { webClient } = require("./slack");

async function pushWeatherTo(channel, locations) {
  const { WEATHER_API_KEY } = process.env;
  const data = await getWeather(locations, WEATHER_API_KEY);
  await webClient.chat.postMessage({
    channel: channel,
    text: "",
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
  });
}

async function pushNewsTo(channel, topics) {
  const MAX_ITEM_PER_BLOCK = 30;
  const data = await getNews(topics);
  const promises = data
    .map((topic) => {
      if (topic.items.length > MAX_ITEM_PER_BLOCK) {
        topic.items = topic.items.slice(0, MAX_ITEM_PER_BLOCK);
      }
      return topic;
    })
    .map(({ name, items }) =>
      webClient.chat.postMessage({
        channel: channel,
        text: "",
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
      })
    );
  await Promise.all(promises);
}

async function pushCOVID19To(channel, cities) {
  const data = await getCOVID19(cities);
  await webClient.chat.postMessage({
    channel: channel,
    text: "",
    blocks: data.map((item) => ({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${item.city}*
        Tổng số: ${item.total}
        Nhiễm: ${item.infected}
        Tử vong: ${item.died}
        Khỏi: ${item.normal}`,
      },
    })),
  });
}

async function all() {
  await Promise.all([
    await pushWeatherTo("#weather", ["Hanoi", "Thanh Hoa"]),
    await pushNewsTo("#news", [
      { name: "Tin nổi bật", code: "tin-noi-bat" },
      { name: "Tin mới nhất", code: "tin-moi-nhat" },
      { name: "Tin xem nhiều", code: "tin-xem-nhieu" },
    ]),
    await pushCOVID19To("#covid19", ["1", "38"]),
  ]);
}

const job = process.argv[1];

switch (job) {
  case "weather":
    pushWeatherTo("#weather", ["Hanoi", "Thanh Hoa"]);
    break;
  case "covid19":
    pushCOVID19To("#covid19", ["1", "38"]);
  case "news":
    pushNewsTo("#news", [
      { name: "Tin nổi bật", code: "tin-noi-bat" },
      { name: "Tin mới nhất", code: "tin-moi-nhat" },
      { name: "Tin xem nhiều", code: "tin-xem-nhieu" },
    ]);
    break;
}
