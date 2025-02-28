import React, { useContext, useState, useRef, useEffect } from 'react';
import { LiaDraftingCompassSolid } from "react-icons/lia";
import { IoMenu } from "react-icons/io5";
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import { userAuthorContextObj } from '../../contexts/UserAuthorContext';
import '../css/Header.css';

const Header = () => {
  const { signOut } = useClerk();
  const { currentUser, setCurrentUser } = useContext(userAuthorContextObj);
  const navigate = useNavigate();
  const { isSignedIn, user, isLoaded } = useUser();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const toggleRef = useRef(null);
  const menuRef = useRef(null);

  // Toggle navbar collapse state
  const handleNavCollapse = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          toggleRef.current && !toggleRef.current.contains(event.target)) {
        setIsNavCollapsed(true);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, toggleRef]);

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

        <div className="d-flex position-relative">
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={handleNavCollapse}
            aria-controls="navbarNav"
            aria-expanded={!isNavCollapsed}
            aria-label="Toggle navigation"
            ref={toggleRef}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Mobile dropdown menu */}
          <div 
            ref={menuRef}
            className={`mobile-menu ${isNavCollapsed ? 'collapsed' : 'expanded'}`}
          >
            <ul className="navbar-nav">
              {!isSignedIn ? (
                <>
                  <li className="nav-item">
                    <NavLink to="/signin" className="nav-link" onClick={() => setIsNavCollapsed(true)}>
                      Sign In
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/signup" className="nav-link" onClick={() => setIsNavCollapsed(true)}>
                      Sign Up
                    </NavLink>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <div className="user-info">
                      <div className="d-flex align-items-center">
                        <span className="user-role">{currentUser?.role}</span>
                        <span className="user-name ms-2">{user?.firstName}</span>
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

        {/* Desktop menu */}
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
                      <span className="user-role">{currentUser?.role}</span>
                      <span className="user-name ms-2">{user?.firstName}</span>
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