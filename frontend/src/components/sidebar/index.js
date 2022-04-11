import React, { useState } from 'react';
import { FaBox, FaStore, FaBars, FaTimes, FaShoppingBasket } from 'react-icons/fa';
import { A } from 'hookrouter';

import './index.css';

export const SidebarData = [
  {
    title: 'Pedidos',
    path: '/home',
    icon: <FaShoppingBasket />,
    cName: 'nav-text'
  },
  {
    title: 'Gerenciar Produtos',
    path: '/manage',
    icon: <FaBox />,
    cName: 'nav-text'
  },
  {
    title: 'Editar Loja',
    path: '/settings',
    icon: <FaStore />,
    cName: 'nav-text'
  },
];

const SideBar = () => {
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);

  return (
    <>
      <div className='navbar'>
        <A href='#' className='menu-bars'>
          <FaBars onClick={showSidebar} />
        </A>
      </div>
      <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
        <ul className='nav-menu-items' onClick={showSidebar}>
          <li className='navbar-toggle'>
            <A href='#' className='menu-bars'>
              <FaTimes />
            </A>
          </li>
          {SidebarData.map((item, index) => {
            return (
              <li key={index} className={item.cName}>
                <A href={item.path}>
                  {item.icon}
                  <span>{item.title}</span>
                </A>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export default SideBar;