import React from 'react';
import ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';

import './index.css';

import App from './App';
//import TableComponent from './TableComponent';
import MyGridComponent from './GridComponent';

let app = new App();
window.app = app;

ReactDOM.render(
        <MyGridComponent dataSource={app.dm} dm={app.dm} updater={app.listener} />,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
