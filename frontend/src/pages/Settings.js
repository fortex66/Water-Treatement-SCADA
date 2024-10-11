/* eslint-disable */
import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import Modal from "react-modal"; // react-modal import 추가
import { SocketContext } from "../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import PumpModal from "../components/PumpModal";

function Settings() {
  const [data, setData] = useState([]);
  const [inputValues, setInputValues] = useState("");
  const socket = useContext(SocketContext);
  const [isPumpModalOpen, setIsPumpModalOpen] = useState(false); // 모달 상태 관리
  //D영역 쓰기 위치
  const write_D_part = [
    8000, 8001, 8002, 8003, 8004, 8005, 8006, 8007, 8008, 8009, 8010, 8011,
    8012, 8013, 8014, 8015, 8100, 8102, 8104, 1017,
  ];
  //M영역 쓰기 위치
  const write_M_part = ["8090", "8091", "8061", "8062", "8063", "8067"];

  const tableFirstCell = [
    "흡착조 반송P/P off 후\nU/V재생조 이송펌프 on",
    "U/V 교반기 & U/V LAMP on",
    "맴브레인 탈리브로워 &\n흡착제 유동브로워 on",
    "흡입펌프 on 후\n유출밸브 close",
    "수역세밸브 #1 open",
    "수역세밸브 #2 open",
    "수역세밸브 #3 open",
    "[M200]공정 흡입펌프 on 후\nU/V 재생조 이송펌프 on",
  ];

  useEffect(() => {
    const handleData = (receivedData) => {
      //console.log(receivedData);
      if (
        receivedData &&
        receivedData.setting_D1_part &&
        receivedData.setting_D2_part &&
        receivedData.setting_D3_part &&
        receivedData.setting_M_part
      ) {
        if (
          receivedData.setting_D1_part.length > 0 &&
          receivedData.setting_D2_part.length > 0 &&
          receivedData.setting_D3_part.length > 0 &&
          receivedData.setting_M_part.length > 0
        ) {
          setData(receivedData);
        } else {
          // console.error(
          //   "Received data has empty parts, keeping previous state."
          // );
        }
      } else {
        // console.error("Received incomplete data, keeping previous state.");
      }
    };

    socket.emit("requestPageData", { page: "setting" }); // Setting 페이지 데이터 요청

    socket.on("pageData", handleData);

    return () => {
      socket.off("pageData", handleData);
    };
  }, []);

  const openPumpModal = () => {
    setIsPumpModalOpen(true);
  };

  const closeModal = () => {
    socket.emit("closeModal", "pumpmodal"); // 서버로 closeModal 이벤트 전송
    setIsPumpModalOpen(false);
  };

  // 서버에 데이터를 전송하는 함수
  const handleInputChange = (id, key, newValue) => {
    // 여기서 서버에 데이터를 보낼 수 있습니다.
    if (id === "M") {
      const coil = write_M_part[key];
      //console.log(coil, newValue);
      socket.emit("writeCoil", { coil, newValue, page: "setting" });
    } else if (id === "D") {
      const register = write_D_part[key];
      //console.log(register, key, newValue);
      socket.emit("writeRegister", { register, newValue, page: "setting" });
    }
  };
  return (
    <SettingsContainer>
      <Header></Header>
      <BackgroundContainer>
        <FirstColumn>
          <FluorescentHeader>{"운전 DATA 등록"}</FluorescentHeader>
          <DriveHeader>{"자동운전 TIME 설정"}</DriveHeader>
          <StyledTable>
            <tbody>
              {tableFirstCell.map((cell, index) => (
                <StyledRow key={index}>
                  <StyledFirstCell>{cell}</StyledFirstCell>
                  <StyledSecondCell>
                    <TimeInput
                      type="number"
                      placeholder={
                        data.setting_D1_part
                          ? data.setting_D1_part[index * 2]
                          : ""
                      }
                      value={inputValues[`D-${index * 2}`] || ""}
                      onChange={(e) =>
                        setInputValues((prev) => ({
                          ...prev,
                          [`D-${index * 2}`]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        handleInputChange("D", index * 2, e.target.value)
                      }
                      style={{ marginRight: "10px" }}
                    />
                    {index + 1 === 1 || index + 1 === 2 || index + 1 === 8
                      ? "hr"
                      : "min"}
                    <TimeInput
                      type="number"
                      placeholder={
                        data.setting_D1_part
                          ? data.setting_D1_part[index * 2 + 1]
                          : ""
                      }
                      value={inputValues[`D-${index * 2 + 1}`] || ""}
                      onChange={(e) =>
                        setInputValues((prev) => ({
                          ...prev,
                          [`D-${index * 2 + 1}`]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        handleInputChange("D", index * 2 + 1, e.target.value)
                      }
                    />
                    {index + 1 === 1 || index + 1 === 2 || index + 1 === 8
                      ? "min"
                      : "sec"}
                  </StyledSecondCell>
                </StyledRow>
              ))}
            </tbody>
          </StyledTable>
        </FirstColumn>
        <SecondColumn>
          <PumpHeader>{" 역세펌프 INV DATA 설정 "}</PumpHeader>
          <BlackBox>
            <LeftSection>
              <Group color="#00ff00">{"모터 사양 입력"}</Group>
              <InputRow>
                <StyledLabel color={"yellow"}>감속비</StyledLabel>
                <INVInput
                  type="number"
                  placeholder={
                    data.setting_D2_part
                      ? (data.setting_D2_part[0] * 0.1).toFixed(1)
                      : ""
                  }
                  value={inputValues["D-16"] || ""}
                  onChange={(e) =>
                    setInputValues((prev) => ({
                      ...prev,
                      "D-16": e.target.value,
                    }))
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleInputChange("D", 16, e.target.value * 10)
                  }
                  style={{
                    color: "yellow",
                    background: "transparent",
                    width: "40%",
                    textAlign: "center",
                  }}
                />
              </InputRow>
              <InputRow>
                <StyledLabel color={"yellow"}>모터정격속도[RPM]</StyledLabel>
                <INVInput
                  type="number"
                  placeholder={
                    data.setting_D2_part ? data.setting_D2_part[2] : ""
                  }
                  value={inputValues["D-17"] || ""}
                  onChange={(e) =>
                    setInputValues((prev) => ({
                      ...prev,
                      "D-17": e.target.value,
                    }))
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleInputChange("D", 17, e.target.value)
                  }
                  style={{
                    color: "yellow",
                    background: "transparent",
                    width: "40%",
                    textAlign: "center",
                  }}
                />
              </InputRow>
              <Group color="#00ff00">{"DATA 설정 입력"}</Group>
              <InputRow>
                <StyledLabel color={"yellow"}>
                  설정속도
                  <br />
                  [RPM]
                </StyledLabel>
                <INVInput
                  type="number"
                  placeholder={
                    data.setting_D2_part ? data.setting_D2_part[4] : ""
                  }
                  value={inputValues["D-18"] || ""}
                  onChange={(e) =>
                    setInputValues((prev) => ({
                      ...prev,
                      "D-18": e.target.value,
                    }))
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleInputChange("D", 18, e.target.value)
                  }
                  style={{
                    color: "yellow",
                    background: "transparent",
                    width: "40%",
                    textAlign: "center",
                  }}
                />
              </InputRow>
              <InputRow>
                <StyledLabel color={"#00ff00"}>[방향 선택]</StyledLabel>
              </InputRow>
              <LampContainer>
                <ArrowContainer>
                  <DirectionButtonsContainer>
                    <StyledLabel2 color={"yellow"}>[FWD]</StyledLabel2>
                    <StyledLabel2 color={"yellow"}>[RWD]</StyledLabel2>
                  </DirectionButtonsContainer>
                  <DirectionButtonsContainer>
                    <DirectionButton
                      onClick={() => handleInputChange("M", 0, true)}
                    >
                      <FontAwesomeIcon
                        icon={faArrowLeft}
                        size="2x"
                        color={
                          data.setting_M_part && data.setting_M_part[0] == true
                            ? "#00ff00"
                            : "#003300"
                        }
                      />
                    </DirectionButton>
                    <DirectionButton
                      onClick={() => handleInputChange("M", 1, true)}
                    >
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        size="2x"
                        color={
                          data.setting_M_part && data.setting_M_part[1] == true
                            ? "#00ff00"
                            : "#003300"
                        }
                      />
                    </DirectionButton>
                  </DirectionButtonsContainer>
                </ArrowContainer>
                <CircleContainer>
                  <CircleText>AL</CircleText>
                  <Circle
                    color={
                      data.setting_M_part && data.setting_M_part[2]
                        ? "red"
                        : "gray  "
                    }
                  ></Circle>
                </CircleContainer>
              </LampContainer>
            </LeftSection>
            <RightSection>
              <Group color="white">{"현재 설정값"}</Group>
              <InputRow>
                <StyledLabel color={"magenta"}>
                  현재속도1차측
                  <br />
                  [RPM]
                </StyledLabel>
                <StyledLabel color={"magenta"} line={"dashed"}>
                  {data.setting_D3_part && data.setting_D3_part[0]}
                </StyledLabel>
              </InputRow>
              <InputRow>
                <StyledLabel color={"magenta"}>
                  현재속도2차측
                  <br />
                  [RPM]
                </StyledLabel>
                <StyledLabel color={"magenta"} line={"dashed"}>
                  {data.setting_D3_part && data.setting_D3_part[1]}
                </StyledLabel>
              </InputRow>
              <InputRow>
                <StyledLabel color={"magenta"}>
                  현재속도
                  <br />
                  [hz]
                </StyledLabel>
                <StyledLabel color={"magenta"} line={"dashed"}>
                  {data.setting_D3_part &&
                    (data.setting_D3_part[2] * 0.01).toFixed(2)}
                </StyledLabel>
              </InputRow>
              <InputRow>
                <StyledLabel color={"white"}>
                  INV 설정속도
                  <br />
                  [hz]
                </StyledLabel>

                <INVInput
                  type="number"
                  placeholder={
                    data.setting_D3_part
                      ? (data.setting_D3_part[3] * 0.01).toFixed(2)
                      : ""
                  }
                  value={inputValues["D-19"] || ""}
                  onChange={(e) =>
                    setInputValues((prev) => ({
                      ...prev,
                      "D-19": e.target.value,
                    }))
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleInputChange("D", 19, e.target.value * 100)
                  }
                  style={{
                    color: "yellow",
                    background: "transparent",
                    width: "40%",
                    textAlign: "center",
                  }}
                />
              </InputRow>
            </RightSection>
          </BlackBox>
          <MotorHeader>{"예비모터 사용/미사용"}</MotorHeader>
          <BlackBox2>
            <ModuleContainer>
              <ModuleBox>
                <ModuleTitle>M204 맴브레인 탈리브로워</ModuleTitle>
                <ModuleStatus>
                  <MoudelStatusButton
                    color={
                      data.setting_M_part && data.setting_M_part[3]
                        ? "yellow"
                        : "#555"
                    }
                    onClick={() => handleInputChange("M", 2, true)}
                  >
                    {data.setting_M_part && data.setting_M_part[3]
                      ? "예비모터 사용"
                      : "예비모터 미사용"}
                  </MoudelStatusButton>
                </ModuleStatus>
              </ModuleBox>
              <ModuleBox>
                <ModuleTitle>M203 맴브레인 탈리브로워</ModuleTitle>
                <ModuleStatus>
                  <MoudelStatusButton
                    color={
                      data.setting_M_part && data.setting_M_part[4]
                        ? "yellow"
                        : "#555"
                    }
                    onClick={() => handleInputChange("M", 3, true)}
                  >
                    {data.setting_M_part && data.setting_M_part[4]
                      ? "예비모터 사용"
                      : "예비모터 미사용"}
                  </MoudelStatusButton>
                </ModuleStatus>
              </ModuleBox>
              <ModuleBox>
                <ModuleTitle>M304 맴브레인 탈리브로워</ModuleTitle>
                <ModuleStatus>
                  <MoudelStatusButton
                    color={
                      data.setting_M_part && data.setting_M_part[5]
                        ? "yellow"
                        : "#555"
                    }
                    onClick={() => handleInputChange("M", 4, true)}
                  >
                    {data.setting_M_part && data.setting_M_part[5]
                      ? "예비모터 사용"
                      : "예비모터 미사용"}
                  </MoudelStatusButton>
                </ModuleStatus>
              </ModuleBox>
            </ModuleContainer>
            <ModuelTextBox>* 정지상태에 한해서 설정변경 가능</ModuelTextBox>
          </BlackBox2>
        </SecondColumn>
        <ThirdColumn>
          <StyledButton
            style={{
              backgroundColor:
                data.setting_M_part && data.setting_M_part[6]
                  ? "#00ff00"
                  : "#aaa", // 조건에 따라 버튼 색상 변경
            }}
            onClick={() => handleInputChange("M", 5, true)} // 버튼 클릭 시 서버에 true 전송
          >
            VNC 원격
          </StyledButton>
          <ModalButton onClick={openPumpModal}>
            {" "}
            [A] & [B] 모터 선택
          </ModalButton>
        </ThirdColumn>
      </BackgroundContainer>
      <FooterContainer>
        <NavigationBar />
      </FooterContainer>
      <Modal
        isOpen={isPumpModalOpen}
        onRequestClose={closeModal} // 수정된 부분
        contentLabel="Pump Modal"
        shouldCloseOnOverlayClick={false}
        style={{
          content: {
            position: "absolute",
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "0", // 패딩 설정
            background: "none", // 배경 설정
            overflow: "visible", // 오버플로우 설정
          },
          overlay: {
            backgroundColor: "transparent", // 투명 배경 설정
          },
        }}
      >
        <PumpModal
          onClose={closeModal} // 수정된 부분
        />
      </Modal>
    </SettingsContainer>
  );
}

export default Settings;

const SettingsContainer = styled.div``;

const FooterContainer = styled.div`
  width: 100%;
  flex: 0 0 50px; /* Fixed height for footer */
`;

const BackgroundContainer = styled.div`
  background-color: #787878; // 기본 배경 색상
  width: 100%; // 너비 조정
  display: flex;
  height: 90vh;
  flex-direction: row;
  justify-content: space-between;
  // align-items: center;
`;

const FirstColumn = styled.div`
  display: flex;
  margin-top: 10px;
  margin-left: 15px;
  flex-direction: column;
  flex: 45%; // 첫 번째 열을 더 넓게 설정
  text-align: center;
  // position: relative;
`;
const SecondColumn = styled.div`
  margin-top: 70px;
  display: flex;
  flex-direction: column;
  flex: 45%; // 두 번째와 세 번째 열은 더 작게 설정
  text-align: center;
`;

const ThirdColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 10%;
  padding: 20px;
  text-align: center;
  height: 100%;
  margin-top: -120px;
  justify-content: flex-end; // 컨테이너 내부 콘텐츠를 아래로 정렬
`;

const FluorescentHeader = styled.div`
  background-color: #00ff00; // 형광 녹색
  height: 5vh; // 높이
  width: 40%; // 너비 설정
  display: flex;
  justify-content: center; // 가로 중앙 정렬
  align-items: center; // 세로 중앙 정렬
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 2vh;
  border: 1px solid;
`;

// 운전 헤더
const DriveHeader = styled.div`
  background-color: #00aeff;
  height: 10vh; // 높이
  padding: 5px 0px;
  flex: 1; // 자동으로 남은 공간을 차지
  width: 100%; // 전체 너비
  display: flex;
  justify-content: center; // 가로 중앙 정렬
  align-items: center; // 세로 중앙 정렬
  text-align: center;
  font-size: 25px;
  color: white;
  font-weight: bold;
`;

// 펌프 헤더
const PumpHeader = styled.div`
  background-color: #efb61f;
  height: 10vh; // 높이
  width: 90%; // 전체 너비
  padding: 5px 0px;
  margin-left: 10%;
  flex: 5%;
  display: flex;
  justify-content: center; // 가로 중앙 정렬
  align-items: center; // 세로 중앙 정렬
  text-align: center;
  font-size: 25px;

  font-weight: bold;
`;

const MotorHeader = styled.div`
  background-color: #efb61f;
  height: 10vh; // 높이
  padding: 5px 0px;
  width: 90%; // 전체 너비
  margin-left: 10%;
  flex: 5%;
  display: flex;
  margin-top: 2vh;
  justify-content: center; // 가로 중앙 정렬
  align-items: center; // 세로 중앙 정렬
  text-align: center;
  font-size: 25px;

  font-weight: bold;
`;

const BlackBox = styled.div`
  background-color: black; // 검은색 배경
  width: 90%; // 전체 너비
  height: 80%; // 높이 설정
  margin-top: 15vh; // 위로 여백
  position: relative;
  display: flex;
  margin-top: 0vh;
  flex: 50%;
  margin-left: 10%;
`;

const BlackBox2 = styled.div`
  background-color: black; // 검은색 배경
  flex-direction: column;
  width: 90%; // 전체 너비
  display: flex;
  flex: 50%;
  position: relative;
  margin-left: 10%;
  margin-bottom: 96px;
`;

// 표 스타일링
const StyledTable = styled.table`
  width: 100%;
  left: 25px; // 왼쪽 정렬
  border-collapse: collapse;
  table-layout: fixed; // 각 셀의 너비를 고정
  height: 100%;
`;

// 행 스타일링
const StyledRow = styled.tr`
  display: flex;
`;

// 첫 번째 열 셀 스타일링
const StyledFirstCell = styled.td`
  background-color: #f2f2f2;
  border: 1px solid #ddd;
  display: flex;
  align-items: center; // 수직 정렬
  justify-content: center; // 가로 정렬
  flex: 1; // flex-grow 설정으로 너비 맞춤
  text-align: center;
  white-space: pre-line; // 줄바꿈 처리
`;

// 두 번째 열 셀 스타일링
const StyledSecondCell = styled.td`
  background-color: #ffffff;
  border: 1px solid #ddd;
  display: flex;
  padding: 25px 120px 25px 0px;
  flex-direction: row;
  align-items: center; // 수직 정렬
  justify-content: right; // 가로 정렬
  flex: 1; // flex-grow 설정으로 너비 맞춤
`;

const TimeInput = styled.input`
  background-color: transparent; // 배경색을 투명하게 설정
  border: none; // 테두리를 없앰
  width: 25%;
  height: 2.5vh;
  margin-left: 80px;
  font-weight: 500;
  font-size: 16px;
  text-align: right; // 텍스트 중앙 정렬 추가
  &::placeholder {
    color: grey; // placeholder 색상 설정
  }
`;

const LeftSection = styled.div`
  width: 377px; // 전체 BlackBox의 약 절반
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const RightSection = styled.div`
  width: 378px; // 전체 BlackBox의 약 절반
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 0px;
`;

const Group = styled.div`
  margin-bottom: 1%;
  text-align: center; // 텍스트 오른쪽 정렬
  background: ${(props) => props.color}; // 그룹 타이틀바의 배경색
  color: black;
  padding: 10px 0px;
  width: 100%;
  font-weight: bold;
`;

const InputRow = styled.div`
  display: flex; // flex 레이아웃 활성화
  align-items: center; // 수직 중앙 정렬
  width: 100%; // 전체 너비 사용
  margin-top: 5px;
  margin-bottom: 10px; // 행 간 간격
`;

const StyledLabel = styled.div`
  font-size: 16px;
  color: ${(props) => props.color};
  width: 40%; // 레이블의 너비를 설정
  text-align: center; // 텍스트 오른쪽 정렬

  margin-left: 5%;
  border: 1px ${(props) => props.line || "none"} white;
`;

const StyledLabel2 = styled.div`
  font-size: 16px;
  color: ${(props) => props.color};
  width: 40%; // 레이블의 너비를 설정
  text-align: center; // 텍스트 오른쪽 정렬
  border: 1px ${(props) => props.line || "none"} white;
`;

const INVInput = styled.input`
  font-size: 16px;
  font-weight: 500;
  color: ${(props) => props.color};
  background-color: transparent;
  width: 40%; // 레이블의 너비를 설정
  text-align: center;
  margin-left: 5%;
  white-space: pre-line; // 줄바꿈 처리

  border: 1px ${(props) => props.line || "none"} white;
  padding-left: 20px; // 패딩 추가
  box-sizing: border-box; // 패딩과 테두리를 요소의 전체 너비에 포함
  &::placeholder {
    color: grey; // placeholder 색상 설정
  }
`;
const DirectionButtonsContainer = styled.div`
  display: flex;
  justify-content: space-around; // 버튼 간 간격 조정
  margin-bottom: 5px; // 상단 여백
`;
const DirectionButton = styled.button`
  background-color: white; // 형광 녹색 배경
  color: white; // 텍스트 색상
  border: none; // 테두리 없음

  font-size: 16px; // 글꼴 크기
  cursor: pointer; // 마우스 커서 변경
  position: relative; // 화살표 위치 설정을 위한 상대 위치
  width: 60px;
  height: 60px;
`;

const ModuleBox = styled.div`
  width: 100%; // 상자의 너비
  height: 100%; // 상자의 높이
  background: transparent; // 상자 배경색
  border: 1px none #aaa; // 상자 테두리
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ModuleTitle = styled.div`
  font-size: 16px;
  color: #fff;
  flex: 1;
  margin-bottom: 10px;
`;

const ModuleStatus = styled.div`
  color: #fff;
  width: 70%;
  flex: 2;
  height: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
  background: #777; // 상태 배경색
  padding: 6% 9%;
  border: 1px solid #aaa; // 상태 테두리
`;
const MoudelStatusButton = styled.button`
  color: black;
  font-weight: 800;
  width: 100%;
  height: 90%;
  background: ${(props) => props.color}; // 상태 배경색
  padding: 15% 10%;
  border: 1px solid #aaa; // 상태 테두리
  cursor: pointer; // 마우스 오버 시 커서 변경
  font-size: 18px;
`;
const ModuleContainer = styled.div`
  display: flex;
  margin-top: 10px;
  flex-direction: row; // 모듈 박스와 텍스트 박스를 수직 배치
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
`;
const ModuelTextBox = styled.div`
  background: transparent;
  flex-direction: row;
  color: red;
  text-align: right;
  margin-right: 20px;
  font-size: 18px;
  font-weight: bold;
`;

const StyledButton = styled.button`
  background: ${(props) =>
    props.isActive ? "#00ff00" : "#aaa"}; // 배경색 설정
  color: black;
  font-weight: 600;
  width: 100%;
  height: 10%;
  align-self: center;
  margin-right: 3%;
  margin-bottom: 15px;
  font-size: 19px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px #666, 0 -4px #666 inset; // 입체감을 주는 그림자

  &:hover {
    background-color: ${(props) =>
      props.isActive ? "#008000" : "#888"}; // 호버 시 배경색 변경
  }

  &:active {
    box-shadow: 0 2px #666 inset; // 클릭 시 내부 그림자로 입체감 감소
    transform: translateY(2px); // 클릭 시 약간 아래로 이동 효과
  }
`;

const ModalButton = styled.button`
  background: skyblue;
  color: black;
  font-weight: 600;
  width: 100%;
  height: 10%;
  align-self: center; // 가로 중앙 정렬
  margin-right: 3%;
  font-size: 19px;

  border: none; // 테두리 없음
  border-radius: 8px; // 모서리 둥글게 처리
  box-shadow: 0 4px #666, 0 -4px #666 inset; // 입체감을 주는 그림자
  cursor: pointer; // 포인터 커서 표시

  &:active {
    box-shadow: 0 2px #666 inset; // 클릭 시 내부 그림자로 입체감 감소
    transform: translateY(2px); // 클릭 시 약간 아래로 이동 효과
  }
`;

const Circle = styled.div`
  background-color: ${(props) => props.color};
  width: 100%;
  height: 28%;
  border-radius: 50%;
  margin-top: 40%;
`;
const CircleContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 80px;
  margin-bottom: 20px;
`;
const CircleText = styled.div`
  background-color: transparent;
  font-size: 20px;
  color: red;
  font-weight: 500;
  align-items: center;
  justify-content: center;
`;
const ArrowContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 36px;
  margin-bottom: 10px;
`;

const LampContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
