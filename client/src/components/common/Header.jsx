import React, { useContext } from 'react';
import { LiaDraftingCompassSolid } from "react-icons/lia";
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import { userAuthorContextObj } from '../../contexts/UserAuthorContext';
import '../css/Header.css';

const Header = () => {
  const { signOut } = useClerk();
  const { currentUser, setCurrentUser } = useContext(userAuthorContextObj);
  const navigate = useNavigate();
  const { isSignedIn, user, isLoaded } = useUser();

  const handleSignOut = async () => {
    console.log("signout called");
    try {
      await signOut();
      setCurrentUser(null);
      localStorage.clear();
      navigate('/');
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-nav">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <LiaDraftingCompassSolid className="nav-logo me-2" />
          <span className="brand-text">Draft</span>
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            {!isSignedIn ? (
              <>
                <li className="nav-item">
                  <NavLink to="/signin" className="nav-link">
                    Sign In
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/signup" className="nav-link">
                    Sign Up
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item me-3">
                  <div className="user-info">
                    <div className="d-flex align-items-center">
                      <span className="user-role">{currentUser.role}</span>
                      <span className="user-name ms-2">{user.firstName}</span>
                    </div>
                  </div>
                </li>
                <li className="nav-item">
                  <button onClick={handleSignOut} className="sign-out-btn">
                    Sign Out
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;