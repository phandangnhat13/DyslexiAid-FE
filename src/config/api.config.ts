export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  ENDPOINTS: {
    LESSONS: '/lessons',
    LESSONS_WITH_PROGRESS: '/lessons/with-progress/all',
    LESSON_BY_ID: (id: number) => `/lessons/${id}`,
    UPDATE_PROGRESS: '/lessons/progress',
    ALL_PROGRESS: '/lessons/progress/all',
    USER_STATS: '/lessons/stats/me',
    RECOMMENDED_PRACTICE: '/lessons/recommended-practice',
    // Lesson Attempts (History)
    ALL_ATTEMPTS: '/lessons/attempts/all',
    LESSON_ATTEMPTS: (lessonId: number) => `/lessons/attempts/${lessonId}`,
    GENERATE_LESSON: '/ai/generate-lesson',
    // Achievements
    ACHIEVEMENTS: '/achievements',
    ACHIEVEMENTS_LOG: '/achievements/log',
    ACHIEVEMENTS_LOGS: '/achievements/logs',
    ACHIEVEMENTS_DEFINITIONS: '/achievements/definitions',
    // Phonetic Errors
    PHONETIC_ERRORS_ME: '/ai/phonetic-errors/me',
    GENERATE_PHONETIC_LESSONS: '/ai/generate-phonetic-lessons',
    ANALYZE_PHONETIC_ERRORS: '/ai/analyze-phonetic-errors',
  },
  TIMEOUT: 10000, // 10 seconds
};

// Helper để get full URL
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

