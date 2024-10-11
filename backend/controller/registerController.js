const { modbusOperation } = require("./modbusOperation");
const statusManager = require("../config/statusConfig");
const modbusConfig = require("../config/modbusConfig");
let status;
let running;

async function write_D_Word(register, value) {
  const operation = async (client) => {
    try {
      status = await modbusConfig.getIsConnected();
      if (!status) {
        // console.log("write d word 연산 중지");
        return;
      }
      running = await statusManager.getIsRunning();
      if (!running) {
        const release = await modbusConfig.mutex.acquire();
        try {
          await statusManager.setIsRunning(true);
          await client.writeRegister(register, value);
        } catch (err) {
          release();
          console.log(err);
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
      console.error(`Write Register Error at ${register}`, err);
      await modbusConfig.getClient();
      throw err;
    }
  };
  return await modbusOperation(operation, register, value);
}

async function read_D_Word(register, count) {
  const operation = async (client) => {
    try {
      let data;
      status = await modbusConfig.getIsConnected();
      if (!status) {
        console.log("read d word 연산중지");
        return;
      }
      running = await statusManager.getIsRunning();
      if (!running) {
        const release = await modbusConfig.mutex.acquire();
        try {
          await statusManager.setIsRunning(true);
          data = await client.readHoldingRegisters(register, count);
          console.log(data);
        } catch (err) {
          release();
          console.log(err);
          console.trace();
          await modbusConfig.setIsConnected(false);
          await statusManager.setIsRunning(false);
          await modbusConfig.getClient();
        } finally {
          release();
          await statusManager.setIsRunning(false);
        }
      }
      if (data) {
        return data.data;
      } else {
        return [];
      }
    } catch (err) {
      console.error(`Read Holding Registers Error at ${register}`, err);
      await modbusConfig.getClient();
      throw err;
    }
  };
  return await modbusOperation(operation, register, count);
}
module.exports = {
  read_D_Word,
  write_D_Word,
};
