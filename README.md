# Draft - Blog App

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_BADGE_ID/deploy-status)](https://draft-blogapp.netlify.app/)

## Overview
Draft - Blog App is a full-stack blogging platform built using the **MERN stack**. It supports three user roles:
- **Admin**: Manages users and blog posts.
- **Author**: Creates, edits, and deletes their own blog posts.
- **User**: Reads blog posts and interacts with authors.

Authentication is handled via **Clerk**, ensuring secure access to the platform. The frontend is deployed on **Netlify**, while the backend runs on **Render**.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Clerk Authentication
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: Clerk
- **Deployment**:
  - Frontend: Netlify
  - Backend: Render

## Features
- Secure authentication via **Clerk**
- Role-based access control (**Admin, Author, User**)
- CRUD operations for blog posts (Authors)
- User-friendly blog reading experience
- Responsive design with **Tailwind CSS**

## Getting Started
### Prerequisites
Ensure you have the following installed:
- Node.js (v18+ recommended)
- MongoDB
- Netlify CLI (optional, for local frontend deployment testing)

### Installation
1. **Clone the repository**:
   ```sh
   git clone https://github.com/yourusername/draft-blogapp.git
   cd draft-blogapp
   ```
2. **Install dependencies**
   - For the backend:
     ```sh
     cd server
     npm install
     ```
   - For the frontend:
     ```sh
     cd ../client
     npm install
     ```

### Environment Variables
Create a `.env` file in both the `server/` and `client/` directories and add the necessary environment variables:
#### Server (`server/.env`)
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
JWT_SECRET=your_jwt_secret
```

#### Client (`client/.env`)
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=https://your-render-backend-url.com
```

### Running the Application
1. **Start the backend server**:
   ```sh
   cd server
   npm start
   ```
2. **Start the frontend**:
   ```sh
   cd ../client
   npm run dev
   ```
The app should now be running at `http://localhost:5173/`

## Deployment
### Frontend (Netlify)
1. Connect your **GitHub repository** to **Netlify**.
2. Set the required environment variables in **Netlify dashboard**.
3. Deploy your site.

### Backend (Render)
1. Create a **new Web Service** on **Render**.
2. Connect your GitHub repository.
3. Set the required environment variables.
4. Deploy the backend.

## Contributing
Feel free to fork this project and submit pull requests to improve it!

## License
This project is licensed under the **MIT License**.

## Live Demo
[Draft - Blog App](https://draft-blogapp.netlify.app/)

