const { modbusOperation } = require("./modbusOperation");
const { plcAddressToDecimal } = require("../config/modbusConfig");
const statusManager = require("../config/statusConfig");
const modbusConfig = require("../config/modbusConfig");

let status;
let running;

// 코일 쓰기 함수
async function write_M_Bit(plcAddress, value) {
  const operation = async (client) => {
    try {
      status = await modbusConfig.getIsConnected();
      if (!status) {
        console.log("write m bit 연산 중지");
        return;
      }
      const address = plcAddressToDecimal(plcAddress);
      running = await statusManager.getIsRunning();

      if (!running) {
        const release = await modbusConfig.mutex.acquire();
        try {
          await statusManager.setIsRunning(true);
          await client.writeCoil(address, value);
          //console.log(address, value);
        } catch (err) {
          release();
          console.error(err);
          console.trace();
          await modbusConfig.setIsConnected(false);
          await statusManager.setIsRunning(false);
          await modbusConfig.getClient();
        } finally {
          release();
          await statusManager.setIsRunning(false);
        }
      }
    } catch (err) {
      console.error(`Write Coil Error at ${plcAddress}`, err);
      await modbusConfig.getClient();
      throw err;
    }
  };
  return await modbusOperation(operation, plcAddress, value);
}

// 코일 읽기 함수
async function read_M_Bit(startAddress, count) {
  const operation = async (client) => {
    try {
      const status = await modbusConfig.getIsConnected();
      if (!status) {
        console.log("read m bit 연산 중지 ");
        return;
      }
      let result;
      const address = plcAddressToDecimal(startAddress);
      let running = await statusManager.getIsRunning();
      // console.log(startAddress, address);

      if (!running) {
        const release = await modbusConfig.mutex.acquire();
        try {
          await statusManager.setIsRunning(true);
          result = await client.readCoils(address, count);
        } catch (err) {
          release();
          console.log(err);
          await modbusConfig.setIsConnected(false);
          await statusManager.setIsRunning(false);
          await modbusConfig.getClient();
        } finally {
          release();
          await statusManager.setIsRunning(false);
        }
      }
      if (result) {
        return result.data;
      } else {
        return [];
      }
    } catch (err) {
      console.error(`Read Coils Error at ${startAddress}`, err);
      console.trace();
      await modbusConfig.getClient();
      throw err;
    }
  };
  return await modbusOperation(operation, startAddress, count);
}

module.exports = { write_M_Bit, read_M_Bit };
