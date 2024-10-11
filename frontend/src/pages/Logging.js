import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import { SocketContext } from "../App";
import moment from "moment-timezone";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body, html {
    overflow: hidden; // 우측 스크롤 제거
    height: 100%; // 전체 높이 설정
    margin: 0; // 기본 여백 제거
  }
`;

const LoggingContainer = styled.div``;

const DriveContainer = styled.div`
  display: flex;
  background-color: #d0d0d0;
  height: 100vh;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; // 우측 스크롤 제거
`;

const TableContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  background-color: transparent;
  height: 90vh;
  width: 96vw;
  border: 1px solid black;
  text-align: center;
  margin-left: 1%;
  margin-top: 2%;

  &::before {
    content: "LOGGING"; // 여기에 원하는 텍스트를 입력
    position: absolute;
    top: -15px; // 컨테이너 상단 바깥으로 위치 조정
    left: 85%; // 가로 중앙 위치
    transform: translateX(-50%); // 정확한 중앙 위치로 조정
    background: #d0d0d0; // 배경 색상 (컨테이너 배경과 동일하게)
    font-size: 25px;
    font-style: italic;
    padding: 0 10px; // 패딩 설정
  }
`;

const TableWrapper = styled.div`
  overflow: auto; // 스크롤 가능하도록 설정
  height: 80%; // TableContainer보다 조금 작게
  width: 75vw; // TableContainer보다 조금 작게
  margin-top: 1.2%;
`;

const Table = styled.table`
  width: 99%; // TableWrapper 너비에 맞춤
  height: 50vh;
  border-collapse: collapse;
  text-align: center;
  margin-top: 1%; // 상단 여백 제거
  align-self: flex-start;
  margin-left: 1%; // 좌측 여백 제거
`;
const StyledTh = styled.th`
  border: 1px solid #000;
  background-color: #ccc;
  height: 1%;
  width: ${(props) => props.width || "auto"}; // 너비를 동적으로 설정
`;

const StyledTd = styled.td`
  height: 20px;
  border: 1px solid #000;
`;

const StyledTr = styled.tr`
  background-color: white;
`;

const FunctionContainer = styled.div`
  flex-direction: column;
  display: flex;
  width: 20vw;
  height: 85vh;
  border: 1px solid black;
  margin-left: 0.5%;
  margin-top: 2%;
`;
const GraphLink = styled(Link)`
  text-decoration: none; // 링크 밑줄 제거
`;

const GraphButton = styled.button`
  background-color: gray;
  width: 90%;
  height: 50px;
  margin-left: 5%;
  margin-bottom: 20px;
  border: 1px solid;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
  color: black;
`;

const NewButton = styled.button`
  background-color: red;
  width: 90%;
  height: 50px;
  margin-left: 5%;
  border-radius: 10px;
  border: 1px solid; // 경계선 제거
  cursor: pointer; // 마우스 오버 시 커서 변경
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px; // 글자 크기
  color: black; // 글자색
`;

const TimerContainer = styled.div`
  flex-direction: column;
  display: flex;
  width: 90%;
  height: 30%;
  margin-top: 5%;
  margin-left: 5%;
  margin-bottom: 15%;
`;

const TimerHeader = styled.div`
  background-color: black;
  color: yellow;
  height: 20%;
  display: flex;
  justify-content: center;
  font-weight: 500;
  align-items: center;
  margin-top: 1vh;
`;

const FrequencyContainer = styled.div`
  flex-direction: row;
  display: flex;
  width: 100%;
  height: 20%;
  background-color: black;
  margin-top: 3%;
`;
const FrequencyInput = styled.input`
  width: 60%;
  height: 90%;

  background-color: black;
  color: yellow;
  text-align: center;
  padding: 0;
  line-height: 90%;
  display: flex;
  align-items: center;
  &::placeholder {
    color: yellow; // placeholder 색상 설정
  }
`;

const DbFrequencyInput = styled.input`
  width: 60%;
  height: 90%;

  background-color: black;
  color: yellow;
  text-align: center;
  padding: 0;
  line-height: 90%;
  display: flex;
  align-items: center;
  &::placeholder {
    color: yellow; // placeholder 색상 설정
  }
`;

const TextBox = styled.div`
  width: 25%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: black;
  color: ${(props) => props.color};
  font-weight: 500;
  font-size: 18px;
  border-left: 1px solid #fff;
  border-right: 1px solid #fff;
`;

function Logging() {
  const [inputValue, setInputValue] = useState([]);
  const [dbFrequency, setDbFrequency] = useState([]);
  const [data, setData] = useState([]);
  const socket = useContext(SocketContext);
  const rowsCount = 50;

  useEffect(() => {
    const handleData = (receivedData) => {
      if (
        receivedData &&
        receivedData.logging_D1_part &&
        receivedData.logResult
      ) {
        if (
          receivedData.logging_D1_part.length > 0 &&
          receivedData.logResult.length > 0
        ) {
          setData(receivedData);
        } else if (receivedData.frequency) {
          setData((prevData) => ({
            ...prevData,
            frequency: receivedData.frequency,
          }));
          // console.error(
          //   "Received data has empty parts, keeping previous state."
          // );
        } else {
          // console.error("Received empty data, keeping previous state.");
        }
      } else if (receivedData && receivedData.frequency) {
        setData((prevData) => ({
          ...prevData,
          frequency: receivedData.frequency,
        }));
        // console.error("Received incomplete data, keeping previous state.");
      } else {
        // console.error("Received incomplete data, keeping previous state.");
      }
    };

    socket.emit("requestPageData", { page: "logging" }); // Setting 페이지 데이터 요청
    socket.on("pageData", handleData);

    return () => {
      socket.off("pageData", handleData);
    };
  }, []);

  const handlePlcChange = (event) => {
    setInputValue(event.target.value); // 업데이트된 배열로 상태 설정
  };

  const handleDbChange = (event) => {
    setDbFrequency(event.target.value); // 업데이트된 배열로 상태 설정
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      socket.emit("writeRegister", {
        register: 8051,
        newValue: inputValue,
        page: "logging",
      }); // 서버로 데이터 전송
    }
  };

  const handleDBFrequency = (event) => {
    if (event.key === "Enter") {
      socket.emit("frequency", { data: event.target.value }, (response) => {
        if (!response.status) {
          alert("로그 저장 주기 초기화 실패!");
        } else {
          setDbFrequency(response.value);
        }
      });
    }
  };

  const newHandle = () => {
    // 현재 데이터의 가장 마지막(최신) 데이터의 id 정보 전송
    const lastIndex = data.logResult[0].id;
    socket.emit("new", { data: lastIndex }, (response) => {
      if (response.status) {
        setData([]);
      } else {
        alert("초기화 실패! 다시 Clear 버튼을 눌러주세요!");
        //console.log(response.message);
      }
    });
  };

  return (
    <LoggingContainer>
      <GlobalStyle />
      <Header></Header>
      <DriveContainer>
        <TableContainer>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <StyledTh width="10%">번호</StyledTh>
                  <StyledTh width="30%">날짜</StyledTh>
                  <StyledTh width="20%">흡착-{">"}처리</StyledTh>
                  <StyledTh width="20%">유입-{">"}흡착</StyledTh>
                  <StyledTh width="20%">방류</StyledTh>
                </tr>
              </thead>
              <tbody>
                {[
                  ...Array(
                    data.logResult && data.logResult.length > rowsCount
                      ? data.logResult.length
                      : 50
                  ),
                ].map((_, index) => {
                  // UTC 시간을 KST로 변환
                  const kstTime =
                    data.logResult && data.logResult[index]
                      ? moment(data.logResult[index].time)
                          .tz("Asia/Seoul")
                          .format("YYYY-MM-DD HH:mm:ss")
                      : "";
                  return (
                    <StyledTr key={index}>
                      <StyledTd>
                        {data.logResult && data.logResult[index]?.id}
                      </StyledTd>
                      <StyledTd>{kstTime}</StyledTd>
                      <StyledTd>
                        {data.logResult &&
                          data.logResult[index]?.value1?.toFixed(3)}
                      </StyledTd>
                      <StyledTd>
                        {data.logResult &&
                          data.logResult[index]?.value2?.toFixed(3)}
                      </StyledTd>
                      <StyledTd>
                        {data.logResult &&
                          data.logResult[index]?.value3?.toFixed(3)}
                      </StyledTd>
                    </StyledTr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrapper>
          <FunctionContainer>
            <TimerContainer>
              <TimerHeader>Timer</TimerHeader>
              <FrequencyContainer>
                <TextBox color="red">PLC</TextBox>
                <FrequencyInput
                  type="number"
                  value={inputValue && inputValue}
                  placeholder={data.logging_D1_part && data.logging_D1_part}
                  onChange={handlePlcChange}
                  onKeyDown={handleKeyDown}
                />
                <TextBox color="white">sec</TextBox>
              </FrequencyContainer>
              <FrequencyContainer>
                <TextBox color="red">DB</TextBox>
                <DbFrequencyInput
                  type="number"
                  value={dbFrequency && dbFrequency}
                  placeholder={data.frequency && data.frequency}
                  onChange={handleDbChange}
                  onKeyDown={handleDBFrequency}
                />
                <TextBox color="white">sec</TextBox>
              </FrequencyContainer>
            </TimerContainer>
            <GraphLink to="/graph">
              <GraphButton>Graph</GraphButton>
            </GraphLink>
            <NewButton onClick={() => newHandle()}>Clear</NewButton>
          </FunctionContainer>
        </TableContainer>
      </DriveContainer>
      <NavigationBar></NavigationBar>
    </LoggingContainer>
  );
}

export default Logging;
