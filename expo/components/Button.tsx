import type { TouchableOpacityProps, View } from "react-native";
import { forwardRef } from "react";
import { Text, TouchableOpacity } from "react-native";

type ButtonProps = {
  title: string;
  variant?: "primary" | "secondary" | "danger";
  // size?: "small" | "medium" | "large";
  textClassName?: string;
} & TouchableOpacityProps;

const variantStyles = {
  default: "items-center  rounded-[28px] shadow-md p-4",
  primary: "bg-indigo-500",
  secondary: "bg-pink-500",
  danger: "bg-red-500",
};
const variantTextStyles = {
  default: "text-white font-semibold text-center",
  primary: "text-lg",
  secondary: "text-base",
  danger: "text-base",
};

export const Button = forwardRef<View, ButtonProps>(
  ({ title, variant, ...touchableProps }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        {...touchableProps}
        className={`${variantStyles.default} ${variant ? variantStyles[variant] : ""} ${touchableProps.className}`}
      >
        <Text
          className={`${variantTextStyles.default} ${variant ? variantTextStyles[variant] : ""} ${touchableProps.textClassName}`}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  },
);
