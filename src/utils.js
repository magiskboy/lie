const axios = require("axios");
const Parser = require("rss-parser");
const parse = require("node-html-parser").parse;
const config = require("./config");

async function getWeather(locations, apiKey) {
  const promises = locations.map((loc) =>
    axios.get(config.WEATHER_API, {
      params: {
        lang: "vi",
        q: loc,
        aqi: "no",
        key: apiKey,
      },
    })
  );
  const responses = await Promise.all(promises);
  return responses
    .map((item) => item.data)
    .map((item) => ({
      current: {
        last_updated: item.current.last_updated,
        temp: item.current.temp_c,
        condition: item.current.condition.text,
        wind_kph: item.current.wind_kph,
        humidity: item.current.humidity,
        gust_kph: item.current.gust_kph,
        cloud: item.current.cloud,
        uv: item.current.uv,
      },
      location: {
        name: item.location.name,
        country: item.location.country,
      },
    }));
}

async function getNews(topics) {
  const promises = topics.map((item) =>
    new Parser().parseURL(`${config.NEWS_RSS}/${item.code}.rss`)
  );
  const data = await Promise.all(promises);
  return data.map((topic, index) => ({
    name: topics[index].name,
    items: topic.items.map((item) => ({
      title: item.title,
      link: item.link,
    })),
  }));
}

async function getYoutubeTrending(size, apiKey) {
  const resp = await axios.get(config.YOUTUBE_API, {
    params: {
      chart: "mostPopular",
      regionCode: "VN",
      maxResults: size,
      locale: "vi-VN",
      part: "snippet",
      key: apiKey,
    },
    headers: {
      "x-origin": "https://explorer.apis.google.com",
    },
  });
  return resp.data.items.map((item) => ({
    title: item.snippet.title,
    image: item.snippet.thumbnails.medium.url,
    url: `https://youtube.com/watch?v=${item.id}`,
  }));
}

async function getCovidHanoi() {
  const resp = await axios.get(
    "https://soyte.hanoi.gov.vn/tin-tuc-su-kien-noi-bat/-/asset_publisher/4IVkx5Jltnbg/content/cap-nhat-tinh-hinh-dich-benh-covid-19-tai-thanh-pho-ha-noi"
  );
  const html = parse(resp.data);
  return [
    {
      name: "Sáng",
      total: parseInt(
        html.querySelector(
          "#_101_INSTANCE_4IVkx5Jltnbg_5876672 > div.journal-content-article > table.Table > tbody > tr:nth-child(4) > td:nth-child(2) > p"
        ).textContent
      ),
      detail: html.querySelector(
        "#_101_INSTANCE_4IVkx5Jltnbg_5876672 > div.journal-content-article > table.Table > tbody > tr:nth-child(4) > td:nth-child(3) > p"
      ).textContent,
    },
    {
      name: "Trưa",
      total: parseInt(
        html.querySelector(
          "#_101_INSTANCE_4IVkx5Jltnbg_5876672 > div.journal-content-article > table.Table > tbody > tr:nth-child(5) > td:nth-child(2) > p"
        ).textContent
      ),
      detail: html.querySelector(
        "#_101_INSTANCE_4IVkx5Jltnbg_5876672 > div.journal-content-article > table.Table > tbody > tr:nth-child(5) > td:nth-child(3) > p"
      ).textContent,
    },
    {
      name: "Tối",
      total: parseInt(
        html.querySelector(
          "#_101_INSTANCE_4IVkx5Jltnbg_5876672 > div.journal-content-article > table.Table > tbody > tr:nth-child(6) > td:nth-child(2) > p"
        ).textContent
      ),
      detail: html.querySelector(
        "#_101_INSTANCE_4IVkx5Jltnbg_5876672 > div.journal-content-article > table.Table > tbody > tr:nth-child(6) > td:nth-child(3) > p"
      ).textContent,
    },
  ];
}

module.exports = {
  getWeather,
  getNews,
  getCovidHanoi,
  getYoutubeTrending,
};
