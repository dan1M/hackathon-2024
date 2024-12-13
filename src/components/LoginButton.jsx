// eslint-disable-next-line no-unused-vars
import React from "react";

// eslint-disable-next-line react/prop-types
const Button = ({ onClick, children, type = "button", className = "" }) => {
  return (
    <button type={type} onClick={onClick} className={`auth-button ${className}`}>
      {children}
    </button>
  );
};

export default Button;
