import React, { useContext } from 'react';
import { A } from 'hookrouter';
import { getUsername, logout, isAuthenticated } from '../../hooks/auth';
import AuthContext from '../../hooks/auth';

import './index.css';

const Header = () => {
  const { isSigned, setIsSigned } = useContext(AuthContext);

  
  return (
    <header className='header'>
      <div className='banner'>
          <h2>Generic Queue</h2>
          {isSigned || isAuthenticated() ? 
            <h4>
              Olá, {getUsername()} <A className="white-link" onClick={() => {logout(); setIsSigned(false)}} href='/login'>(Sair)</A>
            </h4>
          :
          <h4>
            <A className="white-link" href='/login'>Login</A>
          </h4>}
      </div>
    </header>
  );
};

export default Header;