// statusManager.js\
const modbusConfig = require("../config/modbusConfig");

let isPaused = false;
let isRunning = false;
async function setIsPaused(value) {
  isPaused = value;
}
async function getIsPaused() {
  return isPaused;
}
async function setIsRunning(value) {
  isRunning = value;
}

async function getIsRunning() {
  return isRunning;
}

const attemptReconnect = async () => {
  try {
    const client = await modbusConfig.getClient();
    if (client) {
      await setIsPaused(false);
    }
  } catch (error) {
    console.error("Reconnection failed:", error);
    setTimeout(attemptReconnect, 1000); // 1초 후 다시 시도
  }
};

module.exports = {
  setIsPaused,
  getIsPaused,
  setIsRunning,
  getIsRunning,
  attemptReconnect,
};
