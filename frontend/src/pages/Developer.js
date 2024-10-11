import React, { useState } from "react";
import axios from "axios";

const Developer = () => {
  const [username, setUsername] = useState("");
  const [username2, setUsername2] = useState("");
  const [password, setPassword] = useState("");
  const [alarmMessage, setAlarmMessage] = useState("");
  const [address, setAddress] = useState("");
  const [interval, setInterval] = useState("");
  const [intervalValue, setIntervalValue] = useState("");
  const [host, setHost] = useState("");

  const addUser = async () => {
    try {
      const response = await axios.post("http://localhost:8001/api/adduser", {
        username: username,
        password: password,
      });
      console.log(response);
      alert(response.data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const findPassword = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8001/api/findpassword",
        {
          username: username2,
        }
      );
      console.log(response);
      alert(`Password: ${response.data.password}`);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const addAlarm = async () => {
    try {
      const response = await axios.post("http://localhost:8001/api/addalarm", {
        alarmMessage: alarmMessage,
        address: address,
      });
      console.log(response);
      alert(response.data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const changeInterval = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8001/api/intervalchange",
        {
          interval: interval,
          value: intervalValue,
        }
      );
      console.log(response);
      alert(response.data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const changePlcAddress = async () => {
    try {
      const response = await axios.put(
        "http://localhost:8001/api/plcaddresschange",
        { host: host }
      );
      console.log(response);
      alert(response.data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div>
      <h2>Admin Settings</h2>

      <div>
        <h3>1. Add User</h3>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={addUser}>Add User</button>
      </div>

      <div>
        <h3>2. Find Password</h3>
        <input
          type="text"
          placeholder="Username"
          value={username2}
          onChange={(e) => setUsername2(e.target.value)}
        />
        <button onClick={findPassword}>Find Password</button>
      </div>

      <div>
        <h3>3. Add Alarm</h3>
        <input
          type="text"
          placeholder="Alarm Message"
          value={alarmMessage}
          onChange={(e) => setAlarmMessage(e.target.value)}
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button onClick={addAlarm}>Add Alarm</button>
      </div>

      <div>
        <h3>4. Change Interval</h3>
        <input
          type="text"
          placeholder="ex) alarm, page, modal"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        />
        <input
          type="number"
          placeholder="Value"
          value={intervalValue}
          onChange={(e) => setIntervalValue(e.target.value)}
        />
        <button onClick={changeInterval}>Change Interval</button>
      </div>

      <div>
        <h3>5. Change PLC IP Adrress</h3>
        <input
          type="text"
          placeholder="Host"
          value={host}
          onChange={(e) => setHost(e.target.value)}
        />
        <button onClick={changePlcAddress}>Change PLC IP Address</button>
      </div>
    </div>
  );
};

export default Developer;
