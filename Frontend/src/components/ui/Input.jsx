import React from 'react';

const Input = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none transition ${className}`}
      style={{ borderColor: "#e5dfd8", ...props.style }}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;
