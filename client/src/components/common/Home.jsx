import { useContext, useEffect, useState } from "react";
import { userAuthorContextObj } from "../../contexts/UserAuthorContext";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Palette, Layout, Mouse } from "lucide-react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { SiClerk } from "react-icons/si";
import { FaGithub } from "react-icons/fa";
import { Shield, PenSquare, User, Users } from "lucide-react";
import {
  FaUserAstronaut,
  FaUserEdit,
  FaReact,
  FaNodeJs,
  FaChartLine,
  FaPen,
  FaBook,
  FaUsers,
  FaShieldAlt,
  FaSpinner,
} from "react-icons/fa";
import { SiMongodb, SiExpress, SiTailwindcss } from "react-icons/si";
import "../css/Home.css";

// Create an axios instance with default settings
const api = axios.create({
  baseURL: "https://draft-blogapp-backend2.vercel.app",
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

function Home() {
  const { currentUser, setCurrentUser } = useContext(userAuthorContextObj);
  const { isSignedIn, user, isLoaded } = useUser();
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("ashishlukka2005@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function onSelectRole(e) {
    // Check if user is inactive first
    if (currentUser && currentUser.isActive === false) {
      return; // Don't proceed if user is inactive
    }
    
    setError("");
    setIsSubmitting(true);
    
    const selectedRole = e.target.value;
    
    // Get existing clerk token if available
    const clerkToken = await user?.getToken();
    
    const updatedUser = { 
      ...currentUser, 
      role: selectedRole,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddresses[0].emailAddress,
      profileImageUrl: user.imageUrl
    };
    
    try {
      let endpoint;
      
      if (selectedRole === "admin") {
        endpoint = "/admin-api/users-authors";
      } else if (selectedRole === "author") {
        endpoint = "/author-api/author";
      } else if (selectedRole === "user") {
        endpoint = "/user-api/user";
      }
      
      const res = await api.post(endpoint, updatedUser, {
        headers: clerkToken ? { 'Authorization': `Bearer ${clerkToken}` } : {}
      });
      
      const { message, payload } = res.data;
      
      if (message === selectedRole) {
        const userData = { ...currentUser, ...payload };
        setCurrentUser(userData);
        
        // Save to localStorage with expiration time (1 hour)
        const expiresAt = new Date().getTime() + (60 * 60 * 1000);
        localStorage.setItem("currentuser", JSON.stringify({
          ...userData,
          expiresAt
        }));
      } else {
        setError(message);
        resetRadioSelection();
      }
    } catch (err) {
      console.error("Role selection error:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
      resetRadioSelection();
    } finally {
      setIsSubmitting(false);
    }
  }

  // Function to reset radio button selection
  const resetRadioSelection = () => {
    const radios = document.querySelectorAll('input[name="role"]');
    radios.forEach(radio => {
      radio.checked = false;
    });
  };

  // Check if the user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isSignedIn && user) {
        setIsChecking(true);
        try {
          // First set the basic user info
          const userInfo = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0].emailAddress,
            profileImageUrl: user.imageUrl,
          };
          
          setCurrentUser({
            ...currentUser,
            ...userInfo
          });
          
          // Get token from Clerk
          const clerkToken = await user.getToken();
          
          if (!clerkToken) {
            console.warn("No auth token available");
            setIsChecking(false);
            return;
          }
          
          // Check if user exists in the database and if they are an admin
          const response = await api.get(
            `/admin-api/check-admin?email=${encodeURIComponent(userInfo.email)}`,
            {
              headers: {
                'Authorization': `Bearer ${clerkToken}`
              }
            }
          );
          
          if (response.data && response.data.isAdmin) {
            // User is an admin, set the user in context and navigate
            const updatedUserInfo = {
              ...userInfo,
              role: response.data.role,
              userId: response.data.userId
            };
            
            setCurrentUser({
              ...currentUser,
              ...updatedUserInfo
            });
            
            // Save to localStorage with expiration time (e.g., 1 hour)
            const expiresAt = new Date().getTime() + (60 * 60 * 1000);
            localStorage.setItem("currentuser", JSON.stringify({
              ...updatedUserInfo,
              expiresAt
            }));
            
            navigate('/admin-profile/' + userInfo.email);
          } else {
            // User exists but is not an admin
            localStorage.setItem("currentuser", JSON.stringify({
              ...userInfo,
              role: 'user'
            }));
          }
        } catch (err) {
          console.error("Admin check error:", err);
          
          // If 401 or 404, it's likely the user isn't an admin
          if (err.response && (err.response.status === 401 || err.response.status === 404)) {
            console.log("User is not an admin or endpoint not available");
            
            // Set as regular user
            const userInfo = {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.emailAddresses[0].emailAddress,
              profileImageUrl: user.imageUrl,
              role: 'user'
            };
            
            setCurrentUser({
              ...currentUser,
              ...userInfo
            });
            
            localStorage.setItem("currentuser", JSON.stringify(userInfo));
          } else {
            // Clear any admin status if there was an error
            const storedUser = JSON.parse(localStorage.getItem("currentuser") || "{}");
            if (storedUser.role === 'admin') {
              localStorage.setItem("currentuser", JSON.stringify({
                ...storedUser,
                role: 'user'
              }));
            }
          }
        } finally {
          setIsChecking(false);
        }
      } else if (isLoaded && !isSignedIn) {
        setIsChecking(false);
        // Clear user data when signed out
        localStorage.removeItem("currentuser");
      }
    };
    
    // Check for token expiration
    const storedUser = JSON.parse(localStorage.getItem("currentuser") || "{}");
    if (storedUser.expiresAt && new Date().getTime() > storedUser.expiresAt) {
      // Token expired, clear it
      localStorage.removeItem("currentuser");
    }
    
    checkAdminStatus();
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    // Don't navigate if user is inactive
    if (currentUser?.isActive === false) {
      return;
    }
    
    // Check various roles and navigate
    if (currentUser?.role === "admin" && error.length === 0) {
      navigate(`/admin-profile/${currentUser.email}`);
    } else if (currentUser?.role === "user" && error.length === 0) {
      navigate(`/user-profile/${currentUser.email}`);
    } else if (currentUser?.role === "author" && error.length === 0) {
      navigate(`/author-profile/${currentUser.email}`);
    }
  }, [currentUser, error]);

  return (
    <div className="home-container">
      {isSignedIn === false && (
        <div className="welcome-section">
          {/* Hero Section */}
          <div className="hero-section">
            <h1>
              Craft your legacy, one{" "}
              <span className="gradient-text">Draft</span> at a time.
            </h1>
            <p>
              {" "}
              A space where raw ideas become polished stories. With intuitive
              tools for writing and editing, every word is an opportunity to
              connect and inspire.
            </p>
            <NavLink to="/signup" className="cta-button">
              Get Started
            </NavLink>
          </div>

          {/* Statistics Cards */}
          <div className="flex flex-col items-center">
            {/* Hero Image Section */}
            <div className="relative w-full max-w-4xl mx-auto mb-8"></div>

            {/* Roles Stats Section */}
            <div className="stats-section w-full max-w-4xl">
              <div className="stats-grid">
                <div className="stat-card">
                  <Shield className="stat-icon text-4xl" />
                  <h3>Admin</h3>
                  <p>Full Control</p>
                  <span className="text-gray-400 text-sm mt-2">
                    Manage users & content
                  </span>
                </div>

                <div className="stat-card">
                  <PenSquare className="stat-icon text-4xl" />
                  <h3>Author</h3>
                  <p>Content Creator</p>
                  <span className="text-gray-400 text-sm mt-2">
                    Write & publish articles
                  </span>
                </div>

                <div className="stat-card">
                  <User className="stat-icon text-4xl" />
                  <h3>User</h3>
                  <p>Reader</p>
                  <span className="text-gray-400 text-sm mt-2">
                    Read & interact
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="features-section">
            <h2 className="text-center">
              Simple, intuitive tools to{" "}
              <span className="gradient-text">write</span>,{" "}
              <span className="gradient-text">share</span>, and{" "}
              <span className="gradient-text">inspire</span>.
            </h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="icon-wrapper">
                  <Palette className="feature-icon" />
                </div>
                <h3>Modern Interface</h3>
                <p>
                  Clean, minimalist design with intuitive navigation and
                  carefully chosen color schemes for optimal readability.
                </p>
              </div>

              <div className="feature-card">
                <div className="icon-wrapper">
                  <Layout className="feature-icon" />
                </div>
                <h3>Responsive Design</h3>
                <p>
                  Fluid layouts that adapt seamlessly to any screen size,
                  ensuring a consistent experience across all devices.
                </p>
              </div>

              <div className="feature-card">
                <div className="icon-wrapper">
                  <Mouse className="feature-icon" />
                </div>
                <h3>Interactive Elements</h3>
                <p>
                  Smooth animations and engaging user interactions that enhance
                  the browsing experience and content engagement.
                </p>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="tech-section">
            <h2>Built with modern technology</h2>
            <div className="tech-stack">
              <div className="tech-item">
                <FaReact />
                <span>React</span>
              </div>
              <div className="tech-item">
                <SiMongodb />
                <span>MongoDB</span>
              </div>
              <div className="tech-item">
                <FaNodeJs />
                <span>Node.js</span>
              </div>
              <div className="tech-item">
                <SiExpress />
                <span>Express</span>
              </div>
              <div className="tech-item">
                <SiClerk />
                <span>Clerk</span>
              </div>
              <div className="tech-item">
                <FaGithub />
                <span>GitHub</span>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="contact-section">
            <h2>Contact</h2>
            <button
              className={`contact-button ${copied ? "copied" : ""}`}
              onClick={handleCopyEmail}
            >
              ashishlukka2005@gmail.com
              {copied && <span className="copied-badge">Copied!</span>}
            </button>
          </div>
        </div>
      )}

      {/* Show loader while checking admin status */}
      {isSignedIn === true && isChecking && (
        <div className="loader-container">
          <div className="spinner-container text-center">
            <FaSpinner className="spinner-icon" />
            <p className="spinner-text mt-2">Checking user status...</p>
          </div>
        </div>
      )}

      {isSignedIn === true && !isChecking && (
        <div className="user-section">
          <div className="profile-card">
            <div className="profile-header">
              <img
                src={user.imageUrl}
                className="profile-image"
                alt="Profile"
              />
              <div className="profile-info">
                <h2 className="display-6">{user.firstName} {user.lastName}</h2>
                <p className="email">{user.emailAddresses[0].emailAddress}</p>
              </div>
            </div>

            <div className="role-selection">
              <h3 className="text-center mb-4">Select Your Role</h3>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {currentUser && currentUser.isActive === false ? (
                <div className="alert alert-danger" role="alert">
                  <h4 className="alert-heading">Account Temporarily Blocked</h4>
                  <p>Your account has been temporarily blocked by an admin. Please contact the administrator for assistance.</p>
                  <hr />
                  <p className="mb-0">Email: support@inkspire.com</p>
                </div>
              ) : (
                <div className="role-options">
                  <div className="role-card">
                    <input
                      type="radio"
                      name="role"
                      id="admin"
                      value="admin"
                      className="role-input"
                      onChange={onSelectRole}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="admin" className="role-label">
                      <FaShieldAlt className="role-icon" />
                      <span>Admin</span>
                    </label>
                  </div>
                  
                  <div className="role-card">
                    <input
                      type="radio"
                      name="role"
                      id="author"
                      value="author"
                      className="role-input"
                      onChange={onSelectRole}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="author" className="role-label">
                      <FaUserEdit className="role-icon" />
                      <span>Author</span>
                    </label>
                  </div>

                  <div className="role-card">
                    <input
                      type="radio"
                      name="role"
                      id="user"
                      value="user"
                      className="role-input"
                      onChange={onSelectRole}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="user" className="role-label">
                      <FaUserAstronaut className="role-icon" />
                      <span>Reader</span>
                    </label>
                  </div>
                </div>
              )}
              
              {isSubmitting && (
                <div className="text-center mt-4">
                  <div className="spinner-container">
                    <FaSpinner className="spinner-icon" />
                    <p className="spinner-text mt-2">Processing your selection...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;