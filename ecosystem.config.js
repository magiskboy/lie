module.exports = {
  apps: [
    {
      name: "weather-cronjob",
      script: "src/cronjob.js",
      cron_restart: "0 */1 * * *",
      exec_mode: "fork",
      autorestart: false,
      instances: 1,
    },
    {
      name: "news-cronjob",
      script: "src/cronjob.js",
      cron_restart: "0 */6 * * *",
      exec_mode: "fork",
      autorestart: false,
      instances: 1,
    },
    {
      name: "covid19-cronjob",
      script: "src/cronjob.js",
      cron_restart: "0 */3 * * *",
      exec_mode: "fork",
      autorestart: false,
      instances: 1,
    },
    {
      name: "bot",
      script: "src/bot.js",
    },
  ],

  deploy: {
    development: {
      SLACK_BOT_TOKEN:
        "xoxb-2315092163795-2300199642359-jNm5OKr1BQDFfsL8q50AGLe0",
      SLACK_APP_TOKEN:
        "xapp-1-A029YHVQM88-2321196942484-dbd4dd9d73a8c5787940df2d04fd3196952acd7f5b8f1dbcc76681bdce5aa54b",
      WEATHER_API_KEY: "105c647aafe24a1483870653212707",
    },
    production: {},
  },
};
