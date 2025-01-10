import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

// Create the context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [role, setRole] = useState("guest"); // Default role

  // Validate session on app load
  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/auth/validate", {
          withCredentials: true, // Ensure cookies are sent
        });
        setRole(response.data.role); // Update role if session is valid
      } catch (error) {
        console.error("Session validation failed:", error.message);
        setRole("guest"); // Fallback to guest if validation fails
      }
    };

    validateSession(); // Call the validation function
  }, []); // Run only once on component mount

  const login = (newRole) => {
    setRole(newRole); // Update role after login
  };

  const logout = () => {
    setRole("guest"); // Reset role to guest on logout
  };

  return (
    <UserContext.Provider value={{ role, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for accessing the user context
export const useUser = () => {
  return useContext(UserContext);
};
