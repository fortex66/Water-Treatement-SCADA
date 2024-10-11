import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import { SocketContext } from "../App";

function M300() {
  const initialData = {
    defaultData: [
      { value: "STEP.01", status: false, text: "U/V 재생조 이송펌프 기동" },
      { value: "STEP.02", status: false, text: "U/V 재생조 이송펌프 정지" },
      { value: "STEP.03", status: false, text: "U/V 교반기 & LAMP ON" },
      { value: "STEP.04", status: false, text: "U/V 교반기 & LAMP OFF" },
      { value: "STEP.05", status: false, text: "흡착조 반송펌프 기동" },
      { value: "STEP.06", status: false, text: "흡착조 반송펌프 정지" },
      { value: "STEP.07", status: false, text: "Retrun 대기중" },
      { value: "STEP.08", status: false, text: "" },
      { value: "STEP.09", status: false, text: "" },
      { value: "STEP.10", status: false, text: "" },
      { value: "STEP.11", status: false, text: "" },
      { value: "STEP.12", status: false, text: "" },
    ],
    processData: [
      {
        processName: "흡착조 반송P/P off 후 U/V재생조 이송펌프 on",
        setTimeMin: "0",
        setTimeSec: "0",
        currentTimeHr: "0",
        currentTimeMin: "0",
        currentTimeSec: "0",
      },
      {
        processName: "U/V 교반기 & U/V LAMP on",
        setTimeMin: "0",
        setTimeSec: "0",
        currentTimeHr: "0",
        currentTimeMin: "0",
        currentTimeSec: "0",
      },
      {
        processName: "[M200]공정 흡입펌프 on 후 U/V 재생조 이송펌프 on",
        setTimeMin: "0",
        setTimeSec: "0",
        currentTimeHr: "0",
        currentTimeMin: "0",
        currentTimeSec: "0",
      },
    ],
  };

  const [data, setData] = useState(initialData);
  const socket = useContext(SocketContext);

  useEffect(() => {
    const handleData = (receivedData) => {
      //console.log(receivedData.data);
      if (
        receivedData &&
        receivedData.m300_D_part &&
        receivedData.m300_M_part
      ) {
        if (
          receivedData.m300_D_part.length > 0 &&
          receivedData.m300_M_part.length > 0
        ) {
          const updatedDefaultData = initialData.defaultData.map(
            (item, index) => {
              const status = receivedData.m300_M_part[index];
              return { ...item, status };
            }
          );

          const updatedProcessData = initialData.processData.map(
            (item, index) => {
              const setTimeMin = receivedData.m300_D_part[2 * index + 1];
              const setTimeSec = receivedData.m300_D_part[2 * index + 2];
              const currentTimeHr = receivedData.m300_D_part[2 * index + 7];
              const currentTimeMin = receivedData.m300_D_part[2 * index + 8];
              const currentTimeSec = receivedData.m300_D_part[2 * index + 9];
              return {
                ...item,
                setTimeMin,
                setTimeSec,
                currentTimeHr,
                currentTimeMin,
                currentTimeSec,
              };
            }
          );

          setData({
            defaultData: updatedDefaultData,
            processData: updatedProcessData,
          });
          //console.log(updatedDefaultData);
          //console.log(updatedProcessData);
        } else {
          // console.error(
          //   "Received data has empty parts, keeping previous state."
          // );
        }
      } else {
        // console.error("Received incomplete data, keeping previous state.");
      }
    };

    socket.emit("requestPageData", { page: "m300" });

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
              {data.m300_D_part && data.m300_D_part[0]
                ? data.m300_D_part[0]
                : 0}
              <StatusIndicator />
              &nbsp;&nbsp;:&nbsp; &nbsp;진행중
            </Title>
          </TitleContainer>
          <Table>
            <tbody>
              {data.defaultData.map((item, index) => (
                <TableRow key={index}>
                  <StepCell>{item.value}</StepCell>
                  <TableCell>{item.text}</TableCell>
                  <StatusIndicatorCell status={item.status} />
                </TableRow>
              ))}
            </tbody>
          </Table>
        </StepMonitorContainer>
        <ProcessTimeContainer>
          <ProcessTitleContainer>공정진행시간</ProcessTitleContainer>
          <ProcessTable>
            <thead>
              <tr>
                <TableHeader>공정</TableHeader>
                <TableHeader>설정시간</TableHeader>
                <TableHeader>현재시간</TableHeader>
              </tr>
            </thead>
            <tbody>
              {data.processData.map((item, index) => (
                <ProcessTableRow key={index}>
                  <ProcessNameCell>{item.processName}</ProcessNameCell>
                  <SetTimeCell>
                    <div>
                      {item.setTimeMin}
                      &nbsp;&nbsp;hr&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      {item.setTimeSec}&nbsp;&nbsp;min
                    </div>
                  </SetTimeCell>
                  <CurrentTimeCell>
                    <div>
                      {item.currentTimeHr}&nbsp;hr&nbsp;&nbsp;
                      {item.currentTimeMin}&nbsp;min&nbsp;&nbsp;
                      {item.currentTimeSec}&nbsp;sec
                    </div>
                  </CurrentTimeCell>
                </ProcessTableRow>
              ))}
            </tbody>
          </ProcessTable>
        </ProcessTimeContainer>
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
  gap: 7%;
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

const ProcessTimeContainer = styled.div`
  width: 40%;

  background-color: white;
  border: 1px solid black;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProcessTitleContainer = styled.div`
  font-size: 1.5rem;
  padding: 10px 20px;
  font-weight: bold;
  border: 1px solid black;
  margin-bottom: 20px;
  text-align: center;
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

const ProcessTableRow = styled(TableRow)`
  height: 100px; /* ProcessTable의 행 높이 조절 */
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

const TableHeader = styled.th`
  padding: 10px;
  border: 1px solid white;
`;

const ProcessNameCell = styled.td`
  padding: 10px;
  width: 40%;
  border: 1px solid white;
  text-align: center;
`;

const SetTimeCell = styled.td`
  width: 30%;
  border: 1px solid white;
  text-align: center;
  color: yellow;
`;

const CurrentTimeCell = styled.td`
  width: 30%;
  border: 1px solid white;
  text-align: center;
  color: magenta;
`;

const ProcessTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export default M300;
