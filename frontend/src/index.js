import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'; // Import GoogleReCaptchaProvider
import { Provider } from 'react-redux';
import store from './redux/store'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';


// Make sure to add your Google Client ID and reCAPTCHA Site Key here (use .env variables or hard-code them)
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const reCaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    {/* Wrap your app with GoogleOAuthProvider and pass clientId */}
    <GoogleOAuthProvider clientId={googleClientId}>
      {/* Wrap your app with GoogleReCaptchaProvider and pass siteKey */}
      <GoogleReCaptchaProvider reCaptchaKey={reCaptchaSiteKey}>
        <App />
      </GoogleReCaptchaProvider>
    </GoogleOAuthProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
