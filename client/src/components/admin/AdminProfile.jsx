import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { userAuthorContextObj } from "../../contexts/UserAuthorContext";
import './AdminProfile.css'; // Import the CSS file

function AdminProfile() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
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

    fetchUsers();
  }, [currentUser, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get("https://draft-blogapp-backend2.vercel.app/admin-api/users-authors", {
        withCredentials: true
      });
      
      console.log("Data received:", response.data);
      
      const allUsers = response.data || [];
      
      // Filter out admin users first
      const nonAdminUsers = allUsers.filter(user => user.role?.toLowerCase() !== 'admin');
      
      // Then filter by active status
      const active = nonAdminUsers.filter(user => user.isActive !== false);
      const blocked = nonAdminUsers.filter(user => user.isActive === false);
      
      setUsers(active);
      setBlockedUsers(blocked);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response && err.response.status === 401) {
        navigate("/");
      } else {
        setError("Failed to fetch users: " + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    }
  };

  const updateStatus = async (userEmail, newActiveStatus) => {
    try {
      const response = await axios.put(
        `https://draft-blogapp-backend2.vercel.app/admin-api/update-status/${encodeURIComponent(userEmail)}`, 
        { isActive: newActiveStatus },
        { withCredentials: true }
      );
      
      // Refresh users after status change
      fetchUsers();
    } catch (error) {
      console.error("Error updating status:", error);
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
            <button className="admin-error-close" onClick={() => setError(null)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <svg className="admin-tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Active Users <span className="admin-tab-count">{users.length}</span>
          </button>
          <button 
            className={`admin-tab ${activeTab === 'blocked' ? 'active' : ''}`}
            onClick={() => setActiveTab('blocked')}
          >
            <svg className="admin-tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="5" y1="5" x2="19" y2="19" />
            </svg>
            Blocked Users <span className="admin-tab-count">{blockedUsers.length}</span>
          </button>
        </div>
        
        {/* Refresh Button */}
        <div className="admin-actions">
          <button className="admin-refresh-button" onClick={fetchUsers} disabled={loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            Refresh
          </button>
        </div>
        
        <div className="admin-table-container">
          {activeTab === 'users' ? (
            <div>
              {users.length === 0 ? (
                <div className="admin-empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                  <p>No active users found</p>
                </div>
              ) : (
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
                    {users.map(user => (
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
                          <span className={`admin-role-badge ${user.role || 'user'}`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-status">
                            <div className="admin-status-dot active"></div>
                            <span className="admin-status-text">Active</span>
                          </div>
                        </td>
                        <td>
                          <button
                            className="admin-action-button block"
                            onClick={() => updateStatus(user.email, false)}
                          >
                            <svg className="admin-action-button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Block
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div>
              {blockedUsers.length === 0 ? (
                <div className="admin-empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p>No blocked users found</p>
                </div>
              ) : (
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
                    {blockedUsers.map(user => (
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
                          <span className={`admin-role-badge ${user.role || 'user'}`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-status">
                            <div className="admin-status-dot blocked"></div>
                            <span className="admin-status-text">Blocked</span>
                          </div>
                        </td>
                        <td>
                          <button
                            className="admin-action-button enable"
                            onClick={() => updateStatus(user.email, true)}
                          >
                            <svg className="admin-action-button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Enable
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;