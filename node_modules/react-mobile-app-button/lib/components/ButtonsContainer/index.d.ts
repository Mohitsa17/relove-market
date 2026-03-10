import { FC, ReactNode } from "react";
type ButtonsContainerProps = {
    /**
     * @default ''
     */
    gap?: number;
    /**
     * @default row
     */
    direction?: "row" | "column";
    children: ReactNode;
};
/**
 *
 * @param {number} gap Add additional spacing between buttons
 * @param {string} direction Change direction of the buttons between column and row
 * @example <ButtonsContainer gap={10} direction="column"> <GooglePlayButton/> <AppGalleryButton/> </ButtonsContainer>
 * @returns
 */
declare const ButtonsContainer: FC<ButtonsContainerProps>;
export default ButtonsContainer;
