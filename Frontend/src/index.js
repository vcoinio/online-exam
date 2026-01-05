import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import { Provider } from 'react-redux';
import { Suspense } from 'react';
import './i18n'; // Import i18n config

ReactDOM.render(
    <Suspense fallback={<div>Loading...</div>}>
        <App />
    </Suspense>,
    document.getElementById('root')
);
serviceWorker.unregister();
