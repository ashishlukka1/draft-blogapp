import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { userAuthorContextObj } from "../../contexts/UserAuthorContext";
import { FaEdit, FaArrowLeft } from "react-icons/fa";
import { MdDelete, MdRestore } from "react-icons/md";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import '../css/ArticleByID.css'

function ArticleByID() {
  const { state } = useLocation();
  const { currentUser } = useContext(userAuthorContextObj);
  const [editArticleStatus, setEditArticleStatus] = useState(false);
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [currentArticle, setCurrentArticle] = useState(state);
  const [commentStatus, setCommentStatus] = useState("");

  function enableEdit() {
    setEditArticleStatus(true);
  }

  async function onSave(modifiedArticle) {
    const articleAfterChanges = { ...state, ...modifiedArticle };
    const token = await getToken();
    const currentDate = new Date();
    articleAfterChanges.dateOfModification = `${currentDate.getDate()}-${currentDate.getMonth()}-${currentDate.getFullYear()}`;

    let res = await axios.put(
      `https://draft-blogapp.vercel.app/author-api/article/${articleAfterChanges.articleId}`,
      articleAfterChanges,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.message === "article modified") {
      setEditArticleStatus(false);
      navigate(`/author-profile/articles/${state.articleId}`, {
        state: res.data.payload,
      });
    }
  }

  async function addComment(commentObj) {
    commentObj.nameOfUser = currentUser.firstName;
    let res = await axios.put(
      `https://draft-blogapp.vercel.app/user-api/comment/${currentArticle.articleId}`,
      commentObj
    );
    if (res.data.message === "comment added") {
      setCommentStatus(res.data.message);
    }
  }

  async function deleteArticle() {
    state.isArticleActive = false;
    let res = await axios.put(
      `https://draft-blogapp.vercel.app/author-api/articles/${state.articleId}`,
      state
    );
    if (res.data.message === "article deleted or restored") {
      setCurrentArticle(res.data.payload);
    }
  }

  async function restoreArticle() {
    state.isArticleActive = true;
    let res = await axios.put(
      `https://draft-blogapp.vercel.app/author-api/articles/${state.articleId}`,
      state
    );
    if (res.data.message === "article deleted or restored") {
      setCurrentArticle(res.data.payload);
    }
  }

  return (
    <div className="article-container">
      <button 
        className="back-button" 
        onClick={() => navigate('/author-profile/${email}/articles')}
      > 
        {/* <FaArrowLeft size={16} /> */}
        <span>Back to Articles</span>
      </button>

      {editArticleStatus === false ? (
        <>
          <div className="article-header">
            <div className="article-header-content">
              <div className="article-main-info">
                <h1 className="article-text">{state.title}</h1>
                <div className="article-meta">
                  <span>Created on: {state.dateOfCreation}</span>
                  <span>Modified on: {state.dateOfModification}</span>
                </div>
                {currentUser.role === "author" && (
                  <div className="action-buttons">
                    <button className="action-button edit" onClick={enableEdit}>
                      <FaEdit size={20} />
                      <span>Edit</span>
                    </button>
                    {state.isArticleActive ? (
                      <button className="action-button delete" onClick={deleteArticle}>
                        <MdDelete size={22} />
                        <span>Delete</span>
                      </button>
                    ) : (
                      <button className="action-button restore" onClick={restoreArticle}>
                        <MdRestore size={22} />
                        <span>Restore</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="author-block">
                <div className="author-details">
                  <img
                    src={state.authorData.profileImageUrl}
                    className="author-avatar"
                    alt={state.authorData.nameOfAuthor}
                  />
                  <p className="author-name">{state.authorData.nameOfAuthor}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="article-content">
            {state.content}
          </div>

          <div className="comments-section">
            <h2 className="comments-title">Comments</h2>
            {state.comments.length === 0 ? (
              <p className="text-muted">No comments yet...</p>
            ) : (
              state.comments.map((commentObj) => (
                <div key={commentObj._id} className="comment-item">
                  <p className="comment-user">{commentObj?.nameOfUser}</p>
                  <p className="comment-text">{commentObj?.comment}</p>
                </div>
              ))
            )}
          </div>

          {currentUser.role === "user" && (
            <div className="comment-form">
              <form onSubmit={handleSubmit(addComment)}>
                <input
                  type="text"
                  {...register("comment")}
                  className="comment-input"
                  placeholder="Write a comment..."
                />
                <button type="submit" className="submit-button">
                  Add Comment
                </button>
              </form>
              {commentStatus && (
                <p className="text-success mt-2">{commentStatus}</p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="edit-form">
          <form onSubmit={handleSubmit(onSave)}>
            <div className="mb-4">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                id="title"
                className="form-input"
                defaultValue={state.title}
                {...register("title")}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="category" className="form-label">
                Select a category
              </label>
              <select
                {...register("category")}
                id="category"
                className="form-select form-input"
                defaultValue={state.category}
              >
                <option value="programming">Programming</option>
                <option value="AI&ML">AI&ML</option>
                <option value="database">Database</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="content" className="form-label">
                Content
              </label>
              <textarea
                {...register("content")}
                id="content"
                className="form-textarea"
                defaultValue={state.content}
              ></textarea>
            </div>
            <div className="text-end">
              <button type="submit" className="submit-button">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ArticleByID;