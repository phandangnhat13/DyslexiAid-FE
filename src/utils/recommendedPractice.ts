import { Lesson, LessonWithProgress } from "@/services/lessonService";

/**
 * Bài tập đề xuất - Bài mới ngoài lộ trình
 * Random bài tập mới dựa trên tiến độ hiện tại
 */

export interface RecommendedPracticeLesson extends Lesson {
  reason: string;
  difficulty: string;
}

// Map difficulty Vietnamese to key
const difficultyMap: Record<string, string> = {
  'Dễ': 'EASY',
  'Trung bình': 'MEDIUM',
  'Khó': 'HARD',
};

/**
 * Xác định độ khó hiện tại của user dựa trên tiến độ
 */
const getCurrentDifficulty = (lessons: LessonWithProgress[]): string | null => {
  // Lấy các bài đã hoàn thành
  const completedLessons = lessons.filter(l => l.isCompleted && l.attemptCount > 0);
  
  if (completedLessons.length === 0) {
    // Chưa có bài nào hoàn thành → đề xuất EASY
    return 'Dễ';
  }
  
  // Lấy bài có điểm cao nhất
  const bestLesson = completedLessons.reduce((best, current) => {
    return (current.bestAccuracy > best.bestAccuracy) ? current : best;
  });
  
  // Trả về độ khó của bài tốt nhất
  return bestLesson.difficulty;
};

/**
 * Random bài tập mới ngoài lộ trình
 * @param allLessons - Tất cả bài học từ DB
 * @param completedLessonIds - Danh sách ID bài đã làm (trong lộ trình)
 * @param currentDifficulty - Độ khó hiện tại của user
 * @param count - Số lượng bài cần random
 */
export const getRecommendedPracticeLessons = (
  allLessons: Lesson[],
  completedLessonIds: number[],
  currentDifficulty: string | null,
  count: number = 12
): RecommendedPracticeLesson[] => {
  
  // Lọc bài chưa làm (không có trong lộ trình đã học)
  const uncompletedLessons = allLessons.filter(
    lesson => !completedLessonIds.includes(lesson.id) && !lesson.locked
  );
  
  if (uncompletedLessons.length === 0) {
    return [];
  }
  
  // Xác định độ khó để filter
  let targetDifficulty: string;
  if (currentDifficulty) {
    // Lọc theo độ khó hiện tại
    targetDifficulty = currentDifficulty;
  } else {
    // Chưa có tiến độ → đề xuất bài dễ
    targetDifficulty = 'Dễ';
  }
  
  // Lọc bài cùng độ khó
  let filteredLessons = uncompletedLessons.filter(
    lesson => lesson.difficulty === targetDifficulty
  );
  
  // Nếu không đủ bài cùng độ khó, mở rộng sang độ khó tương tự
  if (filteredLessons.length < count) {
    const difficultyLevels = ['Dễ', 'Trung bình', 'Khó'];
    const currentIndex = difficultyLevels.indexOf(targetDifficulty);
    
    // Thêm bài độ khó gần (trước và sau)
    const nearbyDifficulties: string[] = [];
    if (currentIndex > 0) nearbyDifficulties.push(difficultyLevels[currentIndex - 1]);
    if (currentIndex < difficultyLevels.length - 1) nearbyDifficulties.push(difficultyLevels[currentIndex + 1]);
    
    const additionalLessons = uncompletedLessons.filter(
      lesson => nearbyDifficulties.includes(lesson.difficulty)
    );
    
    filteredLessons = [...filteredLessons, ...additionalLessons];
  }
  
  // Nếu vẫn không đủ, lấy tất cả bài chưa làm
  if (filteredLessons.length < count) {
    filteredLessons = uncompletedLessons;
  }
  
  // Random và shuffle
  const shuffled = [...filteredLessons].sort(() => Math.random() - 0.5);
  
  // Lấy số lượng cần thiết
  const selected = shuffled.slice(0, count);
  
  // Map thành RecommendedPracticeLesson với reason
  return selected.map(lesson => ({
    ...lesson,
    reason: getReasonMessage(lesson.difficulty, targetDifficulty),
    difficulty: lesson.difficulty,
  }));
};

/**
 * Tạo message lý do đề xuất
 */
const getReasonMessage = (lessonDifficulty: string, targetDifficulty: string): string => {
  if (lessonDifficulty === targetDifficulty) {
    return `Bài ${lessonDifficulty} phù hợp với trình độ hiện tại của bạn`;
  }
  
  const difficultyComparison = {
    'Dễ': 0,
    'Trung bình': 1,
    'Khó': 2,
  };
  
  const lessonLevel = difficultyComparison[lessonDifficulty as keyof typeof difficultyComparison] ?? 0;
  const targetLevel = difficultyComparison[targetDifficulty as keyof typeof difficultyComparison] ?? 0;
  
  if (lessonLevel < targetLevel) {
    return `Bài ${lessonDifficulty} để ôn lại kiến thức`;
  } else {
    return `Bài ${lessonDifficulty} để thử thách bản thân`;
  }
};

/**
 * Get recommended practice lessons based on user progress
 * Main function để sử dụng trong component
 */
export const getRecommendedPractice = (
  allLessons: LessonWithProgress[],
  count: number = 12
): RecommendedPracticeLesson[] => {
  
  // Lấy danh sách ID bài đã làm (có attemptCount > 0)
  const completedLessonIds = allLessons
    .filter(l => l.attemptCount > 0)
    .map(l => l.id);
  
  // Xác định độ khó hiện tại
  const currentDifficulty = getCurrentDifficulty(allLessons);
  
  // Convert to Lesson[] (loại bỏ progress info)
  const lessons: Lesson[] = allLessons.map(({ isCompleted, bestAccuracy, attemptCount, lastAttemptDate, ...lesson }) => lesson);
  
  // Get recommended practice lessons
  return getRecommendedPracticeLessons(
    lessons,
    completedLessonIds,
    currentDifficulty,
    count
  );
};

