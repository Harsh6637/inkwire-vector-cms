import React, { createContext, useState, ReactNode } from 'react';

// Types
interface User {
email: string;
}

interface LoginCredentials {
email: string;
password: string;
}

interface LoginResult {
success: boolean;
message?: string;
}

interface AuthContextType {
user: User | null;
login: (credentials: LoginCredentials) => LoginResult;
  logout: () => void;
  validateEmail: (email: string) => boolean;
  checkExistingLogin: () => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials
const HARDCODED = {
  email: 'admin@inkwire.co',
  password: 'P@$word123'
};

const STORAGE_KEY = 'inkwire_user';

export function AuthProvider({ children }: AuthProviderProps){
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  });

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const login = ({ email, password }: LoginCredentials): LoginResult => {
    if (!validateEmail(email)) {
      return { success: false, message: 'Invalid email format.' };
    }

    if (email === HARDCODED.email && password === HARDCODED.password) {
      const userData: User = { email };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      } catch (error) {
        return { success: false, message: 'Failed to save login information.' };
      }
    }

    return { success: false, message: 'Invalid credentials.' };
  };

  const logout = (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      // Handle storage errors silently
      setUser(null);
    }
  };

  const checkExistingLogin = (): boolean => {
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return false;
    }
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    validateEmail,
    checkExistingLogin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}