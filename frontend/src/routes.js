import React from 'react';
import Home from './pages/home';
import Login from './pages/login';
import Manage from './pages/manage';
import Settings from './pages/settings';
import SignUp from './pages/signUp';

const routes = {
  '/home': () => <Home />,
  '/login': () => <Login />,
  '/sign-up': () => <SignUp />,
  '/settings': () => <Settings />,
  '/manage': () => <Manage />,
};

export default routes;