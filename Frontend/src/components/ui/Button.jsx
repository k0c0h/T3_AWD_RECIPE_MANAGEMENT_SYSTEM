import React from "react";

const Button = ({ children, className = "", onClick, type = "button", disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
