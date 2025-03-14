import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userAuthorContextObj } from "../../contexts/UserAuthorContext";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { FaUserSlash, FaUserCheck, FaSearch, FaUserAstronaut, FaUserEdit, FaUsers } from "react-icons/fa";
import { Shield } from "lucide-react";
import "./AdminProfile.css";

function AdminProfile() {
  const { email } = useParams();
  const { currentUser } = useContext(userAuthorContextObj);
  const { isSignedIn, user, isLoaded } = useUser();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [dashboardStats, setDashboardStats] = useState({
    userCount: 0,
    authorCount: 0,
    blockedCount: 0,
    totalCount: 0
  });
  const [actionInProgress, setActionInProgress] = useState(false);

  // Verify admin access and fetch users
  useEffect(() => {
    const fetchData = async () => {
      if (!isSignedIn || !currentUser || currentUser.role !== "admin") {
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        
        // Get the clerk token
        const token = await user.getToken();
        
        // Configure headers with the token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Fetch all users and authors
        const usersResponse = await axios.get(
          `https://draft-blogapp-backend2.vercel.app/admin-api/users`,
          config
        );
        
        // Fetch dashboard stats
        const dashboardResponse = await axios.get(
          `https://draft-blogapp-backend2.vercel.app/admin-api/dashboard`,
          config
        );
        
        setUsers(usersResponse.data.payload);
        setFilteredUsers(usersResponse.data.payload);
        setDashboardStats(dashboardResponse.data.payload);
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Failed to load user data");
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [isSignedIn, isLoaded, currentUser, user, navigate]);

  // Handle search and filter
  useEffect(() => {
    let result = users;
    
    // Apply role filter
    if (filterRole !== "all") {
      result = result.filter(user => user.role === filterRole);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        user => 
          (user.username && user.username.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term))
      );
    }
    
    setFilteredUsers(result);
  }, [searchTerm, filterRole, users]);

  // Toggle user active status (enable/disable)
  const toggleUserStatus = async (userId, currentStatus) => {
    if (actionInProgress) return;
    
    try {
      setActionInProgress(true);
      
      // Get the clerk token
      const token = await user.getToken();
      
      // Configure headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Update user status
      await axios.put(
        `https://draft-blogapp.vercel.app/users/${userId}/status`,
        { isActive: !currentStatus },
        config
      );
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isActive: !currentStatus } 
            : user
        )
      );
      
      // Refresh dashboard stats
      const dashboardResponse = await axios.get(
        'https://draft-blogapp.vercel.app/admin-api/dashboard',
        config
      );
      
      setDashboardStats(dashboardResponse.data.payload);
      setActionInProgress(false);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to update user status");
      }
      setActionInProgress(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-profile-container">
      <div className="admin-header">
        <div className="admin-info">
          <Shield size={40} className="admin-icon" />
          <div>
            <h1>Admin Dashboard</h1>
            <p>{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="stat-box">
          <FaUserAstronaut className="stat-icon user-icon" />
          <div>
            <h3>Users</h3>
            <p>{dashboardStats.userCount}</p>
          </div>
        </div>
        <div className="stat-box">
          <FaUserEdit className="stat-icon author-icon" />
          <div>
            <h3>Authors</h3>
            <p>{dashboardStats.authorCount}</p>
          </div>
        </div>
        <div className="stat-box">
          <FaUserSlash className="stat-icon blocked-icon" />
          <div>
            <h3>Blocked</h3>
            <p>{dashboardStats.blockedCount}</p>
          </div>
        </div>
        <div className="stat-box">
          <FaUsers className="stat-icon total-icon" />
          <div>
            <h3>Total</h3>
            <p>{dashboardStats.totalCount}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <label>Filter by role:</label>
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All</option>
            <option value="user">Users</option>
            <option value="author">Authors</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <h2>Users & Authors Management</h2>
        
        {filteredUsers.length === 0 ? (
          <div className="no-users-message">
            No users found matching your criteria
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className={!user.isActive ? "blocked-user" : ""}>
                  <td>{user.username || "N/A"}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role === "user" ? "User" : "Author"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? "active" : "blocked"}`}>
                      {user.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`action-button ${user.isActive ? "block-btn" : "unblock-btn"}`}
                      onClick={() => toggleUserStatus(user._id, user.isActive)}
                      disabled={actionInProgress}
                    >
                      {user.isActive ? (
                        <>
                          <FaUserSlash /> Block
                        </>
                      ) : (
                        <>
                          <FaUserCheck /> Unblock
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminProfile;