/**
 * Auth Service - Tích hợp với Backend API
 * Xử lý authentication: login, register, logout
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ==================== Types ====================

export interface User {
  user_id: string;
  user_name: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  avatar?: string;
  gender?: 'MALE' | 'FEMALE';
  phone_number?: string;
  date_of_birth?: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  user_name: string;
  password: string;
  full_name: string;
  email: string;
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  date_of_birth?: string;
  gender?: 'MALE' | 'FEMALE';
  phone_number?: string;
  avatar?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthResult {
  success: boolean;
  message?: string;
  user?: User;
  accessToken?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// ==================== Auth Service ====================

export class AuthService {
  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Đăng nhập thất bại',
        };
      }

      const data: AuthResponse = await response.json();

      // Backend sets token in cookies with name 'access_token'
      // Extract from cookies first (backend sends it as httpOnly cookie)
      let accessToken = this.extractTokenFromCookies('access_token');
      
      // Fallback: check response body (in case backend sends it there too)
      if (!accessToken && data.accessToken) {
        accessToken = data.accessToken;
      }
      
      console.log('[AuthService] Login response data:', {
        hasAccessTokenInResponse: !!data.accessToken,
        hasCookieToken: !!this.extractTokenFromCookies('access_token'),
        cookiesAvailable: document.cookie.length > 0,
        allCookies: document.cookie,
        tokenLength: accessToken?.length,
      });
      
      if (accessToken) {
        this.setAccessToken(accessToken);
        console.log('[AuthService] ✅ Token saved to localStorage with key: accessToken');
        console.log('[AuthService] Token preview:', accessToken.substring(0, 20) + '...');
        
        // Verify token was saved
        const savedToken = localStorage.getItem('accessToken');
        console.log('[AuthService] Token verification:', savedToken ? '✅ Saved successfully' : '❌ Failed to save');
        if (savedToken) {
          console.log('[AuthService] Saved token preview:', savedToken.substring(0, 20) + '...');
        }
      } else {
        console.error('[AuthService] ❌ No access token found in response or cookies!');
        console.error('[AuthService] Response data:', data);
        console.error('[AuthService] All cookies:', document.cookie);
        console.error('[AuthService] ⚠️ This will cause authentication issues!');
      }

      // Save user info
      this.setUser(data.user);

      console.log('✅ Login successful:', data.user.user_name);

      return {
        success: true,
        message: data.message,
        user: data.user,
        accessToken,
      };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: error.message || 'Lỗi kết nối đến server',
      };
    }
  }

  /**
   * Register new user
   */
  static async register(data: RegisterRequest): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          role: data.role || 'STUDENT', // Default role
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Đăng ký thất bại',
        };
      }

      const responseData: AuthResponse = await response.json();

      // Extract access token
      const accessToken = responseData.accessToken || this.extractTokenFromCookies('access_token');
      
      if (accessToken) {
        this.setAccessToken(accessToken);
      }

      // Save user info
      this.setUser(responseData.user);

      console.log('✅ Register successful:', responseData.user.user_name);

      return {
        success: true,
        message: responseData.message,
        user: responseData.user,
        accessToken,
      };
    } catch (error: any) {
      console.error('❌ Register error:', error);
      return {
        success: false,
        message: error.message || 'Lỗi kết nối đến server',
      };
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      const token = this.getAccessToken();
      
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        }).catch(err => console.error('Logout API error:', err));
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      this.clearAuth();
      console.log('✅ Logged out');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newAccessToken = data.accessToken || this.extractTokenFromCookies('access_token');

      if (newAccessToken) {
        this.setAccessToken(newAccessToken);
        return newAccessToken;
      }

      return null;
    } catch (error) {
      console.error('❌ Refresh token error:', error);
      return null;
    }
  }

  /**
   * Get current user from localStorage
   */
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getCurrentUser();
  }

  /**
   * Get access token from localStorage
   */
  static getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Set access token to localStorage
   */
  static setAccessToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  /**
   * Set user info to localStorage
   */
  static setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Clear all auth data
   */
  static clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Legacy
  }

  /**
   * Extract token from cookies (backend sends token as httpOnly cookie)
   * Note: httpOnly cookies cannot be accessed via JavaScript for security reasons
   * But we can check if cookie exists and get it from response headers
   */
  private static extractTokenFromCookies(name: string): string | null {
    // Try to extract from document.cookie (only works for non-httpOnly cookies)
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const token = parts.pop()?.split(';').shift() || null;
      if (token) {
        console.log(`[AuthService] ✅ Found token in cookies: ${name}`);
        return token;
      }
    }
    console.log(`[AuthService] ⚠️ Token not found in document.cookie (might be httpOnly)`);
    return null;
  }

  /**
   * Forgot password - request password reset code
   */
  static async forgotPassword(email: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Gửi yêu cầu thất bại',
        };
      }

      const data = await response.json();
      console.log('✅ Forgot password email sent:', email);

      return {
        success: true,
        message: data.message || 'Mã xác thực đã được gửi đến email của bạn',
      };
    } catch (error: any) {
      console.error('❌ Forgot password error:', error);
      return {
        success: false,
        message: error.message || 'Lỗi kết nối đến server',
      };
    }
  }

  /**
   * Reset password with verification code
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Đặt lại mật khẩu thất bại',
        };
      }

      const responseData = await response.json();
      console.log('✅ Password reset successful');

      return {
        success: true,
        message: responseData.message || 'Đặt lại mật khẩu thành công',
      };
    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      return {
        success: false,
        message: error.message || 'Lỗi kết nối đến server',
      };
    }
  }

  /**
   * Get auth headers for API requests
   */
  static getAuthHeaders(): HeadersInit {
    const token = this.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<AuthResult> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return {
          success: false,
          message: 'Bạn chưa đăng nhập',
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Đổi mật khẩu thất bại',
        };
      }

      const data = await response.json();
      console.log('✅ Password changed successfully');

      return {
        success: true,
        message: data.message || 'Đổi mật khẩu thành công',
      };
    } catch (error: any) {
      console.error('❌ Change password error:', error);
      return {
        success: false,
        message: error.message || 'Lỗi kết nối đến server',
      };
    }
  }
}

// ==================== Export ====================
export default AuthService;

