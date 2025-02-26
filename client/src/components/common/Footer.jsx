import React from 'react';
import { BsInstagram, BsLinkedin } from 'react-icons/bs';
import { FaGithub } from "react-icons/fa";
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row justify-content-between align-items-center">
          {/* Left Column */}
          <div className="col-md-6 footer-left">
            <h2 className="brand-name">Draft</h2>
            <p className="tagline">Where ideas are born and perfected</p>
            <div className="copyright">
              © 2025 Draft. All Rights Reserved.
            </div>
          </div>

          {/* Right Column */}
          <div className="col-md-6 footer-right">
            <div className="social-links">
              <a href="https://instagram.com/ashhiiiish" target="_blank" rel="noopener noreferrer">
                <BsInstagram />
              </a>
              <a href="https://www.linkedin.com/in/ashish-lukka-507988213/" target="_blank" rel="noopener noreferrer">
                <BsLinkedin />
              </a>
              <a href="https://github.com/ashishlukka1" target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </a>
            </div>
            
            <div className="project-links">
              <a href="https://lumora-web.netlify.app/" target="_blank" rel="noopener noreferrer">Lumora</a>
              <a href="/project2">Project-2</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;