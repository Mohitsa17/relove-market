import React from "react";
import styled from "styled-components";
const ButtonTextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;
/**
 *
 * @param {number} gap Add additional spacing between buttons
 * @param {string} direction Change direction of the buttons between column and row
 * @example <ButtonsContainer gap={10} direction="column"> <GooglePlayButton/> <AppGalleryButton/> </ButtonsContainer>
 * @returns
 */
const ButtonsContainer = ({
  children,
  gap,
  direction = "row"
}) => {
  return /*#__PURE__*/React.createElement(ButtonTextContainer, {
    style: {
      gap: gap,
      flexDirection: direction
    }
  }, children);
};
export default ButtonsContainer;