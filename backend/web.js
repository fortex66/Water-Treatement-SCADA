process.env.TZ = "Asia/Seoul";
const express = require("express");
const http = require("http");
const cors = require("cors");
const socketConfig = require("./socket.js");
const registerController = require("./controller/registerController");
const coilController = require("./controller/coilController.js");
const connect = require("./config/databaseConfig.js");
const dataController = require("./controller/dataController.js");
const log = require("./model/loggModel.js");
const axios = require("axios");
const { User } = require("./model/userModel.js");
require("./config/init.js");
const modbusConfig = require("./config/modbusConfig.js");

const app = express();
app.use(
  cors({
    origin: [ "http://localhost:3000"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(express.static(path.join(__dirname, "/build")));

// app.get("/", function (req, res) {
//   res.sendFile(path.join(__dirname, "/build/index.html"));
// });

// app.get("*", function (req, res) {
//   res.sendFile(path.join(__dirname, "/build/index.html"));
// });

const server = http.createServer(app);
const io = socketConfig.connect(server);

const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//api
app.post("/api/login", async (req, res) => {
  const { password } = req.body;
  console.log(password);
  try {
    const user = await User.findOne({ where: { password: password } });
    if (user) {
      const match = password === user.password;
      if (match) {
        res.status(200).send({ message: "Login successful" });
      } else {
        res.status(401).send({ message: "Invalid password" });
      }
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/api/change-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ where: { username: "admin" } });
    if (user) {
      const match = currentPassword === user.password;
      if (match) {
        user.password = newPassword;
        await user.save();
        res.status(200).send({ message: "Password changed successfully" });
      } else {
        res.status(401).send({ message: "Current password is incorrect" });
      }
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send({ message: "Internal server error" });
  }
});

// CSV 다운로드 라우트 추가
app.get("/downloadCSV", async (req, res) => {
  const { startDateTime, endDateTime } = req.query;

  try {
    const csvData = await dataController.getCSVData(startDateTime, endDateTime);

    res.header("Content-Type", "text/csv");
    res.attachment("logs.csv");
    return res.send(csvData);
  } catch (error) {
    console.error("Error fetching logs for CSV download:", error);
    res.status(500).send("Internal Server Error");
  }
});

// alarm reset button
app.post("/api/alarmreset", async (req, res) => {
  const { coil } = req.body;
  try {
    await coilController.write_M_Bit(coil, true);
    const data = await getPageData("alarm");
    const socket = await getSocket();
    socket.emit("pageData", data);
    res.status(200);
  } catch (error) {
    console.error("Error fetching logs for alarm reset :", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/reconnect",async(res)=>{
  let isConnected= await modbusConfig.getIsConnected();
  try{
    if(!isConnected){
      await stopTimer();
      await modbusConfig.getClient();
      const result =await modbusConfig.getIsConnected();

      if(result){
        await startTimer();
        res.status(200).send("PLC Reconnection is successful!!");
      }else if(!result){
        res.status(202).send("PLC Reconnection is rejected...");
      }
    }else if(isConnected){
      res.status(403).send("PLC Reconnnection is failed... connection is already....");
    }
  }catch{
    res.status(500).send("Server error... please wait...")
  }
})

app.post("/api/off",async(req,res)=>{
  const isConnected=await modbusConfig.getIsConnected();
  if(!isConnected){
    res.status(202)
  }else if(isConnected){
    await modbusConfig.closeClient();
    await stopTimer();
  }
})

//사용되는 변수들
const pageIntervals = {};
const modalIntervals = {};
let isChallenge=false;
let alarmTimer;
let loggingTimer;
let driveTimer;
let aliveTimer;
let statusTimer;
let plcErrorCount = 0;
let Socket;
let currentPage = null;
let loggingInterval = 1100;

const setCurrentPage = async (page) => {
  currentPage = page;
};
const setSokcet = async (socket) => {
  Socket = socket;
};
const getSocket = async () => {
  return Socket;
};
//plc error count get/set
async function setPlcErrorCount(value) {
  plcErrorCount += value;
}
async function getPlcErrorCount() {
  return plcErrorCount;
}

async function setIsChallenge(value){
  isChallenge=value;
}
async function getIsChallenge(){
  return isChallenge;
}
// DB연결
async function checkConnection() {
  try {
    await connect.authenticate();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    console.trace();
  }
}

  async function statusCheck(){
    console.log("check 들어옴")
    process.nextTick(async () =>{
      await modbusConfig.getClient();  
      const result = await modbusConfig.getIsConnected();
    if(result){
      await startTimer();
    }  
    await setIsChallenge(false);
    })
  }

// Modbus 서버와의 "Alive" 신호를 관리하는 함수
async function manageAliveSignal() {
  try{
    const vnc = await coilController.read_M_Bit("8206", 1);
    if (vnc[0] === true) {
      try {
        const data = await coilController.read_M_Bit("8095", 1);
  
        if (data[0] === true) {
          await coilController.write_M_Bit("8097", false);
          const recovery = await getPlcErrorCount();
          await setPlcErrorCount(-recovery);
        } else {
          await setPlcErrorCount(1);
          const count = await getPlcErrorCount();
          if (count === 5) {
            io.emit("plcDie", true); 
            await setPlcErrorCount(-5);
          }
        }
      } catch (error) {
        console.error("Error managing Alive signal:", error);
        console.trace();
        await modbusConfig.setIsConnected(false);
        // await modbusConfig.getClient();
      }
    }
  }catch(err){
    console.log(err);
    io.emit("plcDie",true)
  }
}
async function driveModeStatus() {
  try {
    const result = await coilController.read_M_Bit("814A", 2);
    io.emit("driveMode", result);
  } catch (err) {
    console.log(err);
    console.trace();
  }
}

// interval 전체 관리 메서드
async function startTimer(){
  startAlarmTimer();
  startAliveTimer();
  startLoggingTimer();
  startdriveModeTimer();
}

async function stopTimer(){
  clearInterval(driveTimer);
  clearInterval(alarmTimer);
  clearInterval(aliveTimer);
  clearInterval(loggingTimer);

  // 모든 pageIntervals 클리어 및 삭제
  for (const socketId in pageIntervals) {
    clearInterval(pageIntervals[socketId]);
    delete pageIntervals[socketId];
  }

  // 모든 modalIntervals 클리어 및 삭제
  for (const socketId in modalIntervals) {
    for (const modalId in modalIntervals[socketId]) {
      clearInterval(modalIntervals[socketId][modalId]);
      delete modalIntervals[socketId][modalId];
    }
    delete modalIntervals[socketId];
  }
}



async function startdriveModeTimer() {
  if (driveTimer) {
    clearInterval(driveTimer);
  }
  driveTimer = setInterval(async () => {
    const isConnected = await modbusConfig.getIsConnected();
    if (isConnected) {
      await driveModeStatus();
    } else {
      console.log("Modbus 연결 끊김, driveModeStatus 호출 생략");
    }
  }, 2900);
}
async function statusCheckTimer(){
  if(statusTimer){
    clearInterval(statusTimer)
  }

  statusTimer=setInterval(async ()=>{
    const isConnected = await modbusConfig.getIsConnected();
    const challenge=await getIsChallenge();
    if(!isConnected&&!challenge){
      
      process.nextTick(async () =>{
        await setIsChallenge(true);
        await stopTimer();  
        await statusCheck();
      })
    }else{
      console.log("Modbus 연결, statusCheck 호출 생략")
    }
  },13000)
}

// 알람 체크 후 생성 및 업데이트 반복
async function startAlarmTimer() {
  if (alarmTimer) {
    clearInterval(alarmTimer);
  }
  alarmTimer = setInterval(async () => {
    const isConnected = await modbusConfig.getIsConnected();
    if(isConnected){
      await dataController.setAlarmList();
    }else{
      console.log("Modbus 연결 끊김, alarm 호출 생략")
    }
  }, 1700);
}

async function startAliveTimer(){
  if(aliveTimer){
    clearInterval(aliveTimer)
  }
  aliveTimer = setInterval(async () => {
    const isConnected = await modbusConfig.getIsConnected();
    if(isConnected){
      await manageAliveSignal();
    }else{
      console.log("Modbus connection is over... alive signal method is skipped")
    }
    
  }, 2300); // 2.3초마다 Alive 신호 관리
}
// 로그여부 체크 후 로그 생성 반복
async function startLoggingTimer() {
  if (loggingTimer) {
    clearInterval(loggingTimer);
  }
  loggingTimer = setInterval(async () => {
    const isConnected=await modbusConfig.getIsConnected();
    if(isConnected){
      await dataController.check_M100();
    }else{
      console.log("Modbus connection is over... Logging data check method is skipped")
    }
    
  }, loggingInterval);
}
//페이지 데이터 연산
async function getPageData(page) {
  try {
    switch (page) {
      case "drive":
        return {
          dirve_D_part: await registerController.read_D_Word(8200, 6),
          drive_M_part: await coilController.read_M_Bit("8100", 79),
        };
      case "setting":
        return {
          setting_D1_part: await registerController.read_D_Word(8000, 16),
          setting_D2_part: await registerController.read_D_Word(8100, 5),
          setting_D3_part: await registerController.read_D_Word(1014, 4),
          setting_M_part: await coilController.read_M_Bit("8200", 7),
        };
      case "input":
        return {
          input_M_part: await coilController.read_M_Bit("8300", 48),
        };
      case "output":
        return {
          output_M_part: await coilController.read_M_Bit("8350", 48),
        };
      case "m100":
        return {
          m100_D_part: await registerController.read_D_Word(2100, 1),
          m100_M_part: await coilController.read_M_Bit("2200", 1),
        };
      case "m200":
        return {
          m200_D_part: await registerController.read_D_Word(8240, 21),
          m200_M_part: await coilController.read_M_Bit("2400", 12),
        };
      case "m300":
        return {
          m300_D_part: await registerController.read_D_Word(8270, 16),
          m300_M_part: await coilController.read_M_Bit("2600", 7),
        };
      case "alarm":
        return {
          alarm_M1_part: await coilController.read_M_Bit("814A", 1),
          alarmResult: await dataController.getAlarmList(),
        };
      case "logging":
        return {
          logging_D1_part: await registerController.read_D_Word(8051, 1),
          logResult: await dataController.getLogList(),
          frequency: loggingInterval / 1000,
        };
      case "graph":
        return {
          graph_D_part: await dataController.getLogDataForGraph(),
        };

      default:
        throw new Error("Unknown page");
    }
  } catch (error) {
    console.error(`Error in getPageData for page ${page}:`, error);
    // await modbusConfig.setIsConnected(false);
    // await modbusConfig.getClient();
    console.trace();
    throw error;
  }
}

// 모달창 데이터 추가 -언상-
async function getModalData(modalId) {
  try {
    switch (modalId) {
      case "modal2":
        return await coilController.read_M_Bit("8150", 12);
      case "modal3":
        return await coilController.read_M_Bit("8160", 7);
      case "modal4":
        return await coilController.read_M_Bit("8170", 2);
      case "pumpmodal":
        return await coilController.read_M_Bit("8210", 9);
      default:
        throw new Error("Unknown modal");
    }
  } catch (error) {
    console.error(`Error in getModalData for modal ${modalId}:`, error);
    console.trace();
    throw error;
  }
}

io.on("connection", (socket) => {
  startdriveModeTimer();
  setSokcet(socket);
  socket.on("requestPageData", async (page) => {
    try {
      // 페이지가 변경되었을 때 기존 페이지의 모달을 정리
      if (currentPage && currentPage !== page.page) {
        if (modalIntervals[socket.id]) {
          Object.keys(modalIntervals[socket.id]).forEach((modalId) => {
            clearInterval(modalIntervals[socket.id][modalId]);
            delete modalIntervals[socket.id][modalId];
          });
        }
      }
      await setCurrentPage(page.page);
      const data = await getPageData(page.page);
      socket.emit("pageData", data);

      if (pageIntervals[socket.id]) {
        clearInterval(pageIntervals[socket.id]);
      }

      let interval = 3700;

      pageIntervals[socket.id] = setInterval(async () => {
        try {
          const isConnected = await modbusConfig.getIsConnected();
          if(isConnected){
            const data = await getPageData(page.page);
            socket.emit("pageData", data);
          }else{
            console.log("Modbus 연결 끊김... Page Data function is skipped")
          }
          
        } catch (error) {
          console.error(
            `Error fetching data for page ${page.page} in interval:`,
            error
          );
          console.trace();
        }
      }, interval);
    } catch (error) {
      console.error(`Error fetching data for page ${page.page}:`, error);
      console.trace();
      socket.emit("pageDataError", { page, error: error.message });
    }
  });

  socket.on("openModal", async (modalId) => {
    try {
      if (currentPage !== "drive" && currentPage !== "setting") {
        return; // 현재 페이지가 drive 또는 setting이 아니면 모달 데이터 요청을 무시
      }
      const mdata = await getModalData(modalId);
      socket.emit("modalData", { modalId, mdata });

      if (modalIntervals[socket.id] && modalIntervals[socket.id][modalId]) {
        clearInterval(modalIntervals[socket.id][modalId]);
      }

      if (!modalIntervals[socket.id]) {
        modalIntervals[socket.id] = {};
      }

      modalIntervals[socket.id][modalId] = setInterval(async () => {
        try {
          const isConnected = await modbusConfig.getIsConnected();
          if(isConnected){
            const mdata = await getModalData(modalId);
            socket.emit("modalData", { modalId, mdata });
          }else{
            console.log("Modbus connection is over... page data method is skipped");
          }
        } catch (error) {
          console.error(
            `Error fetching data for modal ${modalId} in interval:`,
            error
          );
          console.trace();
        }
      }, 3100);
    } catch (error) {
      console.error(`Error fetching data for modal ${modalId}:`, error);
      console.trace();
      socket.emit("modalDataError", { modalId, error: error.message });
    }
  });

  socket.on("closeModal", (modalId) => {
    if (modalIntervals[socket.id] && modalIntervals[socket.id][modalId]) {
      clearInterval(modalIntervals[socket.id][modalId]);
      delete modalIntervals[socket.id][modalId];
    }
  });

  // 모달창 쓰기
  socket.on("modalWriteCoil", async ({ coil, newValue, modalId }) => {
    try {
      await coilController.write_M_Bit(coil, newValue);
      const mdata = await getModalData(modalId);
      socket.emit("modalData", { modalId, mdata });
    } catch (error) {
      console.error(`Error modalWriting to coil ${coil}:`, error);
      console.trace();
      socket.emit("modalWriteError", { coil, error: error.message });
    }
  });

  socket.on("disconnect", () => {
    if (pageIntervals[socket.id]) {
      clearInterval(pageIntervals[socket.id]);
      delete pageIntervals[socket.id];
    }
    if (modalIntervals[socket.id]) {
      Object.keys(modalIntervals[socket.id]).forEach((modalId) => {
        clearInterval(modalIntervals[socket.id][modalId]);
      });
      delete modalIntervals[socket.id];
    }
  });

  socket.on("writeRegister", async ({ register, newValue, page }) => {
    try {
      await registerController.write_D_Word(register, newValue);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = await getPageData(page);
      socket.emit("pageData", data);
    } catch (error) {
      console.error(`Error writing to register ${register}:`, error);
      console.trace();
      socket.emit("writeError", { register, error: error.message });
    }
  });

  socket.on("writeCoil", async ({ coil, newValue, page }) => {
    try {
      await coilController.write_M_Bit(coil, newValue);
      const data = await getPageData(page);
      socket.emit("pageData", data);
    } catch (error) {
      console.error(`Error writing to coil ${coil}:`, error);
      console.trace();
      socket.emit("writeError", { coil, error: error.message });
    }
  });

  //Alarm 페이지
  socket.on("clearAlarm", async () => {
    try {
      await dataController.deleteAlarmList();
      const data = await getPageData("alarm");
      socket.emit("pageData", data);
    } catch (error) {
      console.log("Error on deleting alarm list ", error);
      console.trace();
    }
  });

  /*
    로깅 페이지
  */
  // new 버튼 처리
  socket.on("new", async (data, callback) => {
    try {
      await log.logIndex.update(
        {
          lastIndex: data.data,
        },
        {
          where: { id: "1" },
        }
      );
      callback({
        status: true,
        message: "Updating last log index is successful",
      });
    } catch (err) {
      console.log(err);
      console.trace();
      callback({ status: false, message: "Error on update last index" });
    }
  });

  socket.on("frequency", async (data, callback) => {
    try {
      loggingInterval = Number(data.data) * 1000; // 새로운 간격 설정
      await startLoggingTimer(); // 타이머 재시작
      callback({
        status: true,
        value: loggingInterval / 1000,
      });
    } catch (err) {
      console.log(err);
      console.trace();
      callback({ status: false });
    }
  });

  /*
    History 페이지
  */
  socket.on("requestHistoryData", async ({ startDateTime, endDateTime }) => {
    try {
      const logs = await dataController.getHistoryData(
        startDateTime,
        endDateTime
      );
      // logs 배열에서 5초 주기로 샘플링하여 데이터 전송
      const downsampledData = logs.filter(
        (log, index) => (index + 1) % 5 === 0
      );
      socket.emit("historyData", { historyData: downsampledData });
    } catch (error) {
      console.error("Error fetching history data:", error);
      socket.emit("historyDataError", "Error fetching history data");
    }
  });

 
});

checkConnection();
startLoggingTimer(); // 서버 시작 시 로깅 타이머 시작
startAlarmTimer();
startAliveTimer();
statusCheckTimer();
modbusConfig.getClient();
