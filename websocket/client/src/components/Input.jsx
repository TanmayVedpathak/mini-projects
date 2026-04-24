import React from "react";

const Input = ({ name, placeholder, value, handleInput = () => {} }) => {
  return <input className="input-field" type="text" name={name} value={value} placeholder={placeholder} onChange={handleInput} />;
};

export default Input;
