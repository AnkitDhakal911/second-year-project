import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext"; // Import useAuth hook
import Logo from "../assets/logo.png";
import GoogleSvg from "../assets/icons8-google.svg";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup } = useAuth(); // Use the signup function from AuthContext
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      await signup(name, trimmedEmail, trimmedPassword); // Pass trimmed values
      navigate("/");
    } catch (err) {
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 justify-center items-center bg-gray-200 p-5">
        <div className="w-full max-w-xs flex flex-col items-center">
          <div className="self-center pt-5 mb-5">
            <img src={Logo} alt="Logo" className="w-16 h-16 mb-5" />
          </div>
          <div className="text-center w-full">
            <h2 className="text-3xl font-semibold mb-3">Join Us!</h2>
            <p className="text-xl font-normal mb-8">Create your account</p>
            <form className="w-full flex flex-col" onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 mb-4 border-b border-black outline-none"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 mb-4 border-b border-black outline-none"
                required
              />
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 border-b border-black outline-none"
                  required
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
              <div className="flex flex-col space-y-4">
                <button
                  type="submit"
                  className="w-full p-4 bg-black text-white font-semibold rounded-full border-3 border-black hover:text-gray-800 hover:bg-white">
                  Sign Up
                </button>
              
              </div>
            </form>
          </div>
          <p className="text-center text-sm font-medium mt-8">
            Already have an account? <Link to="/login" className="hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;