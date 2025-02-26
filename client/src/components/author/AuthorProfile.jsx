import React from 'react';
import { MdKeyboardBackspace } from 'react-icons/md';
import '../css/AuthorProfile.css'
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

function AuthorProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAddArticlePage = location.pathname.endsWith('/article');

  return (
    <div className="author-profile">
      {isAddArticlePage && (
        <div className="back-nav">
          <button 
            onClick={() => navigate('articles')} 
            className="back-button"
          >
            {/* <MdKeyboardBackspace style={{ marginRight: "8px" }} size={30}/> */}
            Back to Articles
          </button>
        </div>
      )}

      <div className="mt-1">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthorProfile;