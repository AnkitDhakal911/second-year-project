import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import Logo from "../assets/logo.png";
import GoogleSvg from "../assets/icons8-google.svg";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { Link } from "react-router-dom";



const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); 

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 justify-center items-center bg-gray-200 p-5">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="self-center pt-5 mb-5">
            <img src={Logo} alt="Logo" className="w-16 h-16 mb-5" />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-3">Welcome back!</h2>
            <p className="text-xl font-normal mb-8">Please enter your details</p>
            <form className="w-full flex flex-col">

              <input 
                type="email" 
                placeholder="Email" 
                className="w-full p-4 mb-4 border-b border-black outline-none" 
              />
              <div className="relative mb-4">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  className="w-full p-4 border-b border-black outline-none" 
                />
                {showPassword ? (
                  <FaEyeSlash 
                    className="absolute right-3 top-5 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)} 
                  />
                ) : (
                  <FaEye 
                    className="absolute right-3 top-5 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)} 
                  />
                )}
              </div>
              <div className="flex justify-between items-center mb-10 space-x-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="remember-checkbox" className="h-4 w-4" />
                  <label htmlFor="remember-checkbox" className="text-sm font-medium cursor-pointer">
                    Remember for 30 days
                  </label>
                </div>
                <a href="#" className="text-sm font-medium hover:underline ml-auto">Forgot password?</a>
              </div>
              <div className="flex flex-col space-y-4">
                <button 
                  type="button" 
                  className="w-full p-4 bg-black text-white font-semibold rounded-full border-3 border-black hover:text-gray-800 hover:bg-white">
                  Log In
                </button>
                <button 
                  type="button" 
                  className="w-full p-4 bg-gray-200 flex justify-center items-center space-x-2 hover:bg-gray-300 rounded-full">
                  <img src={GoogleSvg} alt="Google Logo" className="w-8 h-8" />
                  <span>Log In with Google</span>
                </button>
              </div>
              <div className="mt-4">
                <button 
                  type="button" 
                  className="w-full p-4 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600"
                  onClick={() => navigate('/signup')}>
                  Create a new account
                </button>
              </div>
            </form>
          </div>
          <p className="text-center text-sm font-medium mt-8">
            Don't have an account? <Link to="/signup" className="hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
