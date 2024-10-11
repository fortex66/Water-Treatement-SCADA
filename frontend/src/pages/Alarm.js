/* eslint-disable */
import React, { useState, useEffect, useContext } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import { SocketContext } from "../App";
import moment from "moment-timezone";

// Global 스타일 추가
const GlobalStyle = createGlobalStyle`
  body, html {
    overflow: hidden; // 우측 스크롤 제거
    height: 100%; // 전체 높이 설정
    margin: 0; // 기본 여백 제거
  }
`;

const AlarmContainer = styled.div``;

const DriveContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #787878;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden; // 우측 스크롤 제거
`;

const CircleContainer = styled.div`
  flex-direction: row;
  width: 50%;
  height: 5vh;
  margin-left: 5%;
  display: flex;
  margin-top: 1%;
`;
const Circle = styled.div`
  background-color: rgb(255 143 0);
  width: 57px;
  height: 50px;
  border-radius: 50%;
`;

const CircleText = styled.div`
  margin-left: 5%;
  width: 100%;
  height: 60%;
  text-align: left;
  line-height: 5vh;
  align-items: center;
  color: black;
  font-size: 32px;
  font-weight: 500;
`;
const TableContainer = styled.div`
  position: relative;
  display: flex;
  background-color: transparent;
  height: 60%;
  width: 96%;
  border: none;
  text-align: center;
  margin-left: 1%;
  margin-top: 10px;
`;
const TableWrapper = styled.div`
  overflow: auto; // 스크롤 가능하도록 설정
  height: 100%; // TableContainer보다 조금 작게
  width: 100%; // TableContainer보다 조금 작게
`;

const Table = styled.table`
  width: 90vw;
  border-collapse: collapse;
  text-align: center;
  align-self: flex-start;
  margin-top: 20px;
  margin-left: 4%;
`;
const StyledTh = styled.th`
  border: 1px solid #000;
  background-color: #ccc;
  width: ${(props) => props.width || "auto"}; // 너비를 동적으로 설정
`;

const StyledTd = styled.td`
  padding: 8px;
  border: 1px solid #000;
  color: ${(props) => props.color || "black"};
`;

const StyledTr = styled.tr`
  background-color: white;
`;
const ButtonContainer = styled.div`
  flex-direction: row;
  display: flex;
  width: 70vw;
  height: 0.5vh;
  margin-left: 15%;
  margin-top: 5vh;
`;
const AlarmResetButton = styled.button`
  color: black;
  width: 12vw;
  height: 7vh;
  border: 3px solid #aaa; // 상태 테두리
  cursor: pointer; // 마우스 오버 시 커서 변경
  margin-right: 25%;
  background-color: ${(props) =>
    props.alarmcolor === "true" ? "red" : "lightgray"};
  font-size: 20px;
  font-weight: 600;
`;

const ResetButton = styled.button`
  color: black;
  width: 12vw;
  height: 7vh;
  background: #5c5df7; // 상태 배경색
  border: 3px solid #aaa; // 상태 테두리
  cursor: pointer; // 마우스 오버 시 커서 변경
  margin-right: 25%;
  font-size: 20px;
  font-weight: 600;
`;
const BuzzerStopButton = styled.button`
  color: black;
  width: 12vw;
  height: 7vh;
  background: yellow; // 상태 배경색
  border: 3px solid #aaa; // 상태 테두리
  cursor: pointer; // 마우스 오버 시 커서 변경
  font-size: 20px;
  font-weight: 600;
`;

function Alarm() {
  const [data, setData] = useState([]);
  const socket = useContext(SocketContext);
  const rowsCount = 30;
  const [alarm, setAlarm] = useState(false);

  useEffect(() => {
    const handleData = (receivedData) => {
      console.log(receivedData);
      if (receivedData && receivedData.alarm_M1_part) {
        if (receivedData.alarm_M1_part.length > 0) {
          setAlarm(receivedData.alarm_M1_part[0]);
        }
        // 빈 배열인 경우 setAlarm 호출하지 않음
      }
      //console.log(receivedData);

      if (receivedData && receivedData.alarmResult) {
        const reverseData = receivedData.alarmResult.slice();
        setData(reverseData);

        // 빈 배열인 경우 setData 호출하지 않음
      }
    };

    socket.emit("requestPageData", { page: "alarm" }); // Setting 페이지 데이터 요청

    socket.on("pageData", handleData);

    return () => {
      socket.off("pageData", handleData);
    };
  }, []);

  const resetHandle = async () => {
    socket.emit("writeCoil", { coil: "8080", newValue: true, page: "alarm" });
  };

  const clearAlarm = () => {
    socket.emit("clearAlarm");
  };

  const buzzerStop = () => {
    socket.emit("writeCoil", { coil: "8081", newValue: true, page: "alarm" });
  };
  return (
    <AlarmContainer>
      <GlobalStyle />
      <Header></Header>
      <DriveContainer>
        {/* <AlramHeader>ALARM LIST</AlramHeader> */}
        <CircleContainer>
          <Circle></Circle>
          <CircleText>ALARM HISTORY</CircleText>
        </CircleContainer>
        <TableContainer>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <StyledTh width="15%">발생</StyledTh>
                  <StyledTh width="45%">메시지</StyledTh>
                  <StyledTh width="15%">복구</StyledTh>
                  <StyledTh width="25%">주소 보기</StyledTh>
                </tr>
              </thead>
              <tbody>
                {[...Array(rowsCount)].map((_, index) => {
                  // UTC 시간을 KST로 변환
                  const errorDateKST =
                    data[index] && data[index].errorDate
                      ? moment(data[index].errorDate)
                          .tz("Asia/Seoul")
                          .format("YYYY-MM-DD HH:mm:ss")
                      : "";
                  const fixDateKST =
                    data[index] && data[index].fixDate
                      ? moment(data[index].fixDate)
                          .tz("Asia/Seoul")
                          .format("YYYY-MM-DD HH:mm:ss")
                      : "";

                  return (
                    <StyledTr key={index}>
                      <StyledTd>{errorDateKST}</StyledTd>
                      <StyledTd color={data[index] ? "red" : "black"}>
                        {data[index]?.alarm.alarmMessage || ""}
                      </StyledTd>
                      <StyledTd>{fixDateKST}</StyledTd>
                      <StyledTd>{data[index]?.alarm.address || ""}</StyledTd>
                    </StyledTr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrapper>
        </TableContainer>
        <ButtonContainer>
          <AlarmResetButton
            alarmcolor={alarm ? "true" : "false"}
            onClick={() => resetHandle()}
          >
            알람 리셋
          </AlarmResetButton>
          <ResetButton onClick={() => clearAlarm()}>Clear</ResetButton>
          <BuzzerStopButton onClick={() => buzzerStop()}>
            부저 정지
          </BuzzerStopButton>
        </ButtonContainer>
      </DriveContainer>
      <NavigationBar></NavigationBar>
    </AlarmContainer>
  );
}

export default Alarm;
