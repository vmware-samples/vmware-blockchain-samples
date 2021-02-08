import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { ROUTES } from './constants/routes';
import LiquidityPage from './pages/LiquidityPage';
import PortfolioPage from './pages/PortfolioPage';
import SwapPage from './pages/SwapPage';


export default function Routes() {
  return (
    <Switch>
      <Route path={ROUTES.LIQUIDITY} component={LiquidityPage} />
      <Route path={ROUTES.SWAP} component={SwapPage} />
      <Route path={ROUTES.PORTFOLIO} component={PortfolioPage} />
    </Switch>
  );
}
