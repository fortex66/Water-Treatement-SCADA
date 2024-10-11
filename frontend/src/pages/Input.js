import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import { SocketContext } from "../App";

function Input() {
  const defaultData = [
    {
      value: "M204] M-01 멤브레인 탈리브로워[상시] TRIP",
      status: false,
      text: "P000",
    },
    {
      value: "M204] M-02 멤브레인 탈리브로워[예비] TRIP",
      status: false,
      text: "P001",
    },
    {
      value: "M203] M-03 흡착제 유동브로워[상시] TRIP",
      status: false,
      text: "P002",
    },
    {
      value: "M203] M-04 흡착제 유동브로워[예비] TRIP",
      status: false,
      text: "P003",
    },
    { value: "M101-A] M-05 유입펌프[A] TRIP", status: false, text: "P004" },
    { value: "M101-B] M-06 유입펌프[B] TRIP", status: false, text: "P005" },
    { value: "M207-A] M-07 흡입펌프[A] TRIP", status: false, text: "P006" },
    { value: "M207-B] M-08 흡입펌프[B] TRIP", status: false, text: "P007" },
    { value: "M210-A] M-09 방류펌프[A] TRIP", status: false, text: "P008" },
    { value: "M210-B] M-10 방류펌프[B] TRIP", status: false, text: "P009" },
    {
      value: "M301-A] M-11 U/V재생조[A] 이송펌프 TRIP",
      status: false,
      text: "P00A",
    },
    {
      value: "M301-B] M-12 U/V재생조[B] 이송펌프 TRIP",
      status: false,
      text: "P00B",
    },
    {
      value: "M304] M-13 흡착조 반송펌프[상시] TRIP",
      status: false,
      text: "P00C",
    },
    {
      value: "M304] M-14 흡착조 반송펌프[예비] TRIP",
      status: false,
      text: "P00D",
    },
    { value: "M302] M-15 U/V 교반기 TRIP", status: false, text: "P00E" },
    { value: "M208] M-16 역세펌프 INV ALM", status: false, text: "P00F" },
    { value: "M102] 유입수조 [LL]", status: false, text: "P010" },
    { value: "M102] 유입수조 [L]", status: false, text: "P011" },
    { value: "M102] 유입수조 [H]", status: false, text: "P012" },
    { value: "M102] 유입수조 [HH]", status: false, text: "P013" },
    { value: "M201] 흡착조 TANK [LL]", status: false, text: "P014" },
    { value: "M201] 흡착조 TANK [L]", status: false, text: "P015" },
    { value: "M201] 흡착조 TANK [H]", status: false, text: "P016" },
    { value: "M201] 흡착조 TANK [HH]", status: false, text: "P017" },
    { value: "M209] 처리수조 [LL]", status: false, text: "P018" },
    { value: "M209] 처리수조 [L]", status: false, text: "P019" },
    { value: "M209] 처리수조 [H]", status: false, text: "P01A" },
    { value: "M209] 처리수조 [HH]", status: false, text: "P01B" },
    { value: "M302] 재생조 [LL]", status: false, text: "P01C" },
    { value: "M302] 재생조 [L]", status: false, text: "P01D" },
    { value: "M302] 재생조 [H]", status: false, text: "P01E" },
    { value: "M302] 재생조 [HH]", status: false, text: "P01F" },
    { value: "M212] 유출V/V #1 FWD L/S", status: false, text: "P040" },
    { value: "M212] 유출V/V #1 RWD L/S", status: false, text: "P041" },
    { value: "M212] 유출V/V #2 FWD L/S", status: false, text: "P042" },
    { value: "M212] 유출V/V #2 RWD L/S", status: false, text: "P043" },
    { value: "M212] 유출V/V #3 FWD L/S", status: false, text: "P044" },
    { value: "M212] 유출V/V #3 RWD L/S", status: false, text: "P045" },
    { value: "M213] 수역세V/V #1 FWD L/S", status: false, text: "P046" },
    { value: "M213] 수역세V/V #1 RWD L/S", status: false, text: "P047" },
    { value: "M213] 수역세V/V #2 FWD L/S", status: false, text: "P048" },
    { value: "M213] 수역세V/V #2 RWD L/S", status: false, text: "P049" },
    { value: "M213] 수역세V/V #3 FWD L/S", status: false, text: "P04A" },
    { value: "M213] 수역세V/V #3 RWD L/S", status: false, text: "P04B" },
    { value: "추가 V/V #1 FWD L/S", status: false, text: "P04C" },
    { value: "추가 V/V #1 RWD L/S", status: false, text: "P04D" },
    { value: "추가 V/V #2 FWD L/S", status: false, text: "P04E" },
    { value: "추가 V/V #2 RWD L/S", status: false, text: "P04F" },
  ];

  // 데이터 재구성: 16개씩 세로로 정렬
  const numRows = 16;
  const numCols = Math.ceil(defaultData.length / numRows);
  const reshapedData = Array.from({ length: numRows }, (_, rowIndex) =>
    Array.from(
      { length: numCols },
      (_, colIndex) => defaultData[rowIndex + colIndex * numRows] || null
    )
  );

  const columnHeaders = [
    "[ P 000 ~ P 00F ]",
    "[ P 010 ~ P 01F ]",
    "[ P 040 ~ P 04F ]",
  ];
  const [data, setData] = useState(reshapedData);
  const socket = useContext(SocketContext);

  useEffect(() => {
    const handleData = (receivedData) => {
      if (receivedData && receivedData.input_M_part) {
        if (receivedData.input_M_part.length > 0) {
          const updatedData = defaultData.map((item, index) => {
            const status = receivedData.input_M_part[index];
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

    socket.emit("requestPageData", { page: "input" }); // Setting 페이지 데이터 요청

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
        <Link to="/output">
          <NavigationButton>OUTPUT</NavigationButton>
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
const DataCont = styled.div`
  border: 1px solid;
`;
const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ColumnHeader = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: yellow;
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

export default Input;
