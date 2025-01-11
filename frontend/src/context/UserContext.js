import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [role, setRole] = useState("guest"); // Default role

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/validate`, {
          withCredentials: true, 
        });
        setRole(response.data.role); 
        localStorage.setItem("role", response.data.role); 
      } catch (error) {
        console.error("Session validation failed:", error.message);
        setRole("guest"); 
        localStorage.removeItem("role");
      }
    };

    validateSession(); 
  }, []); 

  const login = (newRole) => {
    setRole(newRole);
    localStorage.setItem("role", newRole);
  };

  const logout = () => {
    setRole("guest"); 
    localStorage.removeItem("role");
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
