import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { FaPen } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/SignIn.css';

const SignInPage = () => {
  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="logo-container">
            <FaPen className="logo-icon" />
          </div>
          <h1 className="welcome-title">Welcome Back</h1>
          <p className="welcome-subtitle">Continue your writing journey</p>
          <SignIn 
            appearance={{
              baseTheme: 'dark',
              variables: {
                colorPrimary: '#F67373',
                colorBackground: '#161618',
                colorInputBackground: '#1B1B1F',
                colorText: '#EBEBF5',
                colorTextSecondary: 'rgba(235, 235, 245, 0.7)',
                colorDanger: '#F56565',
                borderRadius: '12px',
              },
              elements: {
                formButtonPrimary: 'auth-button',
                card: 'auth-card',
                headerTitle: 'auth-title',
                headerSubtitle: 'auth-subtitle',
                socialButtonsBlockButton: 'social-button',
                formFieldInput: 'auth-input',
                footerActionLink: 'auth-link',
                rootBox: 'cl-rootBox'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;