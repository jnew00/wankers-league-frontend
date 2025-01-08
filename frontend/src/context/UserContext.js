import React, { createContext, useState, useContext } from "react";

// Create the context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [role, setRole] = useState("guest"); // Default role

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
