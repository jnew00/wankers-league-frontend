import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [roles, setRoles] = useState(["guest"]); // Default role

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/validate`, {
          withCredentials: true, 
        });
        setRoles(response.data.roles || ["guest"]);
        localStorage.setItem("roles", JSON.stringify(response.data.roles)); 
      } catch (error) {
        console.error("Session validation failed:", error.message);
        setRoles(["guest"]); 
        localStorage.removeItem("roles");
      }
    };

    validateSession(); 
  }, []); 

  const login = (newRoles) => {
    setRoles(newRoles);
    localStorage.setItem("roles", JSON.stringify(newRoles));
  };

  const logout = () => {
    setRoles(["guest"]); 
    localStorage.removeItem("roles");
  };

    // Retrieve roles from localStorage and parse as array
    useEffect(() => {
      const storedRoles = localStorage.getItem("roles");
      if (storedRoles) {
        setRoles(JSON.parse(storedRoles)); // Convert back to array
      }
    }, []);

    const hasRole = (role) => roles.includes(role);

  return (
    <UserContext.Provider value={{ roles, hasRole, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
