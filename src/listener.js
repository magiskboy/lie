const { SocketModeClient } = require("@slack/socket-mode");

// Read a token from the environment variables
const appToken = process.env.SLACK_APP_TOKEN;

// Initialize
const socketModeClient = new SocketModeClient({ appToken });

socketModeClient.on("message", async ({ event }) => {
  console.log(event);
});

(async () => {
  // Connect to Slack
  await socketModeClient.start();
})();
