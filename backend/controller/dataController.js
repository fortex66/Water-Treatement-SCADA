const alarm = require("../model/alarmModel");
const logging = require("../model/loggModel");
const coilController = require("./coilController");
const registerController = require("./registerController");
const { Op } = require("sequelize");
const { Parser } = require("json2csv");
const moment = require("moment-timezone");
const modbusConfig = require("../config/modbusConfig");

const formatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Seoul",
});

const formattedDate = formatter
  .format(new Date())
  .replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+)/, "$3-$1-$2");

let status;

const getAlarmList = async (req, res) => {
  try {
    const AlarmList = await alarm.alarmList.findAll({
      include: [{ model: alarm.alarm }],
      order: [["id", "DESC"]],
    });
    return AlarmList; // 데이터를 반환
  } catch (err) {
    console.log("Failed get alarm data from database", err);
    console.trace();
    throw err; // 에러를 던지면 상위 호출자에서 처리할 수 있습니다.
  }
};

const setAlarmList = async () => {
  try {
    const previousData = await alarm.alarm.findAll();
    const data = await coilController.read_M_Bit("5100", 38);

    for (let index = 0; index < previousData.length; index++) {
      let dbItem = previousData[index].status; // 데이터베이스의 해당 항목

      if (data) {
        if (!dbItem && data[index]) {
          //false -> true : alarmList에 새로운 알람 로그 생성
          await alarm.alarmList.findOrCreate({
            where: {
              alarmId: previousData[index].alarmId,
              fixDate: null,
            },
            defaults: {
              // errorDate: new Date(),
              alarmId: previousData[index].alarmId,
            },
          });
          await alarm.alarm.update(
            {
              status: data[index],
            },
            {
              where: { alarmId: index + 1 },
            }
          );
        } else if (dbItem && !data[index]) {
          //true -> false : alarmList에 있는 알람 로그 찾아서 fixDate를 현재 시간으로 업데이트
          //database의 trigger로 해결
          await alarm.alarm.update(
            {
              status: data[index],
            },
            {
              where: { alarmId: index + 1 },
            }
          );
        }
      }
    }
  } catch (error) {
    console.log(error);
    console.trace();
    // await modbusConfig.setIsConnected(false);
    // await modbusConfig.getClient();
  }
};

const deleteAlarmList = async () => {
  try {
    await alarm.alarmList.destroy({ where: { fixDate: { [Op.not]: null } } });
  } catch (err) {
    console.log("delete error", err);
    console.trace();
  }
};

//로깅 데이터 조회, 단 이전에 New를 눌렀던 시점의 최신 데이터 id를 받아서 그 이후 값만 조회 후 전송
const getLogList = async () => {
  try {
    const index = await logging.logIndex.findOne(
      {
        attributes: ["lastIndex"],
      },
      {
        where: { id: "1" },
      }
    );
    const Log = await logging.log
      .findAll({
        limit: 500,
        where: {
          id: {
            [Op.gt]: index.dataValues.lastIndex,
          },
        },
        order: [
          ["id", "DESC"], // 'id' 컬럼 기준으로 내림차순 정렬
        ],
      })
      .catch((err) => console.log(err));

    return Log;
  } catch (err) {
    console.log("Error on read logging table because of ", err);
    console.trace();
  }
};

//m1100 검사 주기
const check_M100 = async () => {
  try {
    const check = await coilController.read_M_Bit("200A", 1);
    if (check[0]) {
      try {
        status = await modbusConfig.getIsConnected();
        if (!status) {
          console.log("200A 연산 중지");
          return;
        }
        const read_data = await registerController.read_D_Word(11, 3);
        if (read_data.length === 0) {
          return;
        } else {
          const formatValue = (value) => parseFloat((value * 0.001).toFixed(3));
          const data = {
            value1: formatValue(read_data[0]),
            value2: formatValue(read_data[1]),
            value3: formatValue(read_data[2]),
            time: formattedDate,
          };
          await logging.log.create({
            value1: data.value1,
            value2: data.value2,
            value3: data.value3,
          });
          return data;
        }
      } catch (err) {
        console.log("Error on read M1100 coil because of ", err);
        console.trace();
        // await modbusConfig.setIsConnected(false);
        // await modbusConfig.getClient();
      }
    }
  } catch (err) {
    console.log("Error on read M200A", err);
    // await modbusConfig.setIsConnected(false);
    // await modbusConfig.getClient();
  }
  //검사 결과 true면 로깅 데이터 생성
};

const getLogDataForGraph = async () => {
  try {
    const formattedDate = formatter
      .format(new Date())
      .replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+)/, "$3-$1-$2");
    const startDate = new Date(`${formattedDate}T00:00:00`);
    const endDate = new Date(`${formattedDate}T23:59:59`);

    const data = await logging.log.findAll({
      limit: 75,
      where: {
        time: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      order: [
        ["id", "DESC"], // 'id' 컬럼 기준으로 내림차순 정렬
      ],
    });
    return data;
  } catch (err) {
    console.log(err);
    console.trace();
  }
};

const getCSVData = async (startDateTime, endDateTime) => {
  try {
    const data = await logging.log.findAll({
      where: {
        time: {
          [Op.gte]: new Date(startDateTime),
          [Op.lte]: new Date(endDateTime),
        },
      },
      order: [
        ["id", "ASC"], // id 컬럼 기준으로 오름차순 정렬
      ],
    });

    // CSV 변환을 위해 JSON 데이터를 준비합니다.
    const jsonData = data.map((item) => ({
      id: item.id,
      value1: item.value1,
      value2: item.value2,
      value3: item.value3,
      timestamp: moment(item.time)
        .tz("Asia/Seoul")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));

    // json2csv를 사용하여 JSON 데이터를 CSV로 변환합니다.

    return jsonData;
  } catch (err) {
    console.log("Error fetching logs for CSV download:", err);
    console.trace();
    throw err;
  }
};

const getHistoryData = async (startDateTime, endDateTime) => {
  try {
    const data = await logging.log.findAll({
      where: {
        time: {
          [Op.between]: [new Date(startDateTime), new Date(endDateTime)],
        },
      },
      order: [["time", "ASC"]],
    });

    return data;
  } catch (error) {
    console.error("Error fetching history data:", error);
    throw error;
  }
};

module.exports = {
  getAlarmList,
  deleteAlarmList,
  setAlarmList,
  getLogList,
  check_M100,
  getCSVData,
  getLogDataForGraph,
  getHistoryData,
};
