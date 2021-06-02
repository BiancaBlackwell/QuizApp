import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import { Landing, GameStateHandler} from './Pages';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/game/:roomId" render={(props) => <GameStateHandler {...props} />} />
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
