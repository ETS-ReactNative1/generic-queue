import React, { useContext } from "react";
import { navigate, A, useTitle } from 'hookrouter';
import { login } from "../../hooks/auth";
import { login as backLogin } from '../../services/AuthService';
import AuthContext from '../../hooks/auth';

import './index.css';
import PasswordField from "../../components/forms/passwordField";

export const Login = () => {
  useTitle('Login');

  const { setIsSigned } = useContext(AuthContext);

  const initialState = {
    email: "",
    password: "",
    isSubmitting: false,
    errorMessage: null
  };

  const [data, setData] = React.useState(initialState);

  const handleInputChange = event => {
    setData({
      ...data,
      [event.target.name]: event.target.value
    });
  };

  const handleFormSubmit = async event => {
    event.preventDefault();
    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null
    });
    if (data.password.trim().length === 0 || data.email.trim().length === 0) {
      setData({
        ...data,
        isSubmitting: false,
        errorMessage: "Complete todos os campos"
      });
      return;
    }
    try {
      const payload = {
        role: 'MANAGER',
        email: data.email,
        password: data.password
      };
      const res = await backLogin(payload);
      login(res.data);
      setIsSigned(true);
      navigate('/home');
    } catch (err) {
      console.log(err);
      setData({
        ...data,
        isSubmitting: false,
        errorMessage: "Email e/ou senha não conferem."
      });
    }
  };

  return (
    <div className="login-container">
      <div className="card">
        <div className="container">
          <form onSubmit={handleFormSubmit}>
            <h1>Login</h1>

            <label htmlFor="email">
              Email
              <input
                type="text"
                value={data.email}
                onChange={handleInputChange}
                name="email"
                id="email"
                placeholder="Digite seu email..."
              />
            </label>

            <label htmlFor="password">
              Senha
              <PasswordField state={data} setState={setData} />
            </label>

            {data.errorMessage && (
              <span className="form-error">{data.errorMessage}</span>
            )}
            <div className="login-btn">
              <button disabled={data.isSubmitting}>
                {data.isSubmitting ? (
                  "Carrengando..."
                ) : (
                  "Login"
                )}
              </button>
            </div>
            <hr />
            <A href='/sign-up'>Criar conta</A>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Login;