import { Lesson, LessonWithProgress } from "@/services/lessonService";

/**
 * Recommendation strategy for lessons
 * Chiến lược đề xuất bài học dựa trên nhiều yếu tố
 */

export interface RecommendationReason {
  type: 'next' | 'review' | 'similar' | 'challenge' | 'incomplete' | 'practice';
  message: string;
  priority: number; // 1-5, higher is more important
}

export interface RecommendedLesson extends Lesson {
  reason: RecommendationReason;
  progress?: {
    isCompleted: boolean;
    bestAccuracy: number;
    attemptCount: number;
  };
}

// Type guard
const hasProgress = (lesson: Lesson | LessonWithProgress): lesson is LessonWithProgress => {
  return 'isCompleted' in lesson;
};

/**
 * Get recommended lessons based on user progress
 */
export const getRecommendedLessons = (
  allLessons: (Lesson | LessonWithProgress)[],
  maxRecommendations: number = 6
): RecommendedLesson[] => {
  const recommendations: RecommendedLesson[] = [];

  // Separate completed and incomplete lessons
  const completedLessons = allLessons.filter(l => 
    hasProgress(l) && l.isCompleted
  ) as LessonWithProgress[];
  
  const incompleteLessons = allLessons.filter(l => 
    !hasProgress(l) || !l.isCompleted
  );

  const attemptedButNotCompleted = allLessons.filter(l =>
    hasProgress(l) && l.attemptCount > 0 && !l.isCompleted
  ) as LessonWithProgress[];

  // Strategy 1: Bài đã thử nhưng chưa hoàn thành (độ ưu tiên cao nhất)
  attemptedButNotCompleted
    .sort((a, b) => b.bestAccuracy - a.bestAccuracy) // Sort by best accuracy
    .slice(0, 2)
    .forEach(lesson => {
      recommendations.push({
        ...lesson,
        reason: {
          type: 'incomplete',
          message: `Bạn đã đạt ${lesson.bestAccuracy.toFixed(0)}%. Cố gắng thêm chút nữa để hoàn thành!`,
          priority: 5
        },
        progress: {
          isCompleted: lesson.isCompleted,
          bestAccuracy: lesson.bestAccuracy,
          attemptCount: lesson.attemptCount
        }
      });
    });

  // Strategy 2: Bài cần ôn lại (điểm thấp)
  completedLessons
    .filter(l => l.bestAccuracy < 85) // Completed but with low accuracy
    .sort((a, b) => a.bestAccuracy - b.bestAccuracy)
    .slice(0, 2)
    .forEach(lesson => {
      recommendations.push({
        ...lesson,
        reason: {
          type: 'review',
          message: `Ôn lại để nâng cao điểm số từ ${lesson.bestAccuracy.toFixed(0)}%`,
          priority: 4
        },
        progress: {
          isCompleted: lesson.isCompleted,
          bestAccuracy: lesson.bestAccuracy,
          attemptCount: lesson.attemptCount
        }
      });
    });

  // Strategy 3: Bài tiếp theo trong lộ trình
  if (completedLessons.length > 0) {
    // Find the highest completed level
    const highestCompletedLevel = Math.max(...completedLessons.map(l => l.level));
    
    // Recommend next level lessons
    const nextLevelLessons = incompleteLessons
      .filter(l => l.level === highestCompletedLevel || l.level === highestCompletedLevel + 1)
      .filter(l => !l.locked)
      .sort((a, b) => a.level - b.level || a.id - b.id)
      .slice(0, 3);

    nextLevelLessons.forEach(lesson => {
      if (!recommendations.find(r => r.id === lesson.id)) {
        recommendations.push({
          ...lesson,
          reason: {
            type: 'next',
            message: lesson.level === highestCompletedLevel 
              ? 'Tiếp tục cấp độ hiện tại'
              : 'Thử thách cấp độ mới',
            priority: 3
          },
          progress: hasProgress(lesson) ? {
            isCompleted: lesson.isCompleted,
            bestAccuracy: lesson.bestAccuracy,
            attemptCount: lesson.attemptCount
          } : undefined
        });
      }
    });
  } else {
    // No completed lessons yet - recommend easiest ones
    const easiestLessons = incompleteLessons
      .filter(l => !l.locked)
      .sort((a, b) => {
        // Sort by level, then by word count
        if (a.level !== b.level) return a.level - b.level;
        return a.wordCount - b.wordCount;
      })
      .slice(0, 3);

    easiestLessons.forEach(lesson => {
      recommendations.push({
        ...lesson,
        reason: {
          type: 'next',
          message: 'Bài dễ để bắt đầu',
          priority: 3
        },
        progress: hasProgress(lesson) ? {
          isCompleted: lesson.isCompleted,
          bestAccuracy: lesson.bestAccuracy,
          attemptCount: lesson.attemptCount
        } : undefined
      });
    });
  }

  // Strategy 4: Bài tương tự với bài đã hoàn thành tốt
  if (completedLessons.length > 0) {
    const bestCompletedLesson = [...completedLessons]
      .sort((a, b) => b.bestAccuracy - a.bestAccuracy)[0];

    const similarLessons = incompleteLessons
      .filter(l => !l.locked)
      .filter(l => l.level === bestCompletedLesson.level || l.difficulty === bestCompletedLesson.difficulty)
      .filter(l => !recommendations.find(r => r.id === l.id))
      .slice(0, 2);

    similarLessons.forEach(lesson => {
      recommendations.push({
        ...lesson,
        reason: {
          type: 'similar',
          message: `Cùng độ khó với "${bestCompletedLesson.title}" mà bạn đã làm tốt`,
          priority: 2
        },
        progress: hasProgress(lesson) ? {
          isCompleted: lesson.isCompleted,
          bestAccuracy: lesson.bestAccuracy,
          attemptCount: lesson.attemptCount
        } : undefined
      });
    });
  }

  // Strategy 5: Thử thách (bài khó hơn một chút)
  if (completedLessons.length >= 3) {
    const avgCompletedLevel = completedLessons.reduce((sum, l) => sum + l.level, 0) / completedLessons.length;
    
    const challengeLessons = incompleteLessons
      .filter(l => !l.locked)
      .filter(l => l.level > avgCompletedLevel && l.level <= avgCompletedLevel + 1)
      .filter(l => !recommendations.find(r => r.id === l.id))
      .sort((a, b) => a.level - b.level)
      .slice(0, 1);

    challengeLessons.forEach(lesson => {
      recommendations.push({
        ...lesson,
        reason: {
          type: 'challenge',
          message: 'Thử thách bản thân với bài khó hơn!',
          priority: 1
        },
        progress: hasProgress(lesson) ? {
          isCompleted: lesson.isCompleted,
          bestAccuracy: lesson.bestAccuracy,
          attemptCount: lesson.attemptCount
        } : undefined
      });
    });
  }

  // Sort by priority and return top recommendations
  return recommendations
    .sort((a, b) => b.reason.priority - a.reason.priority)
    .slice(0, maxRecommendations);
};

/**
 * Get personalized message based on progress
 */
export const getPersonalizedMessage = (
  completedCount: number,
  totalCount: number,
  averageAccuracy: number
): { title: string; message: string; emoji: string } => {
  const completionRate = (completedCount / totalCount) * 100;

  if (completedCount === 0) {
    return {
      title: "Bắt đầu hành trình học!",
      message: "Hãy bắt đầu với những bài dễ để làm quen nhé!",
      emoji: "🌱"
    };
  }

  if (completionRate === 100) {
    return {
      title: "Xuất sắc! Hoàn thành tất cả!",
      message: "Bạn có thể ôn lại các bài để nâng cao kỹ năng!",
      emoji: "🏆"
    };
  }

  if (completionRate >= 75) {
    return {
      title: "Sắp hoàn thành rồi!",
      message: "Cố gắng thêm chút nữa để hoàn thành lộ trình!",
      emoji: "⭐"
    };
  }

  if (completionRate >= 50) {
    return {
      title: "Tiến độ tốt!",
      message: "Bạn đang học rất tốt. Tiếp tục phát huy nhé!",
      emoji: "🌟"
    };
  }

  if (completionRate >= 25) {
    return {
      title: "Đang tiến bộ!",
      message: "Hãy duy trì việc học đều đặn mỗi ngày!",
      emoji: "🌿"
    };
  }

  if (averageAccuracy >= 85) {
    return {
      title: "Chất lượng cao!",
      message: "Bạn học rất tốt! Hãy tiếp tục làm thêm bài!",
      emoji: "💎"
    };
  }

  return {
    title: "Tiếp tục cố gắng!",
    message: "Mỗi bài học đều giúp bạn tiến bộ hơn!",
    emoji: "💪"
  };
};

