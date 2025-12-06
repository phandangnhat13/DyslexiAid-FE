import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RecommendedLessons } from "@/components/RecommendedLessons";
import { getPersonalizedMessage } from "@/utils/lessonRecommendation";
import LessonService, { type LessonWithProgress, type Lesson } from "@/services/lessonService";
import { Loader2 } from "lucide-react";

const Recommendations = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [recommendedPractice, setRecommendedPractice] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load lessons and recommended practice
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load lessons with progress for personalized message
        const lessonsWithProgress = await LessonService.getLessonsWithProgress();
        setLessons(lessonsWithProgress);

        // Load recommended practice from API
        const practiceLessons = await LessonService.getRecommendedPractice();
        console.log('[Recommendations] ✅ Received recommended practice:', practiceLessons?.length || 0, 'lessons');
        console.log('[Recommendations] Sample lesson:', practiceLessons?.[0]);
        setRecommendedPractice(practiceLessons || []);
      } catch (error) {
        console.error('[Recommendations] ❌ Failed to load data:', error);
        console.error('[Recommendations] Error details:', error instanceof Error ? error.message : error);
        setRecommendedPractice([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Convert recommended practice to RecommendedLesson format
  const recommendations = useMemo(() => {
    if (recommendedPractice.length === 0) return [];
    
    try {
      return recommendedPractice.map(lesson => {
        // Backend đã trả về reason là object { type, message, priority }
        // Nếu chưa có, tạo mới
        let reason;
        if (lesson.reason && typeof lesson.reason === 'object') {
          reason = lesson.reason;
        } else {
          reason = {
            type: 'practice' as const,
            message: typeof (lesson as any).reason === 'string' 
              ? (lesson as any).reason 
              : 'Bài tập phù hợp với trình độ của bạn',
            priority: 3
          };
        }
        
        return {
          ...lesson,
          reason,
          // Giữ progress nếu có từ backend
          progress: lesson.progress || undefined
        };
      });
    } catch (error) {
      console.error('Error mapping recommendations:', error);
      console.error('Recommended practice data:', recommendedPractice);
      return [];
    }
  }, [recommendedPractice]);

  // Get personalized message
  const personalizedMessage = useMemo(() => {
    const completedCount = lessons.filter(l => l.isCompleted).length;
    const totalCount = lessons.length;
    const attemptedLessons = lessons.filter(l => l.attemptCount > 0);
    const averageAccuracy = attemptedLessons.length > 0
      ? attemptedLessons.reduce((sum, l) => sum + l.bestAccuracy, 0) / attemptedLessons.length
      : 0;

    return getPersonalizedMessage(completedCount, totalCount, averageAccuracy);
  }, [lessons]);

  const handleSelectLesson = (lesson: any) => {
    // Navigate to Practice page với lesson ID (trang riêng cho bài tập đề xuất)
    navigate(`/practice/${lesson.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Đang tải bài tập đề xuất...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Bài tập đề xuất
          </h1>
          <p className="text-muted-foreground text-lg">
            Những bài học phù hợp nhất cho bạn lúc này
          </p>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 ? (
          <RecommendedLessons
            recommendations={recommendations}
            onSelectLesson={handleSelectLesson}
            personalizedMessage={personalizedMessage}
            compact={false}
          />
        ) : (
          <div className="text-center py-12 space-y-4">
            {lessons.some(l => l.attemptCount > 0) ? (
              // User đã làm một số bài nhưng không có bài đề xuất
              <>
                <div className="text-6xl">🎉</div>
                <h2 className="text-2xl font-bold">Tuyệt vời!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Bạn đã hoàn thành tất cả bài học! Hãy ôn lại các bài để củng cố kiến thức nhé.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Bài tập đề xuất sẽ được tạo tự động sau mỗi 10 bài hoàn thành.
                </p>
              </>
            ) : (
              // User chưa làm bài nào hoặc đang generate bài mới
              <>
                <div className="text-6xl">📚</div>
                <h2 className="text-2xl font-bold">Đang tạo bài tập đề xuất...</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Hệ thống đang tạo bài tập đề xuất phù hợp cho bạn. Vui lòng đợi một chút hoặc làm một số bài trong lộ trình chính trước.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Nếu không thấy bài tập sau vài giây, hãy refresh trang.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;

