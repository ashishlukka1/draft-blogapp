import { useContext, useEffect, useState } from "react";
import { userAuthorContextObj } from "../../contexts/UserAuthorContext";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Palette, Layout, Mouse } from "lucide-react";
import image from "../../assets/1.jpeg";
import { Link, useNavigate, NavLink } from "react-router-dom";
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
} from "react-icons/fa";
import { SiMongodb, SiExpress, SiTailwindcss } from "react-icons/si";
import "../css/Home.css";

function Home() {
  const { currentUser, setCurrentUser } = useContext(userAuthorContextObj);
  const { isSignedIn, user, isLoaded } = useUser();
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("ashishlukka2005@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function onSelectRole(e) {
    setError("");
    const selectedRole = e.target.value;
    currentUser.role = selectedRole;
    let res = null;
    try {
      if (selectedRole === "author") {
        res = await axios.post(
          "${import.meta.env.local.URL}/author-api/author",
          currentUser
        );
        let { message, payload } = res.data;
        if (message === "author") {
          setCurrentUser({ ...currentUser, ...payload });
          localStorage.setItem("currentuser", JSON.stringify(payload));
        } else {
          setError(message);
        }
      }
      else if (selectedRole === "user") {
        res = await axios.post(
          `${import.meta.env.local.URL}/user-api/user`,
          currentUser
        );
        let { message, payload } = res.data;
        if (message === "user") {
          setCurrentUser({ ...currentUser, ...payload });
          localStorage.setItem("currentuser", JSON.stringify(payload));
        } else {
          setError(message);
        }
      }
      else if (selectedRole === "admin") {
        res = await axios.post(
          `${import.meta.env.local.URL}/admin-api/admin`,
          currentUser
        );
        let { message, payload } = res.data;
        if (message === "admin") {
          setCurrentUser({ ...currentUser, ...payload });
          localStorage.setItem("currentuser", JSON.stringify(payload));
        } else {
          setError(message);
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message);
      }
    }
  }

  useEffect(() => {
    if (isSignedIn === true) {
      setCurrentUser({
        ...currentUser,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0].emailAddress,
        profileImageUrl: user.imageUrl,
        username: `${user.firstName} ${user.lastName}`
      });
    }
  }, [isLoaded]);

  useEffect(() => {
    if (currentUser?.role === "user" && error.length === 0) {
      navigate(`/user-profile/${currentUser.email}`);
    }
    if (currentUser?.role === "author" && error.length === 0) {
      navigate(`/author-profile/${currentUser.email}`);
    }
    if (currentUser?.role === "admin" && error.length === 0) {
      navigate(`/admin-profile/${currentUser.email}`);
    }
  }, [currentUser]);

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
              {/* <div className="tech-item">
                <SiTailwindcss />
                <span>Tailwind</span>
              </div> */}
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

      {isSignedIn === true && (
        <div className="user-section">
          <div className="profile-card">
            <div className="profile-header">
              <img
                src={user.imageUrl}
                className="profile-image"
                alt="Profile"
              />
              <div className="profile-info">
                <h2 className="display-6">{user.firstName}</h2>
                <p className="email">{user.emailAddresses[0].emailAddress}</p>
              </div>
            </div>

            <div className="role-selection">
              <h3 className="text-center mb-4">Select Your Role</h3>
              {error.length !== 0 && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="role-options">
                <div className="role-card">
                  <input
                    type="radio"
                    name="role"
                    id="admin"
                    value="admin"
                    className="role-input"
                    onChange={onSelectRole}
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
                  />
                  <label htmlFor="user" className="role-label">
                    <FaUserAstronaut className="role-icon" />
                    <span>Reader</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;