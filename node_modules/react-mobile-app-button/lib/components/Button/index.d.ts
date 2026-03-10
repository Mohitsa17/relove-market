import React, { FC } from "react";
type ButtonProps = {
    theme?: "dark" | "light";
    height?: number;
    width?: number;
    logo: () => React.JSX.Element;
    storeName: string;
    title: string;
    url: string;
    className?: string;
    border?: number;
};
declare const Button: FC<ButtonProps>;
export default Button;
