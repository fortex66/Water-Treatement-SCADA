import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import { SocketContext } from "../App";
import SideBar from "../components/SideBar";
import moment from "moment-timezone";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale
);

const GraphContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const DriveContainer = styled.div`
  display: flex;
  flex: 1;
  background-color: #fff;
  box-sizing: border-box;
`;

const GraphContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 20px 60px 20px;
  overflow: hidden;
`;

const ChartWrapper = styled.div`
  flex-grow: 1;
`;

const Name = styled.div`
  font-size: 28px;
  font-weight: bold;
  margin: 10px 0px 10px 0px;
  color: #131213;
  text-align: center; // 텍스트 가운데 정렬
`;

function Graph() {
  const [data, setData] = useState([]);
  const socket = useContext(SocketContext);

  useEffect(() => {
    const handleData = (receivedData) => {
      //console.log(receivedData);
      if (receivedData && Array.isArray(receivedData.graph_D_part)) {
        if (receivedData.graph_D_part.length > 0) {
          setData(receivedData.graph_D_part.reverse());
        } else {
          // console.error(
          //   "Received data has empty parts, keeping previous state."
          // );
        }
      } else {
        // console.error("Received invalid data, keeping previous state.");
      }
    };

    socket.emit("requestPageData", { page: "graph" });
    socket.on("pageData", handleData);

    return () => {
      socket.off("pageData", handleData);
    };
  }, [socket]);

  const valueData1 = (data || []).map((record) => ({
    x: moment(record.time).tz("Asia/Seoul").format("HH:mm:ss"),
    y: record.value1,
  }));

  const valueData2 = (data || []).map((record) => ({
    x: moment(record.time).tz("Asia/Seoul").format("HH:mm:ss"),
    y: record.value2,
  }));

  const valueData3 = (data || []).map((record) => ({
    x: moment(record.time).tz("Asia/Seoul").format("HH:mm:ss"),
    y: record.value3,
  }));

  const chartData = {
    labels: valueData1.map((d) => d.x), // x축 라벨을 시간으로 설정
    datasets: [
      {
        label: "흡착->처리",
        data: valueData1.map((d) => d.y),
        fill: false,
        backgroundColor: "#007bff",
        borderColor: "#007bff",
        pointRadius: 4,
        pointHoverRadius: 7,
      },
      {
        label: "유입->흡착",
        data: valueData2.map((d) => d.y),
        fill: false,
        borderColor: "#FF6384",
        backgroundColor: "#FF6384",
        pointRadius: 4,
        pointHoverRadius: 7,
      },
      {
        label: "방류",
        data: valueData3.map((d) => d.y),
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
        type: "category", // x축을 category로 설정
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
        max: 30, // 적절한 y축 범위 설정
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

  return (
    <GraphContainer>
      <Header />
      <DriveContainer>
        <SideBar />
        <GraphContent>
          <Name>LOGGING TREND GRAPH</Name>
          <ChartWrapper>
            <Line data={chartData} options={chartOptions} />
          </ChartWrapper>
        </GraphContent>
      </DriveContainer>
      <NavigationBar />
    </GraphContainer>
  );
}

export default Graph;
