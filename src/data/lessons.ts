/**
 * Lesson Types - Re-export from service for backward compatibility
 * Dữ liệu bài học giờ được lấy từ API qua LessonService
 * 
 * Quy định số từ theo độ khó:
 * - Dễ (EASY): 10-30 từ
 * - Trung bình (MEDIUM): 25-60 từ
 * - Khó (HARD): 50+ từ
 */

export type { Lesson, LessonWithProgress, WordCountRange } from '@/services/lessonService';

// Re-export word count constants
export { WORD_COUNT_RANGES, getDifficultyInfo, getWordCountLabel } from '@/constants/word-count.constants';

// Legacy export - Dữ liệu tĩnh (fallback khi API không hoạt động)
export interface LessonLegacy {
  id: number;
  title: string;
  level: number;
  difficulty: "Dễ" | "Trung bình" | "Khó";
  text: string;
  wordCount: number;
  description: string;
  locked: boolean;
}

// Fallback lessons data (chỉ dùng khi API không hoạt động)
export const fallbackLessons: LessonLegacy[] = [
  {
    id: 1,
    title: "Ngày nắng đẹp",
    level: 1,
    difficulty: "Dễ",
    text: "Hôm nay trời nắng đẹp. Bạn Mai đi chơi công viên với bố mẹ. Bạn rất vui vẻ.",
    wordCount: 15,
    description: "Bài luyện cơ bản về thời tiết và gia đình",
    locked: false,
  },
  {
    id: 2,
    title: "Con mèo nhỏ",
    level: 1,
    difficulty: "Dễ",
    text: "Con mèo nhỏ thích uống sữa. Mỗi ngày con mèo đều được cho ăn cá tươi.",
    wordCount: 15,
    description: "Luyện đọc về động vật và thói quen hàng ngày",
    locked: false,
  },
  {
    id: 3,
    title: "Gia đình tôi",
    level: 1,
    difficulty: "Dễ",
    text: "Gia đình tôi có bốn người. Bố mẹ và hai anh em tôi. Chúng tôi yêu thương nhau.",
    wordCount: 15,
    description: "Giới thiệu về gia đình và tình cảm",
    locked: false,
  },
];

// Helper function to get lessons by level (legacy)
export const getLessonsByLevel = (lessons: LessonLegacy[], level: number): LessonLegacy[] => {
  return lessons.filter(lesson => lesson.level === level);
};

// Helper function to get lesson by id (legacy)
export const getLessonById = (lessons: LessonLegacy[], id: number): LessonLegacy | undefined => {
  return lessons.find(lesson => lesson.id === id);
};

// Helper function to get next lesson (legacy)
export const getNextLesson = (lessons: LessonLegacy[], currentId: number): LessonLegacy | undefined => {
  const currentIndex = lessons.findIndex(lesson => lesson.id === currentId);
  if (currentIndex === -1 || currentIndex === lessons.length - 1) return undefined;
  return lessons[currentIndex + 1];
};
