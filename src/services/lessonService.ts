/**
 * Lesson Service - Tích hợp với Backend API
 * Xử lý lessons: lấy danh sách, lấy theo level, cập nhật tiến trình
 */

import AuthService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Helper function to make authenticated requests with auto token refresh
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    ...AuthService.getAuthHeaders(),
    ...options.headers,
  };

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If unauthorized, try to refresh token and retry
  if (response.status === 401) {
    console.log('🔄 Token expired, attempting refresh...');
    const newToken = await AuthService.refreshToken();
    
    if (newToken) {
      console.log('✅ Token refreshed, retrying request...');
      // Retry with new token
      response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders(),
          ...options.headers,
        },
        credentials: 'include',
      });
    } else {
      console.log('❌ Token refresh failed');
      // Clear auth and redirect to login
      AuthService.clearAuth();
      window.location.href = '/login';
    }
  }

  return response;
}

// ==================== Types ====================

export interface Lesson {
  id: number;
  title: string;
  level: number;
  difficulty: "Dễ" | "Trung bình" | "Khó";
  text: string;
  wordCount: number;
  description: string;
  locked: boolean;
}

export interface LessonWithProgress extends Lesson {
  isCompleted: boolean;
  bestAccuracy: number;
  attemptCount: number;
}

export interface UserProgress {
  lessonId: number;
  isCompleted: boolean;
  bestAccuracy: number;
  attemptCount: number;
  totalScore: number;
  lastAttemptAt: string | null;
}

export interface UserStats {
  totalLessons: number;
  completedLessons: number;
  completionRate: number;
  totalAttempts: number;
  averageAccuracy: number;
  bestAccuracy: number;
}

export interface UpdateProgressResponse {
  message: string;
  isCompleted: boolean;
  bestAccuracy: number;
  attemptCount: number;
  isNewBest: boolean;
}

// ==================== Lesson Service ====================

export class LessonService {
  /**
   * Lấy tất cả bài học (public - không cần auth)
   */
  static async getAllLessons(): Promise<Lesson[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/lessons`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách bài học');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Get lessons error:', error);
      throw error;
    }
  }

  /**
   * Lấy bài học theo level (public)
   */
  static async getLessonsByLevel(level: number): Promise<Lesson[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/lessons/level/${level}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải bài học theo level');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Get lessons by level error:', error);
      throw error;
    }
  }

  /**
   * Lấy bài học theo ID (public)
   */
  static async getLessonById(id: number): Promise<Lesson> {
    try {
      const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không tìm thấy bài học');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Get lesson by ID error:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả bài học kèm tiến trình của user (cần auth)
   */
  static async getLessonsWithProgress(): Promise<LessonWithProgress[]> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/lessons/with-progress/all`, {
        method: 'GET',
      });

      if (!response.ok) {
        // Nếu chưa đăng nhập, trả về lessons không có progress
        if (response.status === 401) {
          const lessons = await this.getAllLessons();
          return lessons.map(lesson => ({
            ...lesson,
            isCompleted: false,
            bestAccuracy: 0,
            attemptCount: 0,
          }));
        }
        throw new Error('Không thể tải bài học');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Get lessons with progress error:', error);
      // Fallback: lấy lessons không có progress
      const lessons = await this.getAllLessons();
      return lessons.map(lesson => ({
        ...lesson,
        isCompleted: false,
        bestAccuracy: 0,
        attemptCount: 0,
      }));
    }
  }

  /**
   * Lấy tiến trình của user cho một bài học
   */
  static async getProgress(lessonId: number): Promise<UserProgress> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/lessons/progress/${lessonId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Không thể tải tiến trình');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Get progress error:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả tiến trình của user
   */
  static async getAllProgress(): Promise<UserProgress[]> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/lessons/progress/all`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Không thể tải tiến trình');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Get all progress error:', error);
      throw error;
    }
  }

  /**
   * Cập nhật tiến trình sau khi hoàn thành bài đọc
   */
  static async updateProgress(lessonId: number, accuracy: number): Promise<UpdateProgressResponse> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/lessons/progress`, {
        method: 'POST',
        body: JSON.stringify({
          lesson_id: lessonId,
          accuracy: accuracy,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể cập nhật tiến trình');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Update progress error:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê tổng quan của user
   */
  static async getUserStats(): Promise<UserStats> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/lessons/stats/me`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Không thể tải thống kê');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Get user stats error:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách ID các bài đã hoàn thành
   */
  static async getCompletedLessonIds(): Promise<number[]> {
    try {
      const progressList = await this.getAllProgress();
      return progressList
        .filter(p => p.isCompleted)
        .map(p => p.lessonId);
    } catch (error) {
      console.error('❌ Get completed lessons error:', error);
      return [];
    }
  }
}

export default LessonService;

