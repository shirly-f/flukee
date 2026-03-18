import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import i18n from './i18n';
import './index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function OAuthWrapper({ children }) {
  const [locale, setLocale] = useState(() => (i18n.language === 'he' ? 'he' : 'en'));
  useEffect(() => {
    const handler = () => setLocale(i18n.language === 'he' ? 'he' : 'en');
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, []);
  return (
    <GoogleOAuthProvider clientId={googleClientId || 'dummy.apps.googleusercontent.com'} locale={locale}>
      {children}
    </GoogleOAuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OAuthWrapper>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </OAuthWrapper>
  </React.StrictMode>
);
