import React from 'react';
import ReactDOM from 'react-dom';
import { useRoutes } from 'hookrouter';
import routes from './routes';
import PageNotFound from './pages/pageNotFound';
import Header from './components/header';
import SideBar from './components/sidebar';
import { AuthProvider, isAuthenticated } from './hooks/auth';

import './index.css';

const App = () => {  
  const routeResult = useRoutes(routes);

  return (
    <AuthProvider>
        <Header />
        {isAuthenticated() && <SideBar />}
        <div className="main-container">
          {routeResult || <PageNotFound />}
        </div>
    </AuthProvider>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);