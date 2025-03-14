import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { userAuthorContextObj } from '../../contexts/UserAuthorContext';
import { useNavigate } from 'react-router-dom';
import { FaPen, FaPlus } from 'react-icons/fa';
import { LiaPenNibSolid, LiaLayerGroupSolid, LiaFileAltSolid } from "react-icons/lia";
import '../css/PostArticle.css';

function PostArticle() {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const { currentUser } = useContext(userAuthorContextObj);
  const navigate = useNavigate();
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  // Toggle custom category field when "Custom" option is selected
  const handleCategoryChange = (e) => {
    if (e.target.value === "custom") {
      setShowCustomCategory(true);
    } else {
      setShowCustomCategory(false);
    }
  };

  async function postArticle(articleObj) {
    try {
      // If using custom category, replace the category value
      if (articleObj.category === "custom" && articleObj.customCategory) {
        articleObj.category = articleObj.customCategory;
        delete articleObj.customCategory;
      }
      
      const authorData = {
        nameOfAuthor: currentUser.firstName,
        email: currentUser.email,
        profileImageUrl: currentUser.profileImageUrl
      };
      
      articleObj.authorData = authorData;
      articleObj.articleId = Date.now();

      let currentDate = new Date();
      articleObj.dateOfCreation = currentDate.getDate() + "-" +
        currentDate.getMonth() + "-" +
        currentDate.getFullYear() + " " +
        currentDate.toLocaleTimeString("en-US", { hour12: true });

      articleObj.dateOfModification = articleObj.dateOfCreation;
      articleObj.comments = [];
      articleObj.isArticleActive = true; // Fixed property name to match original code

      let res = await axios.post('https://draft-blogapp-backend2.vercel.app/author-api/article', articleObj);
      if (res.status === 201) {
        navigate(`/author-profile/${currentUser.email}/articles`);
      }
    } catch (error) {
      console.error("Error posting article:", error);
      // Handle error (you might want to add some error state and display it to the user)
    }
  }

  return (
    <div className="post-article-container">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="article-card">
              <div className="article-head">
                <LiaPenNibSolid className="header-icon" />
                <h2 className="header-title">Create New Article</h2>
              </div>
              
              <div className="article-body">
                <form onSubmit={handleSubmit(postArticle)} className="article-form">
                  <div className="form-group">
                    <label className="form-label">
                      <LiaFileAltSolid className="input-icon" />
                      <span>Article Title</span>
                    </label>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="Enter article title"
                      {...register("title", { required: true })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <LiaLayerGroupSolid className="input-icon" />
                      <span>Category</span>
                    </label>
                    <select
                      {...register("category", { required: true })}
                      className="custom-select"
                      defaultValue=""
                      onChange={handleCategoryChange}
                    >
                      <option value="" disabled>Select a category</option>
                      <option value="programming">Programming</option>
                      <option value="AI&ML">AI & Machine Learning</option>
                      <option value="database">Database</option>
                      <option value="custom">Add Custom Category</option>
                    </select>
                  </div>

                  {showCustomCategory && (
                    <div className="form-group">
                      <label className="form-label">
                        <FaPlus className="input-icon" />
                        <span>Custom Category</span>
                      </label>
                      <input
                        type="text"
                        className="custom-input"
                        placeholder="Enter custom category"
                        {...register("customCategory", { 
                          required: showCustomCategory 
                        })}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">
                      <FaPen className="input-icon" />
                      <span>Content</span>
                    </label>
                    <textarea
                      {...register("content", { required: true })}
                      className="custom-textarea"
                      rows="12"
                      placeholder="Write your article content here..."
                    ></textarea>
                  </div>

                  <div className="text-end">
                    <button type="submit" className="submit-btn">
                      Publish Article
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostArticle;