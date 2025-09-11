"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authData = await authAPI.checkAuth();

        if (authData && authData.success && authData.data) {
          const userData = authData.data;

          // Create normalized user object with roles array for hasRole function
          const normalizedUser = {
            ...userData,
            roles: [userData.role?.roleName || "user"],
          };

          setUser(normalizedUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials, rememberMe = false) => {
    try {
      const response = await authAPI.login(credentials);

      if (response.success && response.statusCode === 200) {
        const userData = response.data;

        // Create normalized user object with roles array for hasRole function
        const normalizedUser = {
          ...userData,
          roles: [userData.role?.roleName || "user"],
        };

        setUser(normalizedUser);
        setIsAuthenticated(true);

        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("API logout failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Registration failed",
      };
    }
  };

  const hasRole = (requiredRoles) => {
    if (!user || !user.roles) return false;
    if (!Array.isArray(requiredRoles)) requiredRoles = [requiredRoles];
    return requiredRoles.some((role) => user.roles.includes(role));
  };

  const refreshUser = async () => {
    try {
      const authData = await authAPI.checkAuth();
      if (authData && authData.success && authData.data) {
        const userData = authData.data;
        const normalizedUser = {
          ...userData,
          roles: [userData.role?.roleName || "user"],
        };
        setUser(normalizedUser);
        setIsAuthenticated(true);
        return normalizedUser;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
    } catch (error) {
      console.error("User refresh failed:", error);
      return null;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    hasRole,
    refreshUser, // Add refreshUser method
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
