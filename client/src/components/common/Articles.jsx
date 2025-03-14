  import { useState, useEffect } from 'react';
  import axios from 'axios';
  import { useNavigate } from 'react-router-dom';
  import { useAuth, useUser } from '@clerk/clerk-react';
  import '../css/Articles.css';

  function Articles() {
    const [articles, setArticles] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('');
    const [filters, setFilters] = useState({
      keyword: '',
      category: '',
      dateFilter: ''
    });
    
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const { user } = useUser();

    const categories = [...new Set(articles.map(article => article.category || 'General'))];

    // Verify user role when component mounts
    useEffect(() => {
      const verifyUserRole = async () => {
        if (user?.emailAddresses?.length > 0) {
          try {
            const token = await getToken();
            const userData = {
              email: user.emailAddresses[0].emailAddress,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImageUrl: user.imageUrl,
              // Initially try as an author
              role: 'author'
            };

            // Try to verify as author first
            let response = await axios.post('https://draft-blogapp-backend2.vercel.app/author-api/author', userData, {
              headers: { Authorization: `Bearer ${token}` }
            });

            // If not an author, try as user
            if (response.data.message === "Invalid role") {
              userData.role = 'user';
              response = await axios.post('https://draft-blogapp-backend2.vercel.app/user-api/user', userData, {
                headers: { Authorization: `Bearer ${token}` }
              });
            }

            setUserRole(response.data.message);
          } catch (err) {
            console.error('Failed to verify user role:', err);
            setUserRole('user'); // Default to user role on error
          }
        }
      };

      verifyUserRole();
    }, [user, getToken]);

    async function getArticles() {
      try {
        const token = await getToken();
        const res = await axios.get('https://draft-blogapp-backend2.vercel.app/author-api/articles', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (res.data.message === 'articles') {
          setArticles(res.data.payload);
          setFilteredArticles(res.data.payload);
          setError('');
        } else {
          setError(res.data.message);
        }
      } catch (err) {
        setError('Failed to fetch articles');
      }
    }

    useEffect(() => {
      getArticles();
    }, []);

    useEffect(() => {
      filterArticles();
    }, [filters, articles]);

    const filterArticles = () => {
      let filtered = [...articles];

      if (filters.keyword) {
        filtered = filtered.filter(article => 
          article.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
          article.content.toLowerCase().includes(filters.keyword.toLowerCase())
        );
      }

      if (filters.category) {
        filtered = filtered.filter(article => 
          (article.category || 'General') === filters.category
        );
      }

      if (filters.dateFilter) {
        const today = new Date();
        filtered = filtered.filter(article => {
          const articleDate = new Date(article.dateOfModification);
          const diffTime = Math.ceil((today - articleDate) / (1000 * 60 * 60 * 24));
          
          switch (filters.dateFilter) {
            case '30':
              return diffTime <= 30;
            case '90':
              return diffTime <= 90;
            default:
              return true;
          }
        });
      }

      setFilteredArticles(filtered);
    };

    const handleFilterChange = (field, value) => {
      setFilters(prev => ({
        ...prev,
        [field]: value
      }));
    };

    function gotoArticleById(articleObj) {
      navigate(`../${articleObj.articleId}`, { state: articleObj });
    }

    return (
      <div className="dark-container">
        <div className="filter-section">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="filter-group">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                />
              </div>
              
              <div className="filter-dropdown">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="filter-dropdown">
                <select
                  value={filters.dateFilter}
                  onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
                >
                  <option value="">All Time</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                </select>
              </div>
            </div>
            
            {userRole === 'author' && (
              <button 
                className="add-article-button"
                onClick={() => navigate('../article')}
              >
                Add New Article
              </button>
            )}
          </div>
        </div>

        <div className="cards-grid">
          {error.length !== 0 && <div className="error-message">{error}</div>}
          <div className="row row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-3 g-4">
            {filteredArticles.map((articleObj) => (
              <div className="col" key={articleObj.articleId}>
                <div className="article-card">
                  <div className="card-content">
                    <div className="top-section">
                      <div className="author-section">
                        <img
                          src={articleObj.authorData.profileImageUrl}
                          className="author-avatar"
                          alt={articleObj.authorData.nameOfAuthor}
                        />
                        <span className="author-name">
                          {articleObj.authorData.nameOfAuthor}
                        </span>
                      </div>
                      <div className="category-tag">{articleObj.category || 'General'}</div>
                    </div>
                    <h3 className="article-title">{articleObj.title}</h3>
                    <p className="article-excerpt">
                      {articleObj.content.substring(0, 80) + "...."}
                    </p>
                    <div className="card-footer">
                      <div className="date-info">
                        Last updated on {articleObj.dateOfModification}
                      </div>
                      <button 
                        className="read-button"
                        onClick={() => gotoArticleById(articleObj)}
                      >
                        Read more
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  export default Articles;