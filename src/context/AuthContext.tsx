import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  name: string;
  nationality: string;
  email: string;
  plan: string;
  advisor: string;
  advisorRole: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const mockUser: User = {
  name: "Carlos García",
  nationality: "México",
  email: "carlos.garcia@email.com",
  plan: "active",
  advisor: "María López",
  advisorRole: "Asesora Migratoria",
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider
      value={{ user: isAuthenticated ? mockUser : null, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
