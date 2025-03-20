import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { userAuthorContextObj } from "../../contexts/UserAuthorContext";
import { useAuth } from "@clerk/clerk-react"; // Import Clerk's useAuth hook
import './AdminProfile.css';

function AdminProfile() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { email } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(userAuthorContextObj);
  const { getToken } = useAuth(); // Get the token function from Clerk

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!currentUser || !currentUser.role || currentUser.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Get the token from Clerk - specify the specific session token
        const token = await getToken({ template: "session" });
        
        if (!token) {
          throw new Error("Not authenticated");
        }
        
        console.log("Token obtained from Clerk:", token.substring(0, 10) + "...");
        
        // Make the request with the token in the Authorization header
        const response = await axios.get(
          "https://draft-blogapp-backend2.vercel.app/admin-api/users-authors", 
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log("Data received:", response.data);
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        console.error("Response data:", err.response?.data);
        if (err.response && err.response.status === 401) {
          setError("Authentication failed. Please log in again.");
          setTimeout(() => navigate("/"), 3000);
        } else {
          setError("Failed to fetch users: " + (err.response?.data?.message || err.message));
          setLoading(false);
        }
      }
    };

    fetchUsers();
  }, [currentUser, navigate, getToken]);

  const updateStatus = async (email, isActive) => {
    try {
      // Get the token from Clerk - specify the specific session token
      const token = await getToken({ template: "session" });
      
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      console.log("Token for update:", token.substring(0, 10) + "...");
      
      // Make the request with the token in the Authorization header
      const response = await axios.put(
        `https://draft-blogapp-backend2.vercel.app/admin-api/update-status/${email}`,
        { isActive },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Update response:", response.data);
      
      setUsers(users.map(user => 
        user.email === email ? response.data.user : user
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      console.error("Error response:", error.response?.data);
      setError("Failed to update user status: " + (error.response?.data?.message || error.message));
    }
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
            {email && <p className="admin-subtitle">Logged in as: {email}</p>}
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