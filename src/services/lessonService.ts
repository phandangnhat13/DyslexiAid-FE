import { fallbackLessons } from "@/data/lessons";
import { API_CONFIG, getApiUrl } from "@/config/api.config";

// ==================== TYPES ====================
export interface Lesson {
  id: number;
  title: string;
  level: number;
  difficulty: string;
  text: string;
  wordCount: number;
  description: string;
  locked: boolean;
}

export interface LessonWithProgress extends Lesson {
  isCompleted: boolean;
  bestAccuracy: number;
  attemptCount: number;
  lastAttemptDate?: string;
}

export interface WordCountRange {
  label: string;
  labelVi: string;
  min: number;
  max: number;
  description: string;
  color: string;
  emoji: string;
}

export interface ProgressUpdateResult {
  isCompleted: boolean;
  bestAccuracy: number;
  attemptCount: number;
  isNewBest: boolean;
}

// ==================== SERVICE CLASS ====================
class LessonServiceClass {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    // Sử dụng AuthService để lấy token (đúng key: 'accessToken')
    const token = localStorage.getItem('accessToken');
    
    // Debug: Check all localStorage keys
    console.log('[LessonService] Checking localStorage for tokens...');
    console.log('[LessonService] accessToken:', token ? '✅ Found' : '❌ Not found');
    console.log('[LessonService] All localStorage keys:', Object.keys(localStorage));
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`[LessonService] ✅ Making authenticated request to: ${url}`);
      console.log(`[LessonService] Token preview: ${token.substring(0, 20)}...`);
    } else {
      console.error(`[LessonService] ❌ No token found for request: ${url}`);
      console.error(`[LessonService] Available localStorage keys:`, Object.keys(localStorage));
    }
    
    return fetch(url, { ...options, headers, credentials: 'include' });
  }

  async getAllLessons(): Promise<Lesson[]> {
    try {
      const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.LESSONS));
      
      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }
      
      const data = await response.json();
      console.log('📚 Fetched lessons from API:', data.length);
      return data;
    } catch (error) {
      console.error('Error fetching lessons, using fallback:', error);
      // Fallback to local data if API fails
      return fallbackLessons.map(lesson => ({
        ...lesson,
        difficulty: lesson.difficulty as string,
      }));
    }
  }

  async getLessonsWithProgress(): Promise<LessonWithProgress[]> {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        // User is authenticated - fetch from API with progress
        const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.LESSONS_WITH_PROGRESS));
        
        if (response.ok) {
          const data = await response.json();
          console.log('📚 Fetched lessons with progress from API:', data.length);
          return data;
        }
      }
      
      // Not authenticated or API failed - use local data
      console.log('📚 Using local lessons data');
      const lessons = await this.getAllLessons();
      const savedProgress = JSON.parse(localStorage.getItem('lessonProgress') || '{}');
      const savedCompleted = JSON.parse(localStorage.getItem('completedLessons') || '[]');
      
      return lessons.map(lesson => {
        const progress = savedProgress[lesson.id];
        return {
          ...lesson,
          isCompleted: progress?.isCompleted || savedCompleted.includes(lesson.id) || false,
          bestAccuracy: progress?.bestAccuracy || 0,
          attemptCount: progress?.attemptCount || 0,
          lastAttemptDate: progress?.lastAttemptDate,
        };
      });
    } catch (error) {
      console.error('Error fetching lessons with progress:', error);
      return [];
    }
  }

  async updateProgress(lessonId: number, accuracy: number): Promise<ProgressUpdateResult> {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        // User is authenticated - save to API
        const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_PROGRESS), {
          method: 'POST',
          body: JSON.stringify({
            lesson_id: lessonId,
            accuracy: accuracy,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Progress saved to API:', data);
          return data;
        }
      }
      
      // Fallback to localStorage
      console.log('📊 Saving progress to localStorage');
      const savedProgress = JSON.parse(localStorage.getItem('lessonProgress') || '{}');
      const savedCompleted = JSON.parse(localStorage.getItem('completedLessons') || '[]');
      
      const currentProgress = savedProgress[lessonId] || {
        bestAccuracy: 0,
        attemptCount: 0,
        isCompleted: false,
      };
      
      const newBestAccuracy = Math.max(currentProgress.bestAccuracy, accuracy);
      const newAttemptCount = currentProgress.attemptCount + 1;
      const isCompleted = currentProgress.isCompleted || accuracy >= 80;
      const isNewBest = newBestAccuracy > currentProgress.bestAccuracy;
      
      savedProgress[lessonId] = {
        bestAccuracy: newBestAccuracy,
        attemptCount: newAttemptCount,
        isCompleted,
        lastAttemptDate: new Date().toISOString(),
      };
      localStorage.setItem('lessonProgress', JSON.stringify(savedProgress));
      
      if (isCompleted && !savedCompleted.includes(lessonId)) {
        savedCompleted.push(lessonId);
        localStorage.setItem('completedLessons', JSON.stringify(savedCompleted));
      }
      
      return { isCompleted, bestAccuracy: newBestAccuracy, attemptCount: newAttemptCount, isNewBest };
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  async getLessonById(id: number): Promise<Lesson | null> {
    try {
      const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.LESSON_BY_ID(id)));
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      // Fallback
      const lesson = fallbackLessons.find(l => l.id === id);
      if (!lesson) return null;
      return { ...lesson, difficulty: lesson.difficulty as string };
    } catch (error) {
      console.error('Error fetching lesson by ID:', error);
      return null;
    }
  }

  async getRecommendedPractice(): Promise<Lesson[]> {
    try {
      // Kiểm tra token trước khi gọi API (đúng key: 'accessToken')
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('⚠️ No access token found. User might need to login.');
        return [];
      }
      
      const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.RECOMMENDED_PRACTICE));
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ API Error ${response.status}: ${errorText}`);
        
        // If 401 Unauthorized, token might be invalid or expired
        if (response.status === 401 || response.status === 403) {
          console.warn('⚠️ Authentication error. Token might be invalid or expired.');
          // Clear invalid token
          localStorage.removeItem('accessToken');
          // Optionally redirect to login (but ProtectedRoute should handle this)
        }
        
        throw new Error(`Failed to fetch recommended practice: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✨ Fetched recommended practice from API:', data.length);
      return data || [];
    } catch (error) {
      console.error('Error fetching recommended practice:', error);
      console.error('Error details:', error instanceof Error ? error.message : error);
      // Fallback: return empty array
      return [];
    }
  }
}

// ==================== EXPORT ====================
const LessonService = new LessonServiceClass();
export default LessonService;
