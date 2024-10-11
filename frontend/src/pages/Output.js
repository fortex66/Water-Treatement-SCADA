/* eslint-disable */
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import { SocketContext } from "../App";

function Output() {
  const defaultdata = [
    {
      value: "M204] M-01 멤브레인 탈리브로워[상시]",
      status: false,
      text: "P020",
    },
    {
      value: "M204] M-02 멤브레인 탈리브로워[예비]",
      status: false,
      text: "P021",
    },
    {
      value: "M203] M-03 흡착제 유동브로워[상시]",
      status: false,
      text: "P022",
    },
    {
      value: "M203] M-04 흡착제 유동브로워[예비]",
      status: false,
      text: "P023",
    },
    { value: "M101-A] M-05 유입펌프[A]", status: false, text: "P024" },
    { value: "M101-B] M-06 유입펌프[B]", status: false, text: "P025" },
    { value: "M207-A] M-07 흡입펌프[A]", status: false, text: "P026" },
    { value: "M207-B] M-08 흡입펌프[B]", status: false, text: "P027" },
    { value: "M210-A] M-09 방류펌프[A]", status: false, text: "P028" },
    { value: "M210-B] M-10 방류펌프[B]", status: false, text: "P029" },
    {
      value: "M301-A] M-11 U/V재생조[A] 이송펌프",
      status: false,
      text: "P02A",
    },
    {
      value: "M301-B] M-12 U/V재생조[B] 이송펌프",
      status: false,
      text: "P02B",
    },
    { value: "M304] M-13 흡착조 반송펌프[상시]", status: false, text: "P02C" },
    { value: "M304] M-14 흡착조 반송펌프[예비]", status: false, text: "P02D" },
    { value: "M302] M-15 U/V 교반기", status: false, text: "P02E" },
    { value: "M208] ALARM BUZZER", status: false, text: "P02F" },
    { value: "M212] 유출V/V #1 FWD", status: false, text: "P030" },
    { value: "M212] 유출V/V #1 RWD", status: false, text: "P031" },
    { value: "M212] 유출V/V #2 FWD", status: false, text: "P032" },
    { value: "M212] 유출V/V #2 RWD", status: false, text: "P033" },
    { value: "M212] 유출V/V #3 FWD", status: false, text: "P034" },
    { value: "M212] 유출V/V #3 RWD", status: false, text: "P035" },
    { value: "M213] 수역세V/V #1 FWD", status: false, text: "P036" },
    { value: "M213] 수역세V/V #1 RWD", status: false, text: "P037" },
    { value: "M213] 수역세V/V #2 FWD", status: false, text: "P038" },
    { value: "M213] 수역세V/V #2 RWD", status: false, text: "P039" },
    { value: "M213] 수역세V/V #3 FWD", status: false, text: "P03A" },
    { value: "M213] 수역세V/V #3 RWD", status: false, text: "P03B" },
    { value: "", status: false, text: "P03C" },
    { value: "", status: false, text: "P03D" },
    { value: "M208] M-16 역세펌프 FWD", status: false, text: "P03E" },
    { value: "M208] M-16 역세펌프 RWD", status: false, text: "P03F" },
    { value: "M302] UV LAMP #1 ON", status: false, text: "P080" },
    { value: "M302] UV LAMP #2 ON", status: false, text: "P081" },
    { value: "M302] UV LAMP #3 ON", status: false, text: "P082" },
    { value: "M302] UV LAMP #4 ON", status: false, text: "P083" },
    { value: "M302] UV LAMP #5 ON", status: false, text: "P084" },
    { value: "M302] UV LAMP #6 ON", status: false, text: "P085" },
    { value: "M302] UV LAMP #7 ON", status: false, text: "P086" },
    { value: "", status: false, text: "P087" },
    { value: "추가 V/V #1 FWD", status: false, text: "P088" },
    { value: "추가 V/V #1 RWD", status: false, text: "P089" },
    { value: "추가 V/V #2 FWD", status: false, text: "P08A" },
    { value: "추가 V/V #2 RWD", status: false, text: "P08B" },
    { value: "", status: false, text: "P08C" },
    { value: "", status: false, text: "P08D" },
    { value: "", status: false, text: "P08E" },
    { value: "", status: false, text: "P08F" },
  ];

  // 데이터 재구성: 16개씩 세로로 정렬
  const numRows = 16;
  const numCols = Math.ceil(defaultdata.length / numRows);
  const reshapedData = Array.from({ length: numRows }, (_, rowIndex) =>
    Array.from(
      { length: numCols },
      (_, colIndex) => defaultdata[rowIndex + colIndex * numRows] || null
    )
  );

  const columnHeaders = [
    "[ P 020 ~ P 02F ]",
    "[ P 030 ~ P 03F ]",
    "[ P 080 ~ P 08F ]",
  ];
  const [data, setData] = useState(reshapedData);
  const socket = useContext(SocketContext);

  useEffect(() => {
    const handleData = (receivedData) => {
      if (receivedData && receivedData.output_M_part) {
        if (receivedData.output_M_part.length > 0) {
          const updatedData = defaultdata.map((item, index) => {
            const status = receivedData.output_M_part[index];
            return { ...item, status };
          });

          const reshapedUpdatedData = Array.from(
            { length: numRows },
            (_, rowIndex) =>
              Array.from(
                { length: numCols },
                (_, colIndex) =>
                  updatedData[rowIndex + colIndex * numRows] || null
              )
          );

          setData(reshapedUpdatedData);
          //console.log(data);
        } else {
          // console.error(
          //   "Received data has empty parts, keeping previous state."
          // );
        }
      } else {
        // console.error("Received incomplete data, keeping previous state.");
      }
    };

    socket.emit("requestPageData", { page: "output" }); // Setting 페이지 데이터 요청

    socket.on("pageData", handleData);

    return () => {
      socket.off("pageData", handleData);
    };
  }, []);

  return (
    <PageContainer>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <MainContent>
        <Link to="/input">
          <NavigationButton>INPUT</NavigationButton>
        </Link>
        <DataContainer>
          {data[0].map((_, colIndex) => (
            <Column key={colIndex}>
              <ColumnHeader>{columnHeaders[colIndex]}</ColumnHeader>
              <DataCont>
                {data.map(
                  (row, rowIndex) =>
                    row[colIndex] && (
                      <DataItem key={rowIndex}>
                        <StatusIndicator status={row[colIndex].status}>
                          {row[colIndex].text}
                        </StatusIndicator>
                        <ValueContainer>{row[colIndex].value}</ValueContainer>
                      </DataItem>
                    )
                )}
              </DataCont>
            </Column>
          ))}
        </DataContainer>
      </MainContent>
      <NavigationBar />
    </PageContainer>
  );
}

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #787878;
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
`;

const HeaderContainer = styled.div`
  width: 100%;
  flex: 0 0 60px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: white;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 80px;
`;

const NavigationButton = styled.button`
  font-size: 1.5rem;
  padding: 10px 20px;
  margin-top: 20px;
  cursor: pointer;
  font-weight: bold;
`;

const DataContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 20px;
  padding: 20px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ColumnHeader = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: red;
  margin-bottom: 10px;
`;

const DataItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 550px;
  height: 30px;
  padding: 3px;
  background-color: transparent;
  border: 1px solid black;
  border-radius: 0;
`;
const DataCont = styled.div`
  border: 1px solid;
`;

const StatusIndicator = styled.div`
  width: 50px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ status }) => (status ? "green" : "white")};
  color: ${({ status }) => (status ? "white" : "black")};
  font-size: 12px;
  font-weight: bold;
`;

const ValueContainer = styled.div`
  flex: 1;
  padding-left: 10px;
`;

export default Output;
