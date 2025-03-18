import React from 'react';
import './App.css';
import { Outlet } from 'react-router-dom';
import Header from './Components/frontend/Header/Header'; // Correct path
import Footer from './Components/frontend/Footer/Footer'; // Correct path

function App() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;