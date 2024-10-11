/* eslint-disable */
import React, { createContext, useEffect, useState, useContext } from "react";

import { SocketContext } from "../App";
import { useNavigate, useLocation } from "react-router-dom";

export const StatusContext = createContext();

export const StatusProvider = ({ children }) => {
  const [status, setStatus] = useState(false);
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleData = (receivedData) => {
      if (receivedData && receivedData.length === 0) {
        // 빈 배열이 수신되면 상태 업데이트를 방지
        return;
      } else if (receivedData && receivedData.length > 0) {
        setStatus(receivedData);

        if (
          receivedData[0] &&
          !["/login", "/changepassword"].includes(location.pathname)
        ) {
          navigate("/alarm");
        }
      }
    };
    socket.on("driveMode", handleData);
    socket.on("plcDie", (value) => {
      if (value) {
        alert("PLC 점검 필요!");
      }
    });
    socket.on("modbusError",(value)=>{
      if(value){
        alert("modbus Error!")
      }
    })

    return () => {
      socket.off("driveMode", handleData);
    };
  }, [location.pathname]);

  return (
    <StatusContext.Provider value={{ status }}>
      {children}
    </StatusContext.Provider>
  );
};
