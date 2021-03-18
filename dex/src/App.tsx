import { ClarityIcons, walletIcon, routerIcon, resourcePoolIcon } from '@clr/core/icon';
import { CdsIcon } from '@clr/react/icon';
import React from 'react';
import Routes from './Routes';
import { ROUTES } from './constants/routes';
import { Web3Provider } from '@ethersproject/providers';

import './App.css';

import {
  BrowserRouter as Router, NavLink,
} from "react-router-dom";
import { Wallet } from './components/Wallet';
import { Web3ReactProvider } from '@web3-react/core';
import Web3ReactManager from './components/Web3ReactManager';

ClarityIcons.addIcons(routerIcon);
ClarityIcons.addIcons(walletIcon);
ClarityIcons.addIcons(resourcePoolIcon);

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 15000
  return library
}

function App() {

  return (
    <Web3ReactProvider getLibrary={getLibrary}>

    <Router>

    <main className="main-container" cds-text="body">
      <div className="content-container">
        <div className="content-area">
          <Web3ReactManager>
            <Routes />
          </Web3ReactManager>
        </div>
        <div className="clr-vertical-nav has-icons">
          <div className="logo">
            DEX
          </div>
          <Wallet className="wallet" />

          <div className="nav-content">
            <NavLink to={ROUTES.PORTFOLIO} activeClassName='active' className={"nav-link"}><CdsIcon className="nav-icon" size="lg" shape="wallet" /> Portfolio</NavLink>
            <NavLink to={ROUTES.SWAP} activeClassName='active' className={"nav-link"}><CdsIcon className="nav-icon" size="lg" shape="router" /> Swap</NavLink>
            <NavLink to={ROUTES.LIQUIDITY} activeClassName='active' className={"nav-link"}><CdsIcon className="nav-icon" size="lg" shape="resource-pool" /> Liquidity</NavLink>
          </div>
        </div>
      </div>
    </main>
    </Router>
    </Web3ReactProvider>

  );
}

export default App;
