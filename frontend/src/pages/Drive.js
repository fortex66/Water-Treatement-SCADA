/* eslint-disable */
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { SocketContext } from "../App";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import DiagramEvents from "../components/DiagramEvents";

const DriveContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #787878;
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  overflow: hidden; // 스크롤 제거
`;

const HeaderContainer = styled.div`
  width: 100%;
  flex: 0 0 60px;
`;

const DiagramContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  overflow: hidden; // 스크롤 제거
`;

const FooterContainer = styled.div`
  width: 100%;
  flex: 0 0 50px;
`;

const Drive = () => {
  const socket = useContext(SocketContext);
  const [data, setData] = useState({
    dirve_D_part: [],
    drive_M_part: [],
  });

  useEffect(() => {
    const handleData = (receivedData) => {
      if (
        receivedData &&
        receivedData.dirve_D_part &&
        receivedData.drive_M_part
      ) {
        if (
          receivedData.dirve_D_part.length > 0 &&
          receivedData.drive_M_part.length > 0
        ) {
          setData({
            dirve_D_part: receivedData.dirve_D_part,
            drive_M_part: receivedData.drive_M_part,
          });
        } else {
          // console.error(
          //   "Received data has empty parts, keeping previous state."
          // );
        }
      } else {
        // console.error("Received incomplete data, keeping previous state.");
      }
    };

    socket.emit("requestPageData", { page: "drive" }); // Drive 페이지 데이터 요청
    socket.on("pageData", handleData);

    return () => {
      socket.off("pageData", handleData); // 컴포넌트 언마운트 시 이벤트 리스너 제거
    };
  }, []);

  return (
    <DriveContainer>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <DiagramContainer>
        <DiagramEvents data={data} />
      </DiagramContainer>
      <FooterContainer>
        <NavigationBar />
      </FooterContainer>
    </DriveContainer>
  );
};

export default Drive;
