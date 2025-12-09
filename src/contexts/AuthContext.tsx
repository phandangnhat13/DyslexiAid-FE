import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AuthService, { User as ApiUser } from "../services/authService";

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, name: string, password: string) => Promise<AuthResult>;
  updateProfile: (name: string, email: string) => Promise<AuthResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

interface StoredUser {
  id: string;
  username: string;
  password: string;
  email: string;
  name: string;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize default users
  const initializeUsers = () => {
    const storedUsers = localStorage.getItem("users");
    if (!storedUsers) {
      const defaultUsers: StoredUser[] = [
        {
          id: "1",
          username: "demo",
          password: "demo123",
          email: "demo@example.com",
          name: "Demo User",
        },
        {
          id: "2",
          username: "admin",
          password: "admin123",
          email: "admin@example.com",
          name: "Admin User",
        },
      ];
      localStorage.setItem("users", JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(storedUsers);
  };

  const getUsers = (): StoredUser[] => {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : initializeUsers();
  };

  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem("users", JSON.stringify(users));
  };

  // Convert API user to local User format
  const convertApiUser = (apiUser: ApiUser): User => {
    return {
      id: apiUser.user_id,
      username: apiUser.user_name,
      email: apiUser.email,
      name: apiUser.full_name,
    };
  };

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    initializeUsers(); // Keep for backward compatibility
    
    // Check for authenticated user from AuthService
    const apiUser = AuthService.getCurrentUser();
    if (apiUser && AuthService.isAuthenticated()) {
      setUser(convertApiUser(apiUser));
    } else {
      // Fallback to old localStorage format for existing users
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("user");
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await AuthService.login(email, password);
      
      if (result.success && result.user) {
        const user = convertApiUser(result.user);
        setUser(user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (
    username: string,
    email: string,
    name: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const result = await AuthService.register({
        user_name: username,
        email,
        full_name: name,
        password,
        role: 'STUDENT', // Default role
      });
      
      if (result.success && result.user) {
        const user = convertApiUser(result.user);
        setUser(user);
        return { success: true, message: result.message };
      }
      
      return { 
        success: false, 
        message: result.message || 'Đăng ký thất bại' 
      };
    } catch (error) {
      console.error("Register error:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Lỗi kết nối' 
      };
    }
  };

  const updateProfile = async (name: string, email: string): Promise<AuthResult> => {
    if (!user) {
      return { success: false, message: "Không tìm thấy người dùng" };
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = getUsers();
    
    // Check if email is taken by another user
    const emailTaken = users.find((u) => u.email === email && u.id !== user.id);
    if (emailTaken) {
      return { success: false, message: "Email đã được sử dụng bởi tài khoản khác" };
    }

    // Update user in users list
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, name, email } : u
    );
    saveUsers(updatedUsers);

    // Update current user
    const updatedUser = { ...user, name, email };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    return { success: true };
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<AuthResult> => {
    if (!user) {
      return { success: false, message: "Không tìm thấy người dùng" };
    }

    try {
      const result = await AuthService.changePassword(currentPassword, newPassword, newPassword);
      
      if (result.success) {
        return { success: true, message: result.message };
      }
      
      return { 
        success: false, 
        message: result.message || 'Đổi mật khẩu thất bại' 
      };
    } catch (error) {
      console.error("Change password error:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Lỗi kết nối' 
      };
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    
    // Clear local recordings data when logout
    localStorage.removeItem('audio_recordings');
    
    // Optional: Clear IndexedDB (recordings storage)
    try {
      const dbRequest = indexedDB.deleteDatabase('phraseFixerDB');
      dbRequest.onsuccess = () => console.log('Local recordings cleared');
    } catch (error) {
      console.error('Failed to clear local DB:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

