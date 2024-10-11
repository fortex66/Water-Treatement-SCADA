/* eslint-disable */
import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";
import NavigationBar from "../components/NavigationBar";
import moment from "moment-timezone";
import { Line } from "react-chartjs-2";
import { saveAs } from "file-saver";

import html2canvas from "html2canvas";
import "chartjs-adapter-moment";
import { SocketContext } from "../App";
import axios from "axios";

const History = () => {
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [temperatureData, setTemperatureData] = useState([]);
  const [verify, setVerify] = useState(false);

  const socket = useContext(SocketContext);

  useEffect(() => {
    const handleData = (receivedData) => {
      setTemperatureData(receivedData.historyData);
    };

    socket.on("historyData", handleData);

    return () => {
      socket.off("historyData", handleData);
    };
  }, [socket]);

  const handleSearch = async () => {
    const start = moment(startDateTime);
    const end = moment(endDateTime);

    // if (end.diff(start, "days") > 7) {
    //   alert("조회 기간은 최대 7일 입니다.");
    //   return;
    // }

    socket.emit("requestHistoryData", {
      startDateTime,
      endDateTime,
    });
    setVerify(true);
  };

  const handleDownloadCSV = async () => {
    if (!verify) {
      alert("먼저 데이터를 조회해주세요.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8001/downloadCSV", {
        params: {
          startDateTime,
          endDateTime,
        },
      });

      if (response.status === 200) {
        const jsonData = response.data;

        // JSON 데이터를 CSV로 변환하는 함수
        const convertToCSV = (objArray) => {
          const array =
            typeof objArray !== "object" ? JSON.parse(objArray) : objArray;
          let str = "";
          const keys = Object.keys(array[0]);

          str += keys.join(",") + "\r\n";

          for (let i = 0; i < array.length; i++) {
            let line = "";
            for (let j = 0; j < keys.length; j++) {
              if (line !== "") line += ",";
              line += array[i][keys[j]];
            }
            str += line + "\r\n";
          }

          return str;
        };

        const csv = convertToCSV(jsonData);

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "data.csv");
      } else {
        console.error("Error: Server responded with status", response.status);
        alert("서버에서 데이터를 받아오는 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("CSV 파일 다운로드 중 오류가 발생했습니다.");
    }
  };

  const valueData1 = (temperatureData || []).map((record) => ({
    x: moment(record.time).tz("Asia/Seoul").valueOf(),
    y: record.value1,
  }));

  const valueData2 = (temperatureData || []).map((record) => ({
    x: moment(record.time).tz("Asia/Seoul").valueOf(),
    y: record.value2,
  }));

  const valueData3 = (temperatureData || []).map((record) => ({
    x: moment(record.time).tz("Asia/Seoul").valueOf(),
    y: record.value3,
  }));

  const lineChartData = {
    datasets: [
      {
        label: "흡착->처리",
        data: valueData1,
        fill: false,
        backgroundColor: "#007bff",
        borderColor: "#007bff",
        pointRadius: 4,
        pointHoverRadius: 7,
      },
      {
        label: "유입->흡착",
        data: valueData2,
        fill: false,
        borderColor: "#FF6384",
        backgroundColor: "#FF6384",
        pointRadius: 4,
        pointHoverRadius: 7,
      },
      {
        label: "방류",
        data: valueData3,
        fill: false,
        borderColor: "#FFCE56",
        backgroundColor: "#FFCE56",
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          tooltipFormat: "ll HH:mm:ss",
          displayFormats: {
            minute: "HH:mm:ss",
          },
        },
        title: {
          display: true,
          text: "시간",
          color: "#202124",
        },
        ticks: {
          color: "#202124",
        },
        grid: {
          color: "rgba(19, 18, 19, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "#202124",
        },
        grid: {
          color: "rgba(19, 18, 19, 0.1)",
        },
        min: 0,
        max: 30000,
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#131213",
        },
      },
    },
  };

  const handleTimeChange = (value, type) => {
    if (value) {
      let timeString = value + ":00";
      let currentDateTime = type === "start" ? startDateTime : endDateTime;
      currentDateTime = currentDateTime ? moment(currentDateTime) : moment();

      let [hours, minutes] = timeString.split(":");
      currentDateTime
        .tz("Asia/Seoul")
        .set({ hour: parseInt(hours), minute: parseInt(minutes) });

      let isoString = currentDateTime.format();
      type === "start"
        ? setStartDateTime(isoString)
        : setEndDateTime(isoString);
    }
  };

  const handleDateChange = (value, type) => {
    if (value) {
      let date = moment(value);
      let currentDateTime = type === "start" ? startDateTime : endDateTime;
      currentDateTime = currentDateTime ? moment(currentDateTime) : moment();

      date
        .tz("Asia/Seoul")
        .set({ year: date.year(), month: date.month(), date: date.date() });

      let isoString = date.format();
      type === "start"
        ? setStartDateTime(isoString)
        : setEndDateTime(isoString);
    }
  };

  const handleCaptureGraph = () => {
    if (!verify) {
      alert("먼저 데이터를 조회해주세요.");
      return;
    }
    const graphElement = document.getElementById("graph-container");
    html2canvas(graphElement).then((canvas) => {
      canvas.toBlob(function (blob) {
        saveAs(blob, "graph-capture.png");
      });
    });
  };

  return (
    <HistoryContainer>
      <Header />
      <MainContainer>
        <Sidebar />
        <Contents>
          <Title>DATABASE</Title>
          <Top>
            <SearchArea>
              <DateInput
                type="date"
                value={startDateTime ? startDateTime.split("T")[0] : ""}
                onChange={(e) => handleDateChange(e.target.value, "start")}
              />
              <TimeInput
                type="time"
                value={
                  startDateTime
                    ? startDateTime.split("T")[1].substring(0, 5)
                    : ""
                }
                onChange={(e) => handleTimeChange(e.target.value, "start")}
              />
              <DateInput
                type="date"
                value={endDateTime ? endDateTime.split("T")[0] : ""}
                onChange={(e) => handleDateChange(e.target.value, "end")}
              />
              <TimeInput
                type="time"
                value={
                  endDateTime ? endDateTime.split("T")[1].substring(0, 5) : ""
                }
                onChange={(e) => handleTimeChange(e.target.value, "end")}
              />
              <SearchButton onClick={handleSearch}>조회</SearchButton>
            </SearchArea>
            <Save>
              <SaveDataButton onClick={handleDownloadCSV}>
                CSV 다운로드
              </SaveDataButton>
              <CaptureGraphButton onClick={handleCaptureGraph}>
                그래프 캡쳐
              </CaptureGraphButton>
            </Save>
          </Top>
          <ChartArea
            id="graph-container"
            style={{ backgroundColor: "#FEFEFE" }}
          >
            <Line data={lineChartData} options={chartOptions} />
          </ChartArea>
        </Contents>
      </MainContainer>
      <NavigationBar />
    </HistoryContainer>
  );
};

export default History;

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  background-color: #fff;
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  margin: 5px 0px 5px 0px;
  color: #131213;
  text-align: center;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0px 30px 0px 20px;
`;

const Contents = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0px 20px 45px 20px;
  overflow: hidden;
`;

const SearchArea = styled.div`
  display: flex;
  align-items: center;
`;

const DateInput = styled.input`
  margin-right: 10px;
  border-radius: 5px;
  height: 12px;
  padding: 5px;
  border: 1px solid #ccc;
`;

const TimeInput = styled.input`
  margin-right: 15px;
  border-radius: 5px;
  height: 12px;
  padding: 5px;
  border: 1px solid #ccc;
`;

const SearchButton = styled.button`
  padding: 5px;
  margin-left: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const Save = styled.div``;

const SaveDataButton = styled.button`
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
`;

const CaptureGraphButton = styled.button`
  padding: 10px;
  margin-left: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const ChartArea = styled.div`
  min-height: 700px;
  background-color: #fefefe;
`;
