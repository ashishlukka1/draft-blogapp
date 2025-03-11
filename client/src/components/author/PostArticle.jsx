import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { userAuthorContextObj } from '../../contexts/UserAuthorContext';
import { useNavigate } from 'react-router-dom';
import { FaPen } from 'react-icons/fa';
import { LiaPenNibSolid, LiaLayerGroupSolid, LiaFileAltSolid } from "react-icons/lia";
import '../css/PostArticle.css';

function PostArticle() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { currentUser } = useContext(userAuthorContextObj);
  const navigate = useNavigate();

  async function postArticle(articleObj) {
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
    articleObj.isArticleActive = true;

    let res = await axios.post('https://draft-backend.vercel.app/author-api/article', articleObj);
    if (res.status === 201) {
      navigate(`/author-profile/${currentUser.email}/articles`);
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
                      {...register("title")}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <LiaLayerGroupSolid className="input-icon" />
                      <span>Category</span>
                    </label>
                    <select
                      {...register("category")}
                      className="custom-select"
                      defaultValue=""
                    >
                      <option value="" disabled>Select a category</option>
                      <option value="programming">Programming</option>
                      <option value="AI&ML">AI & Machine Learning</option>
                      <option value="database">Database</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FaPen className="input-icon" />
                      <span>Content</span>
                    </label>
                    <textarea
                      {...register("content")}
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