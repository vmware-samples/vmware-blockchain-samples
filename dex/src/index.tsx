import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// import 'normalize.css/normalize.css'; // css reset
// import '@cds/core/global.min.css'; // clarity global styles
// import '@cds/core/styles/module.shims.min.css'; // non-evergreen browser shims
// import '@cds/city/css/bundles/default.min.css'; // load base font

ReactDOM.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
