import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FaBan, FaExclamationTriangle } from "react-icons/fa";
import { userAuthorContextObj } from "../../contexts/UserAuthorContext";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import '../css/BlockedPage.css'

function BlockedPage() {
  const { currentUser } = useContext(userAuthorContextObj);
  const { user } = useUser();

  return (
    <div className="blocked-container">
      <div className="blocked-card">
        <div className="blocked-icon">
          <FaBan size={60} color="#e74c3c" />
        </div>
        <h1 className="blocked-title">Account Blocked</h1>
        
        <div className="blocked-message">
          <FaExclamationTriangle className="warning-icon" />
          <p>
            Your {currentUser?.role || "user"} account has been suspended by an administrator. 
            If you believe this is an error, please contact support.
          </p>
        </div>
        
        <div className="user-info">
          <img 
            src={user?.imageUrl || currentUser?.profileImageUrl} 
            alt="Profile" 
            className="blocked-profile-image" 
          />
          <div>
            <h3>{user?.firstName || currentUser?.firstName} {user?.lastName || currentUser?.lastName}</h3>
            <p className="blocked-email">{user?.emailAddresses?.[0]?.emailAddress || currentUser?.email}</p>
          </div>
        </div>
        
        <div className="blocked-actions">
          <Link to="/" className="blocked-link">Return to Home</Link>
          <SignOutButton className="sign-out-button">
            Sign Out
          </SignOutButton>
        </div>
        
        <div className="contact-support">
          <p>Need assistance? Contact us at:</p>
          <a href="mailto:support@draft.com" className="support-email">support@draft.com</a>
        </div>
      </div>
    </div>
  );
}

export default BlockedPage;