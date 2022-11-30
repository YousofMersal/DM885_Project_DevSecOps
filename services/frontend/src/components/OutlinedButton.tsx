import React from "react";

interface IOutlinedButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children: React.ReactNode;
}

export const OutlinedButton: React.FC<IOutlinedButtonProps> = ({
  children,
  ...rest
}) => {
  return (
    <button type="button" {...rest} className="OutlinedButton">
      {children}
    </button>
  );
};
