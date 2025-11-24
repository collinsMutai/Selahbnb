import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider
import { Provider } from 'react-redux';
import store from './redux/store'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


// Make sure to add your Google Client ID here (use .env variable or hard-code it)
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     <Provider store={store}>


    {/* Wrap your app with GoogleOAuthProvider and pass clientId */}
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
     </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
