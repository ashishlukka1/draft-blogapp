import { StrictMode } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import RootLayout from './components/RootLayout.jsx';
import Home from './components/common/Home.jsx';
import Signin from './components/common/SignIn.jsx';
import Signup from './components/common/SignUp.jsx';
import UserProfile from './components/user/UserProfile.jsx';
import AuthorProfile from './components/author/AuthorProfile.jsx';
import Articles from './components/common/Articles.jsx';
import ArticleByID from './components/common/ArticleByID.jsx';
import PostArticle from './components/author/PostArticle.jsx'; // ✅ Uncommented Import
import UserAuthorContext from './contexts/UserAuthorContext.jsx';

const browserRouterObj = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "", element: <Home /> },
      { path: "signin", element: <Signin /> },
      { path: "signup", element: <Signup /> },
      {
        path: "user-profile/:email",
        element: <UserProfile />,
        children: [
          { path: "articles", element: <Articles /> },
          { path: ":articleId", element: <ArticleByID /> },
          { path: "", element: <Navigate to="articles" replace /> },
        ],
      },
      {
        path: "author-profile/:email",
        element: <AuthorProfile />,
        children: [
          { path: "articles", element: <Articles /> },
          { path: ":articleId", element: <ArticleByID /> },
          { path: "article", element: <PostArticle /> }, // ✅ Fixed Route
          { path: "", element: <Navigate to="articles" replace /> },
        ],
      },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true,
  },
}); 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserAuthorContext>
      <RouterProvider router={browserRouterObj} future={{ v7_startTransition: true }} />
      </UserAuthorContext>
  </StrictMode>
);
