import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import { SocketContext } from "../App";

function M100() {
  const defaultData = [
    { value: "STEP.01", status: false, text: "유입펌프 기동" },
    { value: "STEP.02", status: false, text: "" },
    { value: "STEP.03", status: false, text: "" },
    { value: "STEP.04", status: false, text: "" },
    { value: "STEP.05", status: false, text: "" },
    { value: "STEP.06", status: false, text: "" },
    { value: "STEP.07", status: false, text: "" },
    { value: "STEP.08", status: false, text: "" },
    { value: "STEP.09", status: false, text: "" },
    { value: "STEP.10", status: false, text: "" },
    { value: "STEP.11", status: false, text: "" },
    { value: "STEP.12", status: false, text: "" },
  ];

  const [data, setData] = useState(defaultData);
  const socket = useContext(SocketContext);

  useEffect(() => {
    const handleData = (receivedData) => {
      if (
        receivedData &&
        receivedData.m100_D_part &&
        receivedData.m100_M_part
      ) {
        if (
          receivedData.m100_D_part.length > 0 &&
          receivedData.m100_M_part.length > 0
        ) {
          const updatedData = defaultData.map((item, index) => {
            const status = receivedData.m100_M_part[index];
            return { ...item, status };
          });
          setData(updatedData);
          //console.log(updatedData);
        } else {
          // console.error(
          //   "Received data has empty parts, keeping previous state."
          // );
        }
      } else {
        // console.error("Received incomplete data, keeping previous state.");
      }
    };

    socket.emit("requestPageData", { page: "m100" }); // Setting 페이지 데이터 요청

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
      <ContentContainer>
        <StepMonitorContainer>
          <StepWordContainer>STEP 모니터</StepWordContainer>
          <TitleContainer>
            <Title>
              STEP 확인 &nbsp;: &nbsp;&nbsp;&nbsp;
              {data.m100_D_part && data.m100_D_part[0]
                ? data.m100_D_part[0]
                : 0}
              <StatusIndicator /> &nbsp;&nbsp;:&nbsp; &nbsp;진행중
            </Title>
          </TitleContainer>
          <Table>
            <tbody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <StepCell>{item.value}</StepCell>
                  <TableCell>{item.text}</TableCell>
                  <StatusIndicatorCell status={item.status} />
                </TableRow>
              ))}
            </tbody>
          </Table>
        </StepMonitorContainer>
        <RightContainer />
      </ContentContainer>
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

const ContentContainer = styled.div`
  margin-top: 120px;
  left: 5%;
  width: 90%;
  display: flex;
  justify-content: flex-start;
  position: relative;
`;

const StepWordContainer = styled.div`
  font-size: 1.5rem;
  padding: 10px 20px;
  font-weight: bold;
  border: 1px solid black;
  margin-bottom: 20px;
  text-align: center;
`;

const StepMonitorContainer = styled.div`
  width: 40%;
  background-color: white;
  border: 1px solid black;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RightContainer = styled.div`
  width: 50%;
`;

const TitleContainer = styled.div`
  margin-bottom: 10px;
`;

const Title = styled.div`
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableRow = styled.tr`
  background-color: black;
  color: white;
`;

const StepCell = styled.td`
  padding: 10px;
  width: 10%;
  border: 1px solid white;
`;

const TableCell = styled.td`
  padding: 10px;
  width: 80%;
  border: 1px solid white;
  text-align: center;
`;

const StatusIndicatorCell = styled.td`
  padding: 5px;
  width: 10%;
  text-align: center;
  border: 1px solid white;
  position: relative;

  &::before {
    content: "";
    display: block;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: ${(props) => (props.status === true ? "red" : "#8a6e6e")};
    margin: 0 auto;
  }
`;

const StatusIndicator = styled.span`
  margin-left: 200px;
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: red;
`;

export default M100;
