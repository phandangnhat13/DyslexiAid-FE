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

// AI Generate Lesson Types
export interface GenerateLessonRequest {
  standardScript: string;
  childScript: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface ErrorAnalysis {
  word: string;
  childRead: string;
  errorType: string;
  position: number;
}

export interface GeneratedLessonResponse {
  errors: ErrorAnalysis[];
  suggestedLesson: {
    title: string;
    script: string;
    focusAreas: string[];
  };
}

export interface ProgressUpdateResult {
  isCompleted: boolean;
  bestAccuracy: number;
  attemptCount: number;
  isNewBest: boolean;
}

// User Stats - thống kê tổng quan
export interface UserStats {
  totalLessons: number;
  completedLessons: number;
  totalAttempts: number;
  averageAccuracy: number;
  bestAccuracy: number;
  completionRate: number;
}

// User Progress - tiến trình từng bài
export interface UserProgress {
  id?: number;
  lessonId: number;
  lessonTitle?: string;
  isCompleted: boolean;
  bestAccuracy: number;
  attemptCount: number;
  totalScore?: number;
  lastAttemptAt: string | null;
}

// Achievement Types
export interface AchievementDefinition {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string | null;
}

export interface UserAchievement {
  id: number;
  dateEarned: string;
  achievement: AchievementDefinition;
}

export interface CreateSessionLogDto {
  exercises: number;
  score: number;
  progress: number;
}

export interface SessionLog {
  id: number;
  userId: string;
  exercises: number;
  score: number;
  progress: number;
  date: string;
}

// ==================== LESSON ATTEMPT TYPES ====================
export interface LessonAttempt {
  id: number;
  attemptNumber: number;
  accuracy: number;
  transcript?: string | null;
  errorWords?: string[];
  duration?: number | null;
  createdAt: string;
}

// DTO for updating progress with transcript and error words
export interface UpdateProgressDto {
  lesson_id: number;
  accuracy: number;
  transcript?: string;
  duration?: number;
  error_words?: string[];
}

export interface LessonAttemptSummary {
  totalAttempts: number;
  bestAccuracy: number;
  averageAccuracy: number;
  isCompleted: boolean;
  lastAttemptAt?: string | null;
}

export interface LessonAttemptsResponse {
  lessonId: number;
  lessonTitle: string | null;
  lessonText?: string;
  lessonDifficulty?: string;
  attempts: LessonAttempt[];
  summary: LessonAttemptSummary;
}

export interface AllAttemptsItem {
  id: number;
  lessonId: number;
  lessonTitle: string;
  lessonDifficulty: string;
  accuracy: number;
  duration?: number | null;
  createdAt: string;
}

export interface AllAttemptsResponse {
  attempts: AllAttemptsItem[];
  total: number;
}

// ==================== PHONETIC ERROR TYPES ====================
export type PhoneticErrorType = 
  | 'NGONG_L'   // Ngọng L (nhầm N-L)
  | 'NGONG_R'   // Ngọng R (nhầm R-D/GI)
  | 'CH_TR'     // Nhầm CH-TR
  | 'S_X'       // Nhầm S-X
  | 'GI_D'      // Nhầm GI-D
  | 'NG_N'      // Nhầm NG-N
  | 'NH_N'      // Nhầm NH-N
  | 'QU_K';     // Nhầm QU-K

export interface UserPhoneticError {
  id: string;
  user_id: string;
  error_type: PhoneticErrorType;
  error_count: number;
  sample_words: string[];
  last_detected: string;
  created_at: string;
  updated_at: string;
}

export interface PhoneticLesson {
  id?: number; // ID từ database (sau khi đã lưu)
  title: string;
  difficulty: string;
  text: string;
  wordCount: number;
  description: string;
}

export interface GeneratePhoneticLessonsResponse {
  lessons: PhoneticLesson[];
  message?: string;
  error?: boolean;
}

export interface AnalyzePhoneticErrorsRequest {
  standardScript: string;
  childScript: string;
}

export interface DetectedPhoneticError {
  errorType: PhoneticErrorType;
  errorCount: number;
  sampleWords: string[];
}

export interface AnalyzePhoneticErrorsResponse {
  message: string;
  detectedErrors: DetectedPhoneticError[];
}

// Mapping lỗi phát âm sang tiếng Việt
export const PHONETIC_ERROR_LABELS: Record<PhoneticErrorType, { name: string; description: string; emoji: string; color: string }> = {
  NGONG_L: { name: 'Ngọng L', description: 'Nhầm N thành L', emoji: '🔤', color: 'bg-red-100 text-red-800' },
  NGONG_R: { name: 'Ngọng R', description: 'Nhầm R thành D', emoji: '🗣️', color: 'bg-orange-100 text-orange-800' },
  CH_TR: { name: 'Nhầm CH-TR', description: 'Nhầm CH thành TR', emoji: '📝', color: 'bg-yellow-100 text-yellow-800' },
  S_X: { name: 'Nhầm S-X', description: 'Nhầm S thành X', emoji: '✏️', color: 'bg-green-100 text-green-800' },
  GI_D: { name: 'Nhầm GI-D', description: 'Nhầm GI thành D', emoji: '📖', color: 'bg-teal-100 text-teal-800' },
  NG_N: { name: 'Nhầm NG-N', description: 'Nhầm NG thành N', emoji: '🎯', color: 'bg-blue-100 text-blue-800' },
  NH_N: { name: 'Nhầm NH-N', description: 'Nhầm NH thành N', emoji: '🔊', color: 'bg-indigo-100 text-indigo-800' },
  QU_K: { name: 'Nhầm QU-K', description: 'Nhầm QU thành K', emoji: '💬', color: 'bg-purple-100 text-purple-800' },
};

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

  async updateProgress(
    lessonId: number, 
    accuracy: number,
    transcript?: string,
    duration?: number,
    errorWords?: string[],
  ): Promise<ProgressUpdateResult> {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        // User is authenticated - save to API
        const payload: UpdateProgressDto = {
          lesson_id: lessonId,
          accuracy: accuracy,
        };
        
        // Add optional fields if provided
        if (transcript) payload.transcript = transcript;
        if (duration) payload.duration = duration;
        if (errorWords && errorWords.length > 0) payload.error_words = errorWords;
        
        const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_PROGRESS), {
          method: 'POST',
          body: JSON.stringify(payload),
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
      console.log('🎯 [LessonService] Starting getRecommendedPractice...');
      
      // Check token first
      const token = localStorage.getItem('accessToken');
      console.log('🔐 [LessonService] Token exists:', !!token);
      if (!token) {
        console.error('❌ [LessonService] No access token found!');
        return [];
      }
      
      const url = getApiUrl(API_CONFIG.ENDPOINTS.RECOMMENDED_PRACTICE);
      console.log('🌐 [LessonService] API URL:', url);
      
      console.log('📡 [LessonService] Making API request...');
      const response = await this.fetchWithAuth(url);
      
      console.log('📨 [LessonService] Response status:', response.status);
      console.log('📨 [LessonService] Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ [LessonService] API Error ${response.status}: ${errorText}`);
        
        // If 401 Unauthorized, token might be invalid or expired
        if (response.status === 401 || response.status === 403) {
          console.warn('⚠️ [LessonService] Authentication error. Token might be invalid or expired.');
          // Clear invalid token
          localStorage.removeItem('accessToken');
          // Optionally redirect to login (but ProtectedRoute should handle this)
        }
        
        throw new Error(`Failed to fetch recommended practice: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✨ [LessonService] Raw API response:', data);
      console.log('📊 [LessonService] Response type:', typeof data);
      console.log('📏 [LessonService] Response length:', Array.isArray(data) ? data.length : 'Not array');
      
      if (Array.isArray(data)) {
        console.log('✅ [LessonService] Successfully fetched recommended practice:', data.length, 'lessons');
        return data;
      } else {
        console.warn('⚠️ [LessonService] Response is not an array:', data);
        return [];
      }
    } catch (error) {
      console.error('💥 [LessonService] Error fetching recommended practice:', error);
      console.error('🔍 [LessonService] Error details:', error instanceof Error ? error.message : error);
      console.error('📚 [LessonService] Error stack:', error instanceof Error ? error.stack : 'No stack');
      // Fallback: return empty array
      return [];
    }
  }

  // Get user stats (thống kê tổng quan)
  async getUserStats(): Promise<UserStats> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('[LessonService] No token for getUserStats');
        return {
          totalLessons: 0,
          completedLessons: 0,
          totalAttempts: 0,
          averageAccuracy: 0,
          bestAccuracy: 0,
          completionRate: 0,
        };
      }

      const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.USER_STATS));
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 [LessonService] User stats fetched:', data);
        return data;
      }
      
      console.error('[LessonService] Failed to fetch user stats:', response.status);
      throw new Error('Failed to fetch user stats');
    } catch (error) {
      console.error('[LessonService] Error fetching user stats:', error);
      return {
        totalLessons: 0,
        completedLessons: 0,
        totalAttempts: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
        completionRate: 0,
      };
    }
  }

  // Get all progress (tiến trình từng bài)
  async getAllProgress(): Promise<UserProgress[]> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('[LessonService] No token for getAllProgress');
        return [];
      }

      const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.ALL_PROGRESS));
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 [LessonService] All progress fetched:', data.length, 'items');
        return data;
      }
      
      console.error('[LessonService] Failed to fetch all progress:', response.status);
      throw new Error('Failed to fetch all progress');
    } catch (error) {
      console.error('[LessonService] Error fetching all progress:', error);
      return [];
    }
  }

  // Generate lesson using AI based on reading errors
  async generateLesson(request: GenerateLessonRequest): Promise<GeneratedLessonResponse> {
    console.log('[LessonService] 🤖 Calling generateLesson API...', request);
    
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.GENERATE_LESSON);
      console.log('[LessonService] 📡 Making request to:', url);
      
      const response = await this.fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(request),
      });
      
      console.log('[LessonService] 📥 Generate lesson response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[LessonService] ❌ Generate lesson failed:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[LessonService] ✅ Generated lesson data:', data);
      
      return data;
    } catch (error) {
      console.error('[LessonService] 💥 generateLesson failed:', error);
      console.error('[LessonService] 🔍 Error details:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  // ==================== ACHIEVEMENTS ====================

  // Lấy danh sách thành tựu đã đạt được của user
  async getUserAchievements(): Promise<UserAchievement[]> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('[LessonService] No token for getUserAchievements');
        return [];
      }

      const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.ACHIEVEMENTS));
      
      if (response.ok) {
        const data = await response.json();
        console.log('🏆 [LessonService] User achievements fetched:', data);
        return data;
      }
      
      console.error('[LessonService] Failed to fetch achievements:', response.status);
      return [];
    } catch (error) {
      console.error('[LessonService] Error fetching achievements:', error);
      return [];
    }
  }

  // Ghi nhật ký phiên luyện tập (triggers achievement check)
  async createSessionLog(sessionData: CreateSessionLogDto): Promise<SessionLog | null> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('[LessonService] No token for createSessionLog');
        return null;
      }

      const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.ACHIEVEMENTS_LOG), {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📝 [LessonService] Session log created:', data);
        return data;
      }
      
      console.error('[LessonService] Failed to create session log:', response.status);
      return null;
    } catch (error) {
      console.error('[LessonService] Error creating session log:', error);
      return null;
    }
  }

  // Lấy lịch sử phiên luyện tập
  async getSessionLogs(): Promise<SessionLog[]> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('[LessonService] No token for getSessionLogs');
        return [];
      }

      const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.ACHIEVEMENTS_LOGS));
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 [LessonService] Session logs fetched:', data);
        return data;
      }
      
      console.error('[LessonService] Failed to fetch session logs:', response.status);
      return [];
    } catch (error) {
      console.error('[LessonService] Error fetching session logs:', error);
      return [];
    }
  }

  // ==================== LESSON ATTEMPTS (HISTORY) ====================

  // Lấy lịch sử làm bài cho một lesson cụ thể
  async getLessonAttempts(lessonId: number): Promise<LessonAttemptsResponse | null> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('[LessonService] No token for getLessonAttempts');
        return null;
      }

      const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.LESSON_ATTEMPTS(lessonId)));
      
      if (response.ok) {
        const data = await response.json();
        console.log('📜 [LessonService] Lesson attempts fetched:', data);
        return data;
      }
      
      console.error('[LessonService] Failed to fetch lesson attempts:', response.status);
      return null;
    } catch (error) {
      console.error('[LessonService] Error fetching lesson attempts:', error);
      return null;
    }
  }

  // Lấy tất cả lịch sử làm bài của user
  async getAllAttempts(): Promise<AllAttemptsResponse | null> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('[LessonService] No token for getAllAttempts');
        return null;
      }

      const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.ALL_ATTEMPTS));
      
      if (response.ok) {
        const data = await response.json();
        console.log('📜 [LessonService] All attempts fetched:', data);
        return data;
      }
      
      console.error('[LessonService] Failed to fetch all attempts:', response.status);
      return null;
    } catch (error) {
      console.error('[LessonService] Error fetching all attempts:', error);
      return null;
    }
  }

  // ==================== PHONETIC ERRORS ====================

  // Lấy danh sách lỗi phát âm của user hiện tại
  async getUserPhoneticErrors(): Promise<UserPhoneticError[]> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('[LessonService] No token for getUserPhoneticErrors');
        return [];
      }

      const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.PHONETIC_ERRORS_ME));
      
      if (response.ok) {
        const data = await response.json();
        console.log('🗣️ [LessonService] User phonetic errors fetched:', data);
        return data;
      }
      
      console.error('[LessonService] Failed to fetch phonetic errors:', response.status);
      return [];
    } catch (error) {
      console.error('[LessonService] Error fetching phonetic errors:', error);
      return [];
    }
  }

  // Tạo bài học dựa trên lỗi phát âm của user
  async generatePhoneticLessons(difficulty: string = 'Dễ', count: number = 3): Promise<GeneratePhoneticLessonsResponse> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('[LessonService] No token for generatePhoneticLessons');
        return { lessons: [], message: 'Vui lòng đăng nhập' };
      }

      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.GENERATE_PHONETIC_LESSONS)}?difficulty=${encodeURIComponent(difficulty)}&count=${count}`;
      const response = await this.fetchWithAuth(url, { method: 'POST' });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📚 [LessonService] Phonetic lessons generated:', data);
        return data;
      }
      
      console.error('[LessonService] Failed to generate phonetic lessons:', response.status);
      return { lessons: [], message: 'Không thể tạo bài học lúc này' };
    } catch (error) {
      console.error('[LessonService] Error generating phonetic lessons:', error);
      return { lessons: [], message: 'Đã xảy ra lỗi khi tạo bài học' };
    }
  }

  // Phân tích lỗi phát âm từ bài đọc (gọi sau khi user đọc xong)
  async analyzePhoneticErrors(standardScript: string, childScript: string): Promise<AnalyzePhoneticErrorsResponse | null> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('[LessonService] No token for analyzePhoneticErrors');
        return null;
      }

      const response = await this.fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.ANALYZE_PHONETIC_ERRORS), {
        method: 'POST',
        body: JSON.stringify({ standardScript, childScript }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [LessonService] Phonetic errors analyzed:', data);
        return data;
      }
      
      console.error('[LessonService] Failed to analyze phonetic errors:', response.status);
      return null;
    } catch (error) {
      console.error('[LessonService] Error analyzing phonetic errors:', error);
      return null;
    }
  }
}

// ==================== EXPORT ====================
const LessonService = new LessonServiceClass();
export default LessonService;
