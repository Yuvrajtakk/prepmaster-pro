import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("examprep_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("examprep_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Basic validation
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    if (password.length < 6) {
      return { success: false, error: "Invalid credentials" };
    }

    // Check stored users
    const storedUsers = JSON.parse(localStorage.getItem("examprep_users") || "[]");
    const existingUser = storedUsers.find((u: any) => u.email === email);
    
    if (existingUser && existingUser.password === password) {
      const userData = { id: existingUser.id, email: existingUser.email, name: existingUser.name };
      setUser(userData);
      localStorage.setItem("examprep_user", JSON.stringify(userData));
      return { success: true };
    }

    // For demo: allow any login with valid format
    const userData = { 
      id: crypto.randomUUID(), 
      email, 
      name: email.split("@")[0] 
    };
    setUser(userData);
    localStorage.setItem("examprep_user", JSON.stringify(userData));
    return { success: true };
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    // Check if user already exists
    const storedUsers = JSON.parse(localStorage.getItem("examprep_users") || "[]");
    if (storedUsers.some((u: any) => u.email === email)) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Create new user
    const newUser = { id: crypto.randomUUID(), name, email, password };
    storedUsers.push(newUser);
    localStorage.setItem("examprep_users", JSON.stringify(storedUsers));

    const userData = { id: newUser.id, email: newUser.email, name: newUser.name };
    setUser(userData);
    localStorage.setItem("examprep_user", JSON.stringify(userData));
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("examprep_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
