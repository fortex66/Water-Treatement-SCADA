import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import { SocketContext } from "../App";

function M200() {
  const initialData = {
    defaultData: [
      { value: "STEP.01", status: false, text: "브로워 기동" },
      { value: "STEP.02", status: false, text: "흡입펌프 & 방류펌프 기동" },
      { value: "STEP.03", status: false, text: "유출밸브 CLS & 흡입펌프 정지" },
      { value: "STEP.04", status: false, text: "역세펌프 기동" },
      { value: "STEP.05", status: false, text: "수역세밸브 #1 OPN" },
      { value: "STEP.06", status: false, text: "수역세밸브 #1 CLS" },
      { value: "STEP.07", status: false, text: "수역세밸브 #2 OPN" },
      { value: "STEP.08", status: false, text: "수역세밸브 #2 CLS" },
      { value: "STEP.09", status: false, text: "수역세밸브 #3 OPN" },
      { value: "STEP.10", status: false, text: "수역세밸브 #3 CLS" },
      { value: "STEP.11", status: false, text: "역세펌프 정지" },
      { value: "STEP.12", status: false, text: "유출밸브 OPN" },
    ],
    processData: [
      {
        processName: "멤브레인 탈리브로워 & 흡착제 유동브로워 on",
        setTimeMin: "0",
        setTimeSec: "0",
        currentTimeMin: "0",
        currentTimeSec: "0",
      },
      {
        processName: "흡입펌프 on 후 유출밸브 close",
        setTimeMin: "0",
        setTimeSec: "0",
        currentTimeMin: "0",
        currentTimeSec: "0",
      },
      {
        processName: "수역세밸브 #1 open",
        setTimeMin: "0",
        setTimeSec: "0",
        currentTimeMin: "0",
        currentTimeSec: "0",
      },
      {
        processName: "수역세밸브 #2 open",
        setTimeMin: "0",
        setTimeSec: "0",
        currentTimeMin: "0",
        currentTimeSec: "0",
      },
      {
        processName: "수역세밸브 #3 open",
        setTimeMin: "0",
        setTimeSec: "0",
        currentTimeMin: "0",
        currentTimeSec: "0",
      },
    ],
  };

  const [data, setData] = useState(initialData);
  const socket = useContext(SocketContext);

  useEffect(() => {
    const handleData = (receivedData) => {
      if (
        receivedData &&
        receivedData.m200_D_part &&
        receivedData.m200_M_part
      ) {
        if (
          receivedData.m200_D_part.length > 0 &&
          receivedData.m200_M_part.length > 0
        ) {
          const updatedDefaultData = initialData.defaultData.map(
            (item, index) => {
              const status = receivedData.m200_M_part[index] ?? false;
              return { ...item, status };
            }
          );

          const updatedProcessData = initialData.processData.map(
            (item, index) => {
              const setTimeMin = receivedData.m200_D_part[2 * index + 1] ?? "0";
              const setTimeSec = receivedData.m200_D_part[2 * index + 2] ?? "0";
              const currentTimeMin =
                receivedData.m200_D_part[2 * index + 11] ?? "0";
              const currentTimeSec =
                receivedData.m200_D_part[2 * index + 12] ?? "0";
              return {
                ...item,
                setTimeMin,
                setTimeSec,
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

    socket.emit("requestPageData", { page: "m200" });

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
              {data.m200_D_part && data.m200_D_part[0]
                ? data.m200_D_part[0]
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
                      {item.setTimeMin}&nbsp;&nbsp;min
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      {item.setTimeSec}&nbsp;&nbsp;sec
                    </div>
                  </SetTimeCell>
                  <CurrentTimeCell>
                    <div>
                      {item.currentTimeMin}&nbsp;&nbsp;min
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      {item.currentTimeSec}&nbsp;&nbsp;sec
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
  font-size: 18px;
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

export default M200;
