import { forwardRef } from "react";
import type { TouchableOpacityProps, View } from "react-native";
import { Text, TouchableOpacity } from "react-native";

import { cn } from "~/lib/utils";

type ButtonProps = {
  title: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  textClassName?: string;
} & TouchableOpacityProps;

const variantStyles = {
  default: "items-center  rounded-[28px] shadow-md p-4 bg-indigo-400",
  primary: "bg-indigo-500",
  secondary: "bg-pink-500",
  danger: "bg-red-500",
};
const variantTextStyles = {
  default: "text-white font-semibold text-center",
  primary: "text-base",
  secondary: "text-base",
  danger: "text-base",
};

const sizeStyles = {
  small: "py-2 px-3",
  medium: "py-3 px-4",
  large: "py-4 px-6",
};

const sizeTextStyles = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
};

export const Button = forwardRef<View, ButtonProps>(
  (
    { title, variant, size, textClassName, className, ...touchableProps },
    ref,
  ) => {
    return (
      <TouchableOpacity
        ref={ref}
        {...touchableProps}
        className={cn(
          variantStyles.default,
          variant && variantStyles[variant],
          size && sizeStyles[size],
          className,
        )}
        // className={`${variantStyles.default} ${variant ? variantStyles[variant] : ""} ${touchableProps.className}`}
      >
        <Text
          // className={`${variantTextStyles.default} ${variant ? variantTextStyles[variant] : ""} ${touchableProps.textClassName}`}
          className={cn(
            variantTextStyles.default,
            variant && variantTextStyles[variant],
            size && sizeTextStyles[size],
            textClassName,
          )}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  },
);
