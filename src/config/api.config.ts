export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  ENDPOINTS: {
    LESSONS: '/lessons',
    LESSONS_WITH_PROGRESS: '/lessons/with-progress/all',
    LESSON_BY_ID: (id: number) => `/lessons/${id}`,
    UPDATE_PROGRESS: '/lessons/progress',
    USER_STATS: '/lessons/stats/me',
    RECOMMENDED_PRACTICE: '/lessons/recommended-practice',
  },
  TIMEOUT: 10000, // 10 seconds
};

// Helper để get full URL
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

