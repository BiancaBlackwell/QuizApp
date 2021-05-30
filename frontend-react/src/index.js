import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import { Landing, Lobby, Trivia, Victory} from './Pages';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/victory">
          <Victory></Victory>
        </Route>
        <Route path="/trivia">
          <Trivia></Trivia>
        </Route>
        <Route path="/lobby">
          <Lobby></Lobby>
        </Route>
        <Route path="/">
          <Landing></Landing>
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
