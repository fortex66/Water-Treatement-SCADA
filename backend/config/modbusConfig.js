const Modbus = require("modbus-serial");
const { Mutex } = require("async-mutex");
const { v4: uuidv4 } = require('uuid');
const mutex = new Mutex();
// const HOST = "118.41.61.238";
const HOST="223.171.58.217"
const MODBUS_PORT = 502;
let client = null;
let isConnected = false;

async function setIsConnected(value) {
  isConnected = value;
}

async function getIsConnected() {
  return isConnected;
}

// Modbus 클라이언트 설정 및 연결
async function connectClient() {
  const operationId = uuidv4();
  console.log("connect Client is enter this object : ",operationId)

  if (client) {
    await client.close();
    client = null;
  }

  client = new Modbus();
  let attempts = 0;
  const maxAttempts = 3; // 재시도 최대 횟수 증가
  const retryDelay = 1000; // 재시도 전 대기 시간 증가 (5초)
    while (attempts < maxAttempts) {
      try {
        console.log("connect Client is running on this object : ",operationId)
        client.setID(1);
        client.setTimeout(10000); // 타임아웃 설정을 10초로 증가
        await client.connectTCP(HOST, { port: MODBUS_PORT });
        if (!client) {
          throw new Error("Modbus client not initialized");
        }
        
        await setIsConnected(true);
        return client;
      } catch (error) {
        console.log(
          `Failed to connect Modbus client on attempt ${attempts + 1}:`,
          error
        );
        console.trace();
        attempts++;
        if (attempts >= maxAttempts) {
          console.log(
            "Max connection attempts reached. Failed to connect Modbus client."
          );
          console.trace();
          client = null;
          await setIsConnected(false);
          return null;
        }
        // await new Promise((resolve) => setTimeout(resolve, retryDelay)); // 재시도 전 대기 시간
      }
    }
}

// PLC 주소를 변환하는 함수
function plcAddressToDecimal(address) {
  let result = 0;
  let base = 1;

  for (let i = address.length - 1; i >= 0; i--) {
    let char = address[i];
    let value;

    if (char >= "0" && char <= "9") {
      value = char.charCodeAt(0) - "0".charCodeAt(0);
    } else if (char >= "A" && char <= "F") {
      value = char.charCodeAt(0) - "A".charCodeAt(0) + 10;
    } else {
      throw new Error(`Invalid character ${char} in address`);
    }

    result += value * base;

    if (base === 16) {
      base = 160; // 10진수 100의 위치를 16진수 160으로 처리
    } else if (base === 160) {
      base = 1600; // 16진수 1000의 위치
    } else {
      base *= 16;
    }
  }

  return result;
}

// 연결 확인 및 재연결 함수
async function getClientOrReconnect() {
  const now = await getIsConnected();
  if (!client || !now) {
    const release = await mutex.acquire();
    try {
      return await connectClient();
    }catch(error){
      console.log(error)
      throw error
    }finally{
      release();
    }
  }

  return client;
}

async function closeClient(){
  const now = await getIsConnected();
  if(now || client){
    await client.close();
    client =null;
  }
}

module.exports = {
  connectClient,
  getClient: getClientOrReconnect,
  plcAddressToDecimal,
  setIsConnected,
  getIsConnected,
  closeClient,
  mutex,
};
