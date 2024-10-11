const modbusConfig = require("../config/modbusConfig");
const io = require("../socket");
const RETRY_LIMIT = 1; // 재시도 횟수 증가
const RETRY_DELAY = 1000; // 재시도 전 대기 시간 증가 (3초)

async function modbusOperation(operationFunc, ...args) {
    for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
      try {
        const client = await modbusConfig.getClient();
        const result = await operationFunc(client, ...args);      
        return result;
      } catch (error) {
        console.log(`Modbus operation failed:Error: ${error.message}`);
        console.trace();
        console.log(attempt,"번째 시도 in ",operationID)
        if (attempt === RETRY_LIMIT) {
          console.log("최대횟수 도달")
          io.getIo().emit("modbusError",true);
          throw new Error("Max retry attempts reached.");
        }
        await new Promise((resolve) => setTimeout(resolve , RETRY_DELAY)); // 재시도 전 대기 시간        
      }
    }
 
}

module.exports = { modbusOperation }
