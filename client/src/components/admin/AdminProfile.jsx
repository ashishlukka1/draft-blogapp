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

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!currentUser || !currentUser.role || currentUser.role !== "admin") {
      navigate("/");
      return;
    }

    setLoading(true);
    
    axios.get("https://draft-blogapp.onrender.com/admin-api/users-authors", {
      withCredentials: true,
      params: {
        // Add query parameter to exclude admin role
        excludeRoles: ['admin']
      }
    })
      .then(response => {
        console.log("Data received:", response.data);
        // Filter out admin users on the client-side as a backup
        const filteredUsers = (response.data.payload || []).filter(
          user => user.role !== 'admin'
        );
        setUsers(filteredUsers);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching users:", err);
        if (err.response && err.response.status === 401) {
          navigate("/");
        } else {
          setError("Failed to fetch users: " + (err.response?.data?.message || err.message));
          setLoading(false);
        }
      });
  }, [currentUser, navigate]);

  const updateStatus = (email, isActive) => {
    axios.put(`https://draft-blogapp.onrender.com/admin-api/update-status/${email}`, 
      { 
        isActive,
        adminEmail: currentUser.email // Send admin email for verification
      },
      { withCredentials: true }
    )
      .then(response => {
        // Update the user in the local state
        setUsers(users.map(user => 
          user.email === email ? response.data.payload : user
        ));
      })
      .catch(error => {
        console.error("Error updating status:", error);
        setError("Failed to update user status: " + (error.response?.data?.message || error.message));
      });
  };

  // Rest of the component remains the same as in the original code
  // (loading state, render method, etc.)

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Users and Authors Dashboard</h1>
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
                        <span className="admin-user-name">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="admin-user-email">{user.email}</td>
                    <td>
                      <span className={`admin-role-badge ${user.role}`}>
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
                    No users or authors found
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