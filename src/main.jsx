import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './Components/frontend/Context/AuthContext'; // Correct path
import Home from './Components/frontend/Home/Home.jsx'; // Correct path
import About from './Components/frontend/About/About.jsx'; // Correct path
import Contact from './Components/frontend/Contact/Contact.jsx'; // Correct path
import Login from './Components/frontend/Login/Login.jsx'; // Correct path
import Signup from './Components/frontend/Signup/Signup.jsx'; // Correct path
import User from './Components/frontend/User/User.jsx'; // Correct path
import Categories from './Components/frontend/Categories/Categories.jsx'; // Correct path
import Tags from './Components/frontend/Tags/Tags.jsx'; // Correct path
import Profile from './Components/frontend/Profile/Profile.jsx'; // Correct path
import Admin from './Components/frontend/Admin/Admin.jsx'; // Correct path

// Create the router
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider> {/* Move AuthProvider inside the RouterProvider */}
        <App />
      </AuthProvider>
    ),
    children: [
      { path: '', element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'categories', element: <Categories /> },
      { path: 'tags', element: <Tags /> },
      { path: 'profile', element: <Profile /> },
      { path: 'admin', element: <Admin /> },
      { path: '/user/:userid', element: <User /> },
    ],
  },
]);

// Render the app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />  
    {/* comment */}
  </StrictMode>
);