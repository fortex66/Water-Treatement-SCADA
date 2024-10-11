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
  width: 230px;
  border: 2px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 10px 20px;
  margin: 0 10px;
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

const Header = styled.h1`
  margin-top: 50px;
  font-size: 45px;
  color: #333; /* 어두운 색상으로 제목 강조 */
`;

const Company = styled.h2`
  margin-top: 5px;
  margin-bottom: 50px;
  font-size: 18px;
  color: #333;
  font-weight: 600; /* 글자 두께를 더 두껍게 */
  letter-spacing: 1.5px; /* 글자 사이의 간격을 넓혀 고급스러움 강조 */
  text-transform: uppercase; /* 모든 글자를 대문자로 변환 */
  color: #555; /* 조금 더 어두운 색상으로 변경 */
`;

const LoginPage = ({ setIsLoggedIn }) => {
  const [inputPassword, setInputPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8001/api/login", {
        password: inputPassword,
      });

      if (response.status === 200) {
        //console.log("Login successful");
        setIsLoggedIn(true);
        navigate("/drive");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        //console.log("Invalid password");
        alert("비밀번호가 일치하지 않습니다.");
      } else {
        // console.error("Login error:", error);
        alert("An error occurred");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleChangePassword = () => {
    navigate("/changepassword");
  };

  return (
    <Container>
      <Header>수처리 설비</Header>
      <Company>대구성서환경관리공단</Company>

      <Input
        type="password"
        value={inputPassword}
        onChange={(e) => setInputPassword(e.target.value)}
        placeholder="비밀번호 입력"
        onKeyDown={handleKeyDown}
      />
      <div>
        <Button onClick={handleLogin}>로그인</Button>
        <Button onClick={handleChangePassword}>비밀번호 변경</Button>
      </div>
    </Container>
  );
};

export default LoginPage;
