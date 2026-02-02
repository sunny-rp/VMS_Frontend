"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  authAPI,
  persistTokens,
  clearPersistedTokens,
  getStoredUser,
  persistUser,
  clearStoredUser,
} from "../services/api";
import { toast } from "sonner";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const normalizeUser = (raw) => {
    const userData = raw?.user || raw?.data || raw || {};

    const fullname =
      userData?.fullname ??
      userData?.fullName ??
      userData?.name ??
      userData?.username ??
      "";

    const roleName =
      userData?.role?.roleName ||
      userData?.roleName ||
      (typeof userData?.role === "string" ? userData.role : null) ||
      (Array.isArray(userData?.roles) ? userData.roles[0] : null) ||
      "user";

    const roles = Array.isArray(userData?.roles)
      ? userData.roles
      : Array.isArray(userData?.role)
        ? userData.role
        : [roleName];

    return {
      ...userData,
      fullname,
      name: userData?.name ?? fullname,
      roleName,
      roles,
    };
  };

  const [user, setUser] = useState(() => {
    const stored = getStoredUser();
    return stored ? normalizeUser(stored) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(getStoredUser()),
  );
  const [isLoading] = useState(false);

  useEffect(() => {
    const handleVisibility = () => {
      const stored = getStoredUser();
      if (!stored) {
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const login = async (credentials, rememberMe = true) => {
    try {
      const response = await authAPI.login(credentials);

      if (response?.success && response?.statusCode === 200) {
        const raw = response.data;
        const userData = raw?.user || raw?.data || raw;

        const accessToken =
          response?.accessToken ||
          response?.token ||
          response?.data?.accessToken ||
          response?.data?.token ||
          response?.data?.tokens?.accessToken ||
          response?.data?.tokens?.token ||
          response?.data?.token?.accessToken ||
          response?.data?.token?.token ||
          null;

        const refreshToken =
          response?.refreshToken ||
          response?.data?.refreshToken ||
          response?.data?.tokens?.refreshToken ||
          response?.data?.token?.refreshToken ||
          null;

        if (accessToken || refreshToken)
          persistTokens({ accessToken, refreshToken, rememberMe });

        const normalizedUser = normalizeUser(userData);

        setUser((prev) =>
          normalizeUser({ ...(prev || {}), ...normalizedUser }),
        );
        setIsAuthenticated(true);

        persistUser(normalizedUser, { rememberMe });

        return { success: true, data: normalizedUser };
      }

      throw new Error(response?.message || "Login failed");
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.warn("API logout failed, clearing local:", e);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      clearStoredUser();
      clearPersistedTokens();
      toast.success("Logged out successfully", {
        description: "You have been safely logged out",
      });
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  const hasRole = (requiredRoles) => {
    const role =
      user?.role?.roleName ??
      user?.roleName ??
      (typeof user?.role === "string" ? user.role : null) ??
      (Array.isArray(user?.roles) ? user.roles[0] : null);

    if (!role) return false;

    const current = [String(role).toLowerCase()];
    const req = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return req
      .map((r) => String(r).toLowerCase())
      .some((r) => current.includes(r));
  };

  const refreshUser = async () => {
    const stored = getStoredUser();

    if (stored) {
      setUser((prev) => normalizeUser({ ...(prev || {}), ...stored }));
      setIsAuthenticated(true);
      return normalizeUser(stored);
    }

    setUser(null);
    setIsAuthenticated(false);
    return null;
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      register,
      hasRole,
      refreshUser,
    }),
    [user, isAuthenticated, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
