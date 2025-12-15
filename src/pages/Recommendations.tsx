import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RecommendedLessons } from "@/components/RecommendedLessons";
import { PhoneticErrorsSection } from "@/components/PhoneticErrorsSection";
import { getPersonalizedMessage } from "@/utils/lessonRecommendation";
import LessonService, { type LessonWithProgress, type Lesson, type PhoneticLesson } from "@/services/lessonService";
import { Loader2, TrendingUp, Volume2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RecommendationsLoginRequired } from "@/components/LoginRequired";
import { AuthGuard } from "@/components/AuthGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Recommendations = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [recommendedPractice, setRecommendedPractice] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Show login required if not authenticated
  if (!isAuthenticated) {
    return <RecommendationsLoginRequired />;
  }

  // Load lessons and recommended practice
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      console.log('[Recommendations] 🚀 Starting to load data...');
      
      try {
        // Check authentication first
        const token = localStorage.getItem('accessToken');
        console.log('[Recommendations] 🔐 Access token exists:', !!token);
        if (token) {
          console.log('[Recommendations] 🔐 Token preview:', token.substring(0, 20) + '...');
        }

        // Load lessons with progress for personalized message
        console.log('[Recommendations] 📚 Loading lessons with progress...');
        const lessonsWithProgress = await LessonService.getLessonsWithProgress();
        console.log('[Recommendations] ✅ Loaded lessons:', lessonsWithProgress?.length || 0);
        setLessons(lessonsWithProgress);

        // Load recommended practice from API
        console.log('[Recommendations] 🎯 Loading recommended practice...');
        const practiceLessons = await LessonService.getRecommendedPractice();
        console.log('[Recommendations] ✅ Received recommended practice:', practiceLessons?.length || 0, 'lessons');
        console.log('[Recommendations] 📋 Full response:', practiceLessons);
        console.log('[Recommendations] 📝 Sample lesson:', practiceLessons?.[0]);
        setRecommendedPractice(practiceLessons || []);
      } catch (error) {
        console.error('[Recommendations] ❌ Failed to load data:', error);
        console.error('[Recommendations] 💥 Error details:', error instanceof Error ? error.message : error);
        console.error('[Recommendations] 🔍 Error stack:', error instanceof Error ? error.stack : 'No stack');
        setRecommendedPractice([]); // Set empty array on error
      } finally {
        setIsLoading(false);
        console.log('[Recommendations] 🏁 Loading completed');
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

  // Handle phonetic lesson selection (generated by AI)
  // Note: Lessons are now saved to DB with IDs, so this is just a fallback
  const handlePhoneticLesson = (lesson: PhoneticLesson) => {
    if (lesson.id) {
      // Lesson has been saved to DB, navigate directly
      navigate(`/practice/${lesson.id}`);
    } else {
      // Fallback: store in sessionStorage (shouldn't happen normally)
      console.warn('[Recommendations] Lesson has no ID, using sessionStorage fallback');
      sessionStorage.setItem('phoneticLesson', JSON.stringify(lesson));
      navigate('/practice/phonetic');
    }
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
    <AuthGuard fallback={<RecommendationsLoginRequired />}>
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

          {/* Tabs */}
          <Tabs defaultValue="progress" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="progress" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Theo tiến độ
              </TabsTrigger>
              <TabsTrigger value="phonetic" className="gap-2">
                <Volume2 className="h-4 w-4" />
                Theo lỗi phát âm
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Progress-based recommendations */}
            <TabsContent value="progress" className="mt-6">
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
            </TabsContent>

            {/* Tab 2: Phonetic error-based recommendations */}
            <TabsContent value="phonetic" className="mt-6">
              <PhoneticErrorsSection onSelectLesson={handlePhoneticLesson} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Recommendations;

