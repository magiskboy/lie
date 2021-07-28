const axios = require("axios");
const csv = require("csv");
const Parser = require("rss-parser");
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

function parseCSV(data) {
  return new Promise((resolve, reject) => {
    csv.parse(
      data,
      { columns: true, skip_empty_lines: true },
      (error, output) => {
        if (error) reject(error);
        else resolve(output);
      }
    );
  });
}

async function getCOVID19(cities) {
  const resp = await axios.get(config.COVID19_STAT_URL);
  const records = await parseCSV(resp.data);
  return records
    .filter((item) => cities.includes(item.KEY))
    .map((item) => ({
      city: item["TỈNH THÀNH"] || 0,
      infected: item["NHIỄM"] || 0,
      died: item["TỬ VONG"] || 0,
      normal: item["KHỎI"] || 0,
      total: item["TỔNG"] || 0,
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

module.exports = {
  getWeather,
  getNews,
  getCOVID19,
  getYoutubeTrending,
};
