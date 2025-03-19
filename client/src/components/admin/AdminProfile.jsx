import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { userAuthorContextObj } from "../../contexts/UserAuthorContext";
import './AdminProfile.css';

function AdminProfile() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { email } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(userAuthorContextObj);
  const API_BASE_URL = "https://draft-blogapp-backend2.vercel.app";

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!currentUser) {
      console.log("No user found in context, redirecting to home");
      navigate("/");
      return;
    }

    if (currentUser.role !== "admin") {
      console.log("User is not an admin, redirecting to home");
      navigate("/");
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      
      try {
        // Log cookies for debugging
        console.log("Cookies before request:", document.cookie);
        
        const response = await axios.get(`${API_BASE_URL}/admin-api/users-authors`, {
          withCredentials: true,
          // Include timeout to prevent hanging requests
          timeout: 10000
        });
        
        console.log("API response:", response);
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error details:", err);
        
        // Enhanced error logging
        if (err.response) {
          // The request was made and the server responded with a status code
          console.error("Server response error:", {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers
          });
          
          if (err.response.status === 401) {
            console.log("Authentication failed, redirecting to login");
            // Clear any potentially invalid auth tokens/cookies
            // This depends on how you're storing auth (localStorage, cookies, etc.)
            // localStorage.removeItem('authToken');
            navigate("/login");
          }
        } else if (err.request) {
          // The request was made but no response was received
          console.error("No response received:", err.request);
          setError("Server did not respond. Please check your connection and try again.");
        } else {
          // Something else caused the error
          console.error("Request setup error:", err.message);
          setError(`Request failed: ${err.message}`);
        }
        
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, navigate]);

  const updateStatus = async (email, isActive) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin-api/update-status/${email}`, 
        { isActive },
        { withCredentials: true }
      );
      
      console.log("Status update response:", response.data);
      
      // Update the local state with the updated user
      setUsers(users.map(user => 
        user.email === email ? response.data.user : user
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      
      const errorMessage = error.response?.data?.message || error.message;
      setError(`Failed to update user status: ${errorMessage}`);
      
      // Check if the error is due to authentication issues
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    
    axios.get(`${API_BASE_URL}/admin-api/users-authors`, {
      withCredentials: true
    })
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Retry failed:", err);
        setError("Failed to fetch users: " + (err.response?.data?.message || err.message));
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-content">
          <svg className="admin-loading-spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="32" />
          </svg>
          <p className="admin-loading-text">Loading users...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            {currentUser && <p className="admin-subtitle">Logged in as: {currentUser.email}</p>}
          </div>
          <div className="admin-badge">
            <svg className="admin-badge-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Admin Panel</span>
          </div>
        </div>
        
        {error && (
          <div className="admin-error">
            <svg className="admin-error-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="admin-error-message">{error}</p>
            <button className="admin-retry-button" onClick={retryFetch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v6h6"></path>
                <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
                <path d="M21 22v-6h-6"></path>
                <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
              </svg>
              Retry
            </button>
          </div>
        )}
        
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.length > 0 ? (
                users.map(user => (
                  <tr key={user._id || user.email}>
                    <td>
                      <div className="admin-user">
                        <div className="admin-user-avatar">
                          <svg className="admin-user-avatar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <span className="admin-user-name">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="admin-user-email">{user.email}</td>
                    <td>
                      <span className={`admin-role-badge ${user.role === "admin" ? "admin" : "user"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="admin-status">
                        <div className={`admin-status-dot ${user.isActive ? "active" : "blocked"}`}></div>
                        <span className="admin-status-text">{user.isActive ? "Active" : "Blocked"}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className={`admin-action-button ${user.isActive ? "block" : "enable"}`}
                        onClick={() => updateStatus(user.email, !user.isActive)}
                        disabled={user.email === currentUser?.email} // Prevent self-blocking
                      >
                        {user.isActive ? (
                          <>
                            <svg className="admin-action-button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Block
                          </>
                        ) : (
                          <>
                            <svg className="admin-action-button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Enable
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="admin-empty-state">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;