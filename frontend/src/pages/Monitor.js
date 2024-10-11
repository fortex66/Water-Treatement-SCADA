import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";

function Monitor() {
  return (
    <MonitorContainer>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <OuterBox>
        <InfoText>[ 모니터 목록 선택 ]</InfoText>
        <Link to="/input">
          <NavigationButton>I/O모니터</NavigationButton>
        </Link>
        <InnerBox>
          <InfoText>[ 진행시간 & 공정상태 확인 ]</InfoText>
          <Link to="/m100">
            <Button>[ M100 ]</Button>
          </Link>

          <Link to="/m200">
            <Button>[ M200 ]</Button>
          </Link>

          <Link to="/m300">
            <Button>[ M300 ]</Button>
          </Link>
        </InnerBox>
      </OuterBox>
      <NavigationBar />
    </MonitorContainer>
  );
}

const MonitorContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #787878;
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
`;

const HeaderContainer = styled.div`
  width: 100%;
  flex: 0 0 60px; /* Fixed height for header */
`;

const OuterBox = styled.div`
  border: 2px solid #000;
  padding: 20px;
  margin: 20px auto;
  max-width: 600px;
  text-align: center;
  background-color: #fff;
  font-weight: bold;
`;

const InnerBox = styled.div`
  border: 2px solid #000;
  padding: 10px;
  margin-top: 10px;
  text-align: center;
  background-color: #f0f0f0;
  font-weight: bold;
`;

const InfoText = styled.div`
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

const NavigationButton = styled.button`
  font-size: 1.5rem;
  padding: 10px 20px;
  margin: 10px;
  cursor: pointer;
  font-weight: bold;
`;

const Button = styled.button`
  margin: 10px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
`;

export default Monitor;
