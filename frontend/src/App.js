/* eslint-disable */
import React, { useState, useEffect, createContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Modal from "react-modal";
import io from "socket.io-client";
import Drive from "./pages/Drive";
import Settings from "./pages/Settings";
import Monitor from "./pages/Monitor";
import Alarm from "./pages/Alarm";
import Logging from "./pages/Logging";
import Input from "./pages/Input";
import Output from "./pages/Output";
import M100 from "./pages/M100";
import M200 from "./pages/M200";
import M300 from "./pages/M300";
import Graph from "./pages/Graph";
import History from "./pages/History";
import LoginPage from "./pages/LoginPage";
import ChangePassword from "./pages/ChangePassword";
import Developer from "./pages/Developer";
import { StatusProvider } from "./contexts/StatusContext"; // StatusContext 임포트

Modal.setAppElement("#root");
const socket = io("http://localhost:8001"); // 서버 IP 주소

export const SocketContext = createContext();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    socket.on("connect", () => {
      //console.log("Connected to Socket.IO server");
    });

    socket.on("disconnect", () => {
      //console.log("Socket.IO disconnected, attempting to reconnect...");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  return (
    <SocketContext.Provider value={socket}>
      <Router>
        <StatusProvider>
          <div className="app">
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route
                path="/drive"
                element={isLoggedIn ? <Drive /> : <Navigate to="/login" />}
              />
              <Route
                path="/settings"
                element={isLoggedIn ? <Settings /> : <Navigate to="/login" />}
              />
              <Route
                path="/monitor"
                element={isLoggedIn ? <Monitor /> : <Navigate to="/login" />}
              />
              <Route
                path="/alarm"
                element={isLoggedIn ? <Alarm /> : <Navigate to="/login" />}
              />
              <Route
                path="/logging"
                element={isLoggedIn ? <Logging /> : <Navigate to="/login" />}
              />
              <Route
                path="/input"
                element={isLoggedIn ? <Input /> : <Navigate to="/login" />}
              />
              <Route
                path="/output"
                element={isLoggedIn ? <Output /> : <Navigate to="/login" />}
              />
              <Route
                path="/m100"
                element={isLoggedIn ? <M100 /> : <Navigate to="/login" />}
              />
              <Route
                path="/m200"
                element={isLoggedIn ? <M200 /> : <Navigate to="/login" />}
              />
              <Route
                path="/m300"
                element={isLoggedIn ? <M300 /> : <Navigate to="/login" />}
              />
              <Route
                path="/graph"
                element={isLoggedIn ? <Graph /> : <Navigate to="/login" />}
              />
              <Route
                path="/history"
                element={isLoggedIn ? <History /> : <Navigate to="/login" />}
              />
              <Route
                path="/developer"
                element={isLoggedIn ? <Developer /> : <Navigate to="/login" />}
              />
              <Route
                path="/login"
                element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
              />
              <Route path="/changepassword" element={<ChangePassword />} />
            </Routes>
          </div>
        </StatusProvider>
      </Router>
    </SocketContext.Provider>
  );
};

export default App;
