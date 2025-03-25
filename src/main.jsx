import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './Components/frontend/Context/AuthContext';
import Home from './Components/frontend/Home/Home.jsx';
import About from './Components/frontend/About/About.jsx';
import Contact from './Components/frontend/Contact/Contact.jsx';
import Login from './Components/frontend/Login/Login.jsx';
import Signup from './Components/frontend/Signup/Signup.jsx';
import User from './Components/frontend/User/User.jsx';
import Profile from './Components/frontend/Profile/Profile.jsx';
import Admin from './Components/frontend/Admin/Admin.jsx';
import ProtectedRoute from './Components/frontend/Context/ProtectedRoute';
import Search from './Components/frontend/Search/Search.jsx';
import CreatePost from './Components/frontend/Post/CreatePost.jsx';
import Post from './Components/frontend/Post/Post.jsx';




const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
    children: [
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '', element: <Home /> },
          { path: 'about', element: <About /> },
          { path: 'contact', element: <Contact /> },
          { path: 'profile', element: <Profile /> },
          { path: 'user/:userid', element: <User /> },
          { path: 'search', element: <Search /> },
          
          { path: 'create-post', element: <CreatePost /> },
          { path: 'post/:id', element: <Post /> },
          {
            path: 'admin',
            element: <ProtectedRoute role="admin" />,
            children: [
              { path: '', element: <Admin /> },
            ],
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);