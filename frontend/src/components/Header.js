// Header.js
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { StatusContext } from "../contexts/StatusContext";
import { useLocation } from "react-router-dom";

// Styled components
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #808080;
  border-bottom: 3px solid black;
`;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: black;

  &:last-child {
    border-right: none;
  }
`;

const EmptyBox = styled(Box)`
  width: 15%;
`;

const InfoBox = styled(Box)`
  width: 50%;
  background-color: green;
  color: white;
  border-left: 3px solid black;
  border-right: 3px solid black;
`;

const Title = styled.div`
  font-size: 24px;
  font-weight: bold;
  border-bottom: 3px solid black;
  width: 100%;
  text-align: center;
  padding: 8px 0;
  color: black;
`;

const BottomTitle = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 14px;
  padding: 7px 0;
  background-color: #a0a0a4;
`;

const Copyright = styled.div`
  padding-left: 10px;
`;

const ModeBox = styled(Box)`
  width: 10%;
  background-color: white;
  border-left: 3px solid black;
`;

const DriveMode = styled.div`
  font-size: 16px;
  border-bottom: 3px solid black;
  width: 100%;
  text-align: center;
  padding: 9px 0;
  font-weight: 600;
`;

const DriveInfo = styled.div`
  background-color: ${(props) => (props.status === "true" ? "green" : "red")};
  border: none;
  color: black;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
  width: 100%;
  padding: 10px 0px 10px 0px;
`;

const DateBox = styled(Box)`
  width: 25%;
  background-color: white;
`;

const DateTime = styled.div`
  font-size: 16px;
  border-bottom: 3px solid black;
  width: 100%;
  text-align: center;
  padding: 9px 0;
  font-weight: 600;
`;

const DateTimeInfo = styled.div`
  width: 100%;
  text-align: center;
  font-weight: 600;
  padding: 9px 0px 10px 0px;
`;

const Date = styled.span`
  margin-right: 10px;
`;

const Time = styled.span``;

// Header component
const Header = () => {
  const { status } = useContext(StatusContext);
  const [dateTime, setDateTime] = useState(new window.Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new window.Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/drive":
        return "MAIN 공정 모니터";
      case "/settings":
        return "자동 & 수동 DATA 설정";
      case "/monitor":
        return "I/O & 공정 모니터";
      case "/input":
        return "I/O 모니터";
      case "/output":
        return "I/O 모니터";
      case "/m100":
        return "진행시간 & 공정상태 확인";
      case "/m200":
        return "진행시간 & 공정상태 확인";
      case "/m300":
        return "진행시간 & 공정상태 확인";
      case "/alarm":
        return "ALARM 확인 & 관리";
      case "/logging":
        return "LOGGING DATA";
      case "/graph":
        return "LOGGING GRAPH";
      case "/history":
        return "DATABASE 조회 & 다운로드";
      default:
        return "수처리 설비 모니터링";
    }
  };

  const getFormattedDateTime = () => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    const date = dateTime
      .toLocaleDateString("en-CA", options)
      .replaceAll("-", "/");
    const time = dateTime.toLocaleTimeString("en-US", { hour12: false });
    const day = dateTime.toLocaleDateString("en-US", { weekday: "short" });

    return (
      <>
        <Date>{`${date} (${day})`}</Date>
        <Time>{time}</Time>
      </>
    );
  };

  return (
    <HeaderContainer>
      <EmptyBox />

      <ModeBox>
        <DriveMode>운전모드</DriveMode>
        <DriveInfo status={status[1] ? "true" : "false"}>
          {status[1] ? "자동" : "수동"}
        </DriveInfo>
      </ModeBox>

      <InfoBox>
        <Title> {getPageTitle()} </Title>
        <BottomTitle>
          <Copyright>Copyright 2023, ENSYS ALL rights reserved</Copyright>
        </BottomTitle>
      </InfoBox>

      <DateBox>
        <DateTime> DATE TIME </DateTime>
        <DateTimeInfo>{getFormattedDateTime()}</DateTimeInfo>
      </DateBox>
    </HeaderContainer>
  );
};

export default Header;
