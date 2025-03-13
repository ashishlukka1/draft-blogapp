import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { FaPen } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/SignIn.css';

const SignUpPage = () => {
  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="logo-container">
            <FaPen className="logo-icon" />
          </div>
          <h1 className="welcome-title">Get Started</h1>
          <p className="welcome-subtitle">Begin your writing journey</p>
          <div className="custom-card-container">
            <SignUp 
              appearance={{
                baseTheme: 'dark',
                variables: {
                  colorPrimary: '#F67373',
                  colorBackground: '#161618',
                  colorInputBackground: '#1B1B1F',
                  colorText: '#EBEBF5',
                  colorTextSecondary: 'rgba(235, 235, 245, 0.7)',
                  colorDanger: '#F56565',
                  borderRadius: '8px',
                },
                elements: {
                  formButtonPrimary: 'auth-button',
                  card: 'auth-card',
                  headerTitle: 'auth-title',
                  headerSubtitle: 'auth-subtitle',
                  socialButtonsBlockButton: 'social-button',
                  formFieldInput: 'auth-input',
                  footerActionLink: 'auth-link',
                  rootBox: 'cl-rootBox',
                  footer: 'hidden-footer'
                }
              }}
            />
            <div className="custom-footer">
              <p>Already have an account? <Link to="/signin" className="custom-link">Sign in</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;