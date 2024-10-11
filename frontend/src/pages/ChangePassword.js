import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0; /* 공정도를 연상시키는 밝은 배경색 */
`;

const Input = styled.input`
  display: block;
  margin-bottom: 20px;
  padding: 10px;
  width: 200px;
  border: 2px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 10px 20px;
  margin-top: 10px;
  border: none;
  border-radius: 4px;
  background-color: #0056b3; /* 공정도를 연상시키는 파란색 */
  color: #fff;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #004494;
  }
`;

const Title = styled.h2`
  margin-top: 100px;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333; /* 어두운 색상으로 제목 강조 */
`;

const Message = styled.p`
  color: ${(props) => (props.match ? "green" : "red")};
`;

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        setMessage("비밀번호 불일치");
        return;
      }

      const response = await axios.post(
        "http://localhost:8001/api/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      if (response.status === 200) {
        //console.log("Password changed successfully");
        alert("비밀번호가 변경되었습니다.");
        navigate("/login");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        //console.log("Current password is incorrect");
        alert("현재 비밀번호 불일치");
      } else {
        // console.error("Change password error:", error);
        alert("An error occurred");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleChangePassword();
    }
  };

  return (
    <Container>
      <Title>비밀번호 변경</Title>
      <Input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="현재 비밀번호"
        onKeyDown={handleKeyDown}
      />
      <Input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="새 비밀번호"
        onKeyDown={handleKeyDown}
      />
      <Input
        type="password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          setMessage(
            e.target.value !== newPassword ? "비밀번호 불일치" : "비밀번호 일치"
          );
        }}
        placeholder="새 비밀번호 확인"
        onKeyDown={handleKeyDown}
      />
      <Message match={confirmPassword === newPassword}>{message}</Message>
      <Button onClick={handleChangePassword}>비밀번호 변경</Button>
    </Container>
  );
};

export default ChangePassword;
