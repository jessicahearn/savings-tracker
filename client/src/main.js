import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { App } from './App';
import { apolloClient } from './apolloClient';
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(ApolloProvider, { client: apolloClient, children: _jsx(App, {}) }) }));
//# sourceMappingURL=main.js.map