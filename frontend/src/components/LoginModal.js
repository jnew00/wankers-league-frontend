import React, { useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";

const LoginModal = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "/api/auth/login",
        { username, password },
        { withCredentials: true }
      );

      login(response.data.role); // Update role in context
      onClose(); // Close modal after login
    } catch (err) {
      console.error("Login Error:", err.message || err.response?.data || err);
      setError("Invalid username or password");
    }
  };

  if (!isOpen) return null; // Don't render if modal is closed

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
        {/* Exit Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg"
          aria-label="Close Modal"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mt-4">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button
            type="submit"
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded w-full"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
