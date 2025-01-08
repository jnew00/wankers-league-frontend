import React, { useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useUser(); // Use login function from UserContext

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "/api/auth/login",
        { username, password },
        { withCredentials: true }
      );

      console.log("Login Response:", response.data);

      // Update the user's role in context
      login(response.data.role); // Correctly set the role in the context
    } catch (error) {
      console.error("Login Error:", error.message || error.response?.data || error);
      alert("Invalid username or password");
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto mt-8">
      <div>
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border"
          required
        />
      </div>
      <div className="mt-4">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border"
          required
        />
      </div>
      <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">
        Login
      </button>
    </form>
  );
};

export default Login;
