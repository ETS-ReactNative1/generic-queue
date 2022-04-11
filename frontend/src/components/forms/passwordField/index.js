import React, { useState } from 'react';
import showPassImg from './../../../assets/show-password.svg';
import hidePassImg from './../../../assets/hide-password.svg';

import './index.css'

const PasswordField = ({ state, setState, fieldName }) => {
  const [showPass, setShowPass] = useState(false);
  const field = fieldName ? fieldName : "password";
  return (
    <div className="pwd-container">
      <input
        type={showPass ? "text" : "password"}
        value={state[field]}
        onChange={(e) => setState({
          ...state,
          [field]: e.target.value
        })}
        id={field}
        placeholder="Digite sua senha..."
        name={field}
      />
      <img
        alt={showPass ? "Hide password" : "Show password"}
        title={showPass ? "Hide password" : "Show password"}
        src={showPass ? hidePassImg : showPassImg}
        onClick={() => setShowPass(!showPass)}
      />
    </div>
  );
}

export default PasswordField;