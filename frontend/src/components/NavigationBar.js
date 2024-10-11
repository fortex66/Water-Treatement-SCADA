import React from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faCog,
  faDesktop,
  faBell,
  faFile,
} from "@fortawesome/free-solid-svg-icons";

const NavigationContainer = styled.nav`
  border-top: 2px solid;
  display: flex;
  justify-content: space-between;
  background-color: #787878;
  width: 100%;
  height: 48px;
  position: fixed;
  bottom: 0;
  z-index: 1000; /* Ensure the navigation bar is above other elements */
`;

const NavButton = styled(NavLink)`
  flex: 1; /* Ensure buttons take equal space */

  padding: 10px 20px;
  background-color: #555;
  color: white;
  border: 1px solid #777;
  text-align: center;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #666;
  }

  &.active {
    background-color: #888;
  }

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }
`;

const NavButtonText = styled.span`
  font-size: 20px;
  margin-left: 20px; /* Add space between icon and text */
  user-select: none;
`;

function NavigationBar() {
  return (
    <NavigationContainer>
      <NavButton to="/drive">
        <FontAwesomeIcon icon={faPlay} size="2x" />
        <NavButtonText>운전화면</NavButtonText>
      </NavButton>
      <NavButton to="/settings">
        <FontAwesomeIcon icon={faCog} size="2x" />
        <NavButtonText>설정화면</NavButtonText>
      </NavButton>
      <NavButton to="/monitor">
        <FontAwesomeIcon icon={faDesktop} size="2x" />
        <NavButtonText>모니터화면</NavButtonText>
      </NavButton>
      <NavButton to="/alarm">
        <FontAwesomeIcon icon={faBell} size="2x" />
        <NavButtonText>알람화면</NavButtonText>
      </NavButton>
      <NavButton to="/logging">
        <FontAwesomeIcon icon={faFile} size="2x" />
        <NavButtonText>LOGGING</NavButtonText>
      </NavButton>
    </NavigationContainer>
  );
}

export default NavigationBar;
