import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { faDesktop, faDatabase } from "@fortawesome/free-solid-svg-icons";

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState(null);

  const navigateTo = (path, item) => {
    navigate(path);
    setSelected(item);
  };

  // 페이지 이동시 배경색이 한번에 안바뀜 해결
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === "/graph") setSelected("Graph");
    else if (currentPath === "/history") setSelected("History");
  }, [location]);

  return (
    <Container>
      <List
        selected={selected === "Graph"}
        onClick={() => navigateTo("/graph", "Graph")}
      >
        <StyledIcon icon={faDesktop} />
        Graph
      </List>
      <List
        selected={selected === "History"}
        onClick={() => navigateTo("/history", "History")}
      >
        <StyledIcon icon={faDatabase} />
        Database
      </List>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #38393e;
  padding-top: 20px;
`;
const List = styled.div`
  width: 150px;
  font-size: 20px;
  color: #fefefe;
  padding: 32px 20px 32px 20px;
  text-align: center;
  cursor: pointer;
  ${(props) =>
    props.selected &&
    css`
      background-color: #766c76;
    `}
`;
const StyledIcon = styled(FontAwesomeIcon)`
  margin-right: 10px; // 아이콘과 텍스트 사이 간격 조정
`;

const Visitor = styled.div`
  display: flex;
  justify-content: space-around; // 컨텐츠를 양 끝에 배치하여 공간을 균등하게 분할
  padding: 20px; // 상하좌우 패딩
  background-color: #484a4f; // 배경색
  color: #fefefe; // 텍스트 색상
  margin: 20px; // 주변 여백
  border-radius: 10px; // 테두리 둥글게
`;

// `Visitor` 컴포넌트 내부에 사용할 각 항목을 위한 스타일 컴포넌트
const VisitorItem = styled.div`
  display: flex;
  flex-direction: column; // 항목 내부 텍스트를 세로로 정렬
  align-items: center; // 센터 정렬
`;

export default SideBar;
