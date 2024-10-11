/* eslint-disable */
import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../App";
import DriveDiagram from "./DriveDiagram";
import Modal from "react-modal";
import Modal2 from "./Modal2";
import Modal3 from "./Modal3";
import Modal4 from "./Modal4";
import warningImage1 from "../assets/warning1.png";
import warningImage2 from "../assets/warning2.png";
import warningImage3 from "../assets/warning3.png";
import warningImage4 from "../assets/warning4.png";
import warningImage5 from "../assets/warning5.png";

const DiagramEvents = ({ data }) => {
  const svgRef = useRef(null);
  const socket = useContext(SocketContext);
  const [isAuto, setIsAuto] = useState(false);
  const [modals, setModals] = useState([]);
  const [tankLevels, setTankLevels] = useState([]);
  const [operationTexts, setOperationTexts] = useState([]);
  const [isFanRunning, setIsFanRunning] = useState(false);
  const [modalData, setModalData] = useState({});
  const [alertSettings, setAlertSettings] = useState([]);

  const defaultFillColors = {
    lamp1: "url(#Diagram_svg__p)",
    lamp2: "url(#Diagram_svg__s)",
    lamp3: "url(#Diagram_svg__v)",
    lamp4: "url(#Diagram_svg__y)",
    lamp5: "url(#Diagram_svg__B)",
    lamp6: "url(#Diagram_svg__E)",
    lamp7: "url(#Diagram_svg__H)",
    lamp8: "url(#Diagram_svg__K)",
    lamp9: "url(#Diagram_svg__af)",
    lamp10: "url(#Diagram_svg__ac)",
    lamp11: "url(#Diagram_svg__W)",
    lamp12: "url(#Diagram_svg__Z)",
    lamp13: "url(#Diagram_svg__N)",
    lamp14: "url(#Diagram_svg__Q)",
    lamp15: "#D9D9D9",
    lamp17: "url(#Diagram_svg__T)",
    lamp18: "url(#Diagram_svg__ap)",
    lamp19: "url(#Diagram_svg__aq)",
    lamp20: "url(#Diagram_svg__ar)",
    lamp21: "url(#Diagram_svg__am)",
    lamp22: "url(#Diagram_svg__an)",
    lamp23: "url(#Diagram_svg__ao)",
    lamp24: "url(#Diagram_svg__as)",
    lamp25: "#d3d3d3",
    lamp26: "#d3d3d3",
    lamp27: "#d3d3d3",
    lamp28: "#d3d3d3",
  };

  const trueColors = {
    lamp1: "green",
    lamp2: "green",
    lamp3: "green",
    lamp4: "green",
    lamp5: "green",
    lamp6: "green",
    lamp7: "green",
    lamp8: "green",
    lamp9: "green",
    lamp10: "green",
    lamp11: "green",
    lamp12: "green",
    lamp13: "green",
    lamp14: "green",

    lamp15: "red",
    lamp17: "green",
    lamp18: "red",
    lamp19: "red",
    lamp20: "red",
    lamp21: "red",
    lamp22: "red",
    lamp23: "red",
    lamp24: "red",
    lamp25: "green",
    lamp26: "red",
    lamp27: "orange",
    lamp28: "green",
  };

  useEffect(() => {
    if (data.drive_M_part) {
      const newAlerts = [];

      for (let i = 0; i < 28; i++) {
        const id = `lamp${i + 1}`;
        const element = document.getElementById(id);
        if (element) {
          const defaultColor = defaultFillColors[id] || "url(#Diagram_svg__p)";
          const trueColor = trueColors[id] || "green";
          element.setAttribute(
            "fill",
            data.drive_M_part[i] ? trueColor : defaultColor
          );
        }
      }

      const newLampId = "lamp29"; // 새로운 램프의 id, HTML(SVG)에 해당 id가 설정되어 있어야 함
      const newElement = document.getElementById(newLampId);
      if (newElement) {
        const defaultColor =
          defaultFillColors[newLampId] || "url(#Diagram_svg__l)";
        const trueColor = trueColors[newLampId] || "#00e2e8";
        newElement.setAttribute(
          "fill",
          data.drive_M_part[76] ? trueColor : defaultColor // 77번째 데이터는 인덱스 76에 위치
        );
      }

      // 팬 애니메이션 상태 설정

      setIsFanRunning(data.drive_M_part[14]);

      // 자동 모드 상태 설정
      setIsAuto(data.drive_M_part[75]);

      // 수조 레벨 처리
      const tankCoordinates = [
        { x: 185, y: 657, width: 73, height: 14, text: "LL" },
        { x: 185, y: 643, width: 73, height: 28, text: "L" },
        { x: 185, y: 629, width: 73, height: 42, text: "H" },
        { x: 185, y: 615, width: 73, height: 56, text: "HH" },
        { x: 415, y: 642, width: 341, height: 50, text: "LL" },
        { x: 415, y: 592, width: 341, height: 100, text: "L" },
        { x: 415, y: 542, width: 341, height: 150, text: "H" },
        { x: 415, y: 492, width: 341, height: 200, text: "HH" },
        { x: 1260, y: 351, width: 150, height: 28, text: "LL" },
        { x: 1260, y: 323, width: 150, height: 56, text: "L" },
        { x: 1260, y: 295, width: 150, height: 84, text: "H" },
        { x: 1260, y: 267, width: 150, height: 112, text: "HH" },
        { x: 1249, y: 640, width: 151, height: 25, text: "LL" },
        { x: 1249, y: 615, width: 151, height: 49, text: "L" },
        { x: 1249, y: 591, width: 151, height: 73, text: "H" },
        { x: 1249, y: 567, width: 151, height: 97, text: "HH" },
      ];
      const newTankLevels = [];
      for (let i = 28; i < 44; i++) {
        if (data.drive_M_part[i]) {
          newTankLevels.push({ level: i % 4, ...tankCoordinates[i - 28] });
        }
      }
      setTankLevels(newTankLevels);

      if (data.drive_M_part[77]) {
        newAlerts.push({
          image: warningImage1,
          position: { top: "40%", left: "10%" }, // 유입수조 LL 경고창 위치
        });
      }
      if (data.drive_M_part[31]) {
        newAlerts.push({
          image: warningImage2,
          position: { top: "40%", left: "10%" }, // 유입수조 HH 경고창 위치
        });
      }
      if (data.drive_M_part[78]) {
        newAlerts.push({
          image: warningImage3,
          position: { top: "55%", left: "29%" }, // 흡착수조 LL 경고창 위치
        });
      }
      if (data.drive_M_part[35]) {
        newAlerts.push({
          image: warningImage4,
          position: { top: "55%", left: "29%" }, // 흡착수조 HH 경고창 위치
        });
      }
      if (data.drive_M_part[36]) {
        newAlerts.push({
          image: warningImage5,
          position: { top: "20%", left: "55%" }, // 처리수조 L 경고창 위치
        });
      }

      setAlertSettings(newAlerts);

      // 작동 문구 처리
      const operationCoordinates = [
        {
          x: 220,
          y: 480,
          text: "펌프 [A] 가동중",
          color: "blue",
          fontSize: 20,
        },
        {
          x: 220,
          y: 480,
          text: "펌프 [B] 가동중",
          color: "blue",
          fontSize: 20,
        },
        { x: 780, y: 258, text: "OPEN", color: "red", fontSize: 14 },
        { x: 780, y: 258, text: "CLOSE", color: "red", fontSize: 14 },
        { x: 853, y: 323, text: "OPEN", color: "red", fontSize: 14 },
        { x: 853, y: 323, text: "CLOSE", color: "red", fontSize: 14 },
        { x: 780, y: 415, text: "OPEN", color: "red", fontSize: 14 },
        { x: 780, y: 415, text: "CLOSE", color: "red", fontSize: 14 },
        { x: 575, y: 161, text: "OPEN", color: "red", fontSize: 14 },
        { x: 575, y: 161, text: "CLOSE", color: "red", fontSize: 14 },
        { x: 670, y: 161, text: "OPEN", color: "red", fontSize: 14 },
        { x: 670, y: 161, text: "CLOSE", color: "red", fontSize: 14 },
        { x: 765, y: 161, text: "OPEN", color: "red", fontSize: 14 },
        { x: 765, y: 161, text: "CLOSE", color: "red", fontSize: 14 },
        {
          x: 300,
          y: 60,
          text: "브로워 [A] 가동중",
          color: "blue",
          fontSize: 20,
        },
        {
          x: 300,
          y: 60,
          text: "브로워 [B] 가동중",
          color: "blue",
          fontSize: 20,
        },
        {
          x: 225,
          y: 440,
          text: "브로워 [A] 가동중",
          color: "blue",
          fontSize: 20,
        },
        {
          x: 225,
          y: 440,
          text: "브로워 [B] 가동중",
          color: "blue",
          fontSize: 20,
        },
        {
          x: 1150,
          y: 240,
          text: "펌프 [A] 가동중",
          color: "blue",
          fontSize: 20,
        },
        {
          x: 1150,
          y: 240,
          text: "펌프 [B] 가동중",
          color: "blue",
          fontSize: 20,
        },
        {
          x: 1550,
          y: 450,
          text: "펌프 [A] 가동중",
          color: "blue",
          fontSize: 20,
        },
        {
          x: 1550,
          y: 450,
          text: "펌프 [B] 가동중",
          color: "blue",
          fontSize: 20,
        },
        { x: 1100, y: 120, text: "펌프 가동중", color: "blue", fontSize: 20 },
        { x: 1800, y: 327, text: "OPEN", color: "red", fontSize: 14 },
        { x: 1800, y: 327, text: "CLOSE", color: "red", fontSize: 14 },
        {
          x: 1100,
          y: 770,
          text: "펌프 [A] 가동중",
          color: "blue",
          fontSize: 20,
        },
        {
          x: 1100,
          y: 770,
          text: "펌프 [B] 가동중",
          color: "blue",
          fontSize: 20,
        },
        {
          x: 1150,
          y: 400,
          text: "펌프 [A] 가동중",
          color: "blue",
          fontSize: 20,
        },
        {
          x: 1150,
          y: 400,
          text: "펌프 [B] 가동중",
          color: "blue",
          fontSize: 20,
        },
        { x: 1500, y: 500, text: "교반기 가동중", color: "blue", fontSize: 20 },
        {
          x: 1550,
          y: 570,
          text: "알람리셋 요구중!!",
          color: "red",
          fontSize: 24,
        },
      ];
      const newOperationTexts = [];
      for (let i = 44; i < 75; i++) {
        if (data.drive_M_part[i]) {
          newOperationTexts.push({
            text: `Operation ${i - 43}`,
            ...operationCoordinates[i - 44],
          });
        }
      }
      setOperationTexts(newOperationTexts);
    }
  }, [data]);

  const handleClick = (event) => {
    const targetId = event.target.id;
    // console.log(`Element clicked with id: ${targetId}`); // 클릭된 요소의 id 로그 출력
    if (targetId) {
      if (targetId === "lamp15") {
        socket.emit("writeCoil", {
          coil: "8024",
          newValue: true,
          page: "drive",
        });
      } else if (targetId === "buzzer1") {
        socket.emit("writeCoil", {
          coil: "8081",
          newValue: true,
          page: "drive",
        });
      } else if (targetId === "lamp25") {
        socket.emit("writeCoil", {
          coil: "8070",
          newValue: true,
          page: "drive",
        });
      } else if (targetId === "lamp26") {
        socket.emit("writeCoil", {
          coil: "8071",
          newValue: true,
          page: "drive",
        });
      } else if (targetId === "lamp27") {
        socket.emit("writeCoil", {
          coil: "8072",
          newValue: true,
          page: "drive",
        });
      } else if (targetId === "lamp28") {
        socket.emit("writeCoil", {
          coil: "8073",
          newValue: true,
          page: "drive",
        });
      } else if (targetId.startsWith("path")) {
        const coilId = targetId.replace("path", "");
        socket.emit("writeCoil", {
          coil: coilId,
          newValue: true,
          page: "drive",
        }); // 서버로 true 값 전송
      } else if (targetId.startsWith("rect")) {
        const rectNumber = targetId.replace("rect", "");

        const modalPositions = {
          // rect1: { top: "73%", left: "15%" },
          rect1: { top: "43%", left: "70%" },
          rect2: { top: "63%", left: "68%" },
          rect3: { top: "38%", left: "83%" },
          // 원하는 대로 위치 추가
        };

        const modalComponents = {
          // rect1: <Modal1 onClose={() => closeModal(rectNumber)} />,
          rect1: (
            <Modal2 onClose={() => closeModal(rectNumber)} modalId="modal2" />
          ),
          rect2: (
            <Modal3 onClose={() => closeModal(rectNumber)} modalId="modal3" />
          ),
          rect3: (
            <Modal4 onClose={() => closeModal(rectNumber)} modalId="modal4" />
          ),
          // 원하는 대로 컴포넌트 추가
        };

        const { top, left } = modalPositions[targetId] || {
          top: "50%",
          left: "50%",
        };
        const content = modalComponents[targetId] || "Default content";

        setModals((prevModals) => {
          // 중복된 모달이 있는지 확인
          if (prevModals.some((modal) => modal.id === rectNumber)) {
            return prevModals;
          }
          let modalId;
          switch (rectNumber) {
            case "1":
              modalId = "modal2";
              break;
            case "2":
              modalId = "modal3";
              break;
            case "3":
              modalId = "modal4";
              break;
            default:
              return prevModals; // rectNumber가 예상치 못한 값일 경우 아무것도 하지 않음
          }

          socket.emit("openModal", modalId); // 서버로 openModal 이벤트 전송
          return [
            ...prevModals,
            {
              id: rectNumber,
              title: `Modal Title ${rectNumber}`,
              content,
              top,
              left,
            },
          ];
        });
      }
    }
  };
  useEffect(() => {
    const svg = svgRef.current;

    if (!svg) {
      console.error("SVG reference is null.");
      return;
    }

    svg.addEventListener("click", handleClick);

    return () => {
      svg.removeEventListener("click", handleClick);
    };
  }, [socket]);

  const handleToggle = () => {
    socket.emit("writeCoil", {
      coil: "8060",
      newValue: true,
      page: "drive",
    });
  };

  const closeModal = (id) => {
    // rectNumber와 modalId의 매핑 정의
    const modalIdMapping = {
      1: "modal2",
      2: "modal3",
      3: "modal4",
    };

    const modalId = modalIdMapping[id];

    setModals((prevModals) => {
      console.log(modalId);
      if (modalId) {
        socket.emit("closeModal", modalId); // 서버로 closeModal 이벤트 전송
      }
      return prevModals.filter((modal) => modal.id !== id);
    });
  };

  useEffect(() => {
    socket.on("modalData", ({ modalId, data }) => {
      setModalData((prevData) => ({
        ...prevData,
        [modalId]: data,
      }));
    });

    return () => {
      socket.off("modalData");
    };
  }, [socket]);

  return (
    <>
      <DriveDiagram
        ref={svgRef}
        onClick={handleClick}
        onToggle={handleToggle}
        isAuto={isAuto}
        data={data}
        tankLevels={tankLevels}
        operationTexts={operationTexts}
        isFanRunning={isFanRunning}
      />
      {modals.map((modal, index) => (
        <Modal
          key={modal.id}
          isOpen={true}
          onRequestClose={() => closeModal(modal.id)}
          contentLabel={`Modal ${modal.id}`}
          shouldCloseOnOverlayClick={false}
          style={{
            content: {
              position: "absolute",
              top: modal.top,
              left: modal.left,
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              padding: "4px 4px 0px 4px",
              overflow: "hidden",
              zIndex: 1000 + index,
              pointerEvents: "auto",
            },
            overlay: {
              backgroundColor: "transparent",
              zIndex: 999,
              pointerEvents: "none",
            },
          }}
        >
          {modal.content}
        </Modal>
      ))}
      {alertSettings.map((alert, index) => (
        <img
          key={index}
          src={alert.image}
          alt={`경고창 ${index + 1}`}
          style={{
            position: "absolute",
            top: alert.position.top,
            left: alert.position.left,
            zIndex: 2000,
            userSelect: "none",
          }}
        />
      ))}
    </>
  );
};

export default DiagramEvents;
