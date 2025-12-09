import { useState, useEffect } from "react";
import { Reader } from "@/components/Reader";
import { Recorder } from "@/components/Recorder";
import { PracticeRecommendation } from "@/components/PracticeRecommendation";
import { Flashcard } from "@/components/Flashcard";
import { GeneratedLessonModal } from "@/components/GeneratedLessonModal";
import { LessonSelector } from "@/components/LessonSelector";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import LessonService, { Lesson, LessonWithProgress, GeneratedLessonResponse } from "@/services/lessonService";

import { ReadLoginRequired } from "@/components/LoginRequired";
import { AuthGuard } from "@/components/AuthGuard";

const Read = () => {
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [errorWords, setErrorWords] = useState<string[]>([]);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLessonResponse | null>(null);
  const [showGeneratedLesson, setShowGeneratedLesson] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Load lessons from API
  useEffect(() => {
    const loadLessons = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated) {
          // Nếu đã đăng nhập, lấy lessons kèm tiến trình
          const lessonsWithProgress = await LessonService.getLessonsWithProgress();
          setLessons(lessonsWithProgress);
          
          // Extract completed lesson IDs
          const completed = lessonsWithProgress
            .filter(l => l.isCompleted)
            .map(l => l.id);
          setCompletedLessons(completed);
        } else {
          // Nếu chưa đăng nhập, lấy lessons không có tiến trình
          const allLessons = await LessonService.getAllLessons();
          
          // Load progress from localStorage for non-authenticated users
          const savedProgress = JSON.parse(localStorage.getItem('lessonProgress') || '{}');
          const savedCompleted = JSON.parse(localStorage.getItem('completedLessons') || '[]');
          
          setLessons(allLessons.map(l => {
            const progress = savedProgress[l.id];
            return {
              ...l,
              isCompleted: progress?.isCompleted || savedCompleted.includes(l.id) || false,
              bestAccuracy: progress?.bestAccuracy || 0,
              attemptCount: progress?.attemptCount || 0,
            };
          }));
          
          setCompletedLessons(savedCompleted);
        }
      } catch (error) {
        console.error('Failed to load lessons:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách bài học. Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLessons();
  }, [isAuthenticated, toast]);

  // Save completed lessons
  const saveCompletedLesson = async (lessonId: number, accuracy: number) => {
    if (isAuthenticated) {
      try {
        const result = await LessonService.updateProgress(lessonId, accuracy);
        
        console.log('📊 Progress saved:', result);
        
        // Always update lessons state with latest progress
        setLessons(prev => prev.map(l => 
          l.id === lessonId 
            ? { 
                ...l, 
                isCompleted: result.isCompleted, 
                bestAccuracy: result.bestAccuracy, 
                attemptCount: result.attemptCount 
              }
            : l
        ));
        
        // Update completedLessons if newly completed
        if (result.isCompleted && !completedLessons.includes(lessonId)) {
          setCompletedLessons(prev => [...prev, lessonId]);
        }
        
        return result;
      } catch (error) {
        console.error('Failed to save progress:', error);
        toast({
          title: "Lỗi",
          description: "Không thể lưu tiến trình. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    } else {
      // Fallback to localStorage for non-authenticated users
      const isCompleted = accuracy >= 80;
      
      // Always update lessons state
      setLessons(prev => prev.map(l => 
        l.id === lessonId 
          ? { 
              ...l, 
              isCompleted: l.isCompleted || isCompleted,
              bestAccuracy: Math.max(l.bestAccuracy || 0, accuracy), 
              attemptCount: (l.attemptCount || 0) + 1 
            }
          : l
      ));
      
      if (isCompleted && !completedLessons.includes(lessonId)) {
        const updated = [...completedLessons, lessonId];
        setCompletedLessons(updated);
        localStorage.setItem('completedLessons', JSON.stringify(updated));
      }
      
      // Also save progress to localStorage
      const savedProgress = JSON.parse(localStorage.getItem('lessonProgress') || '{}');
      savedProgress[lessonId] = {
        bestAccuracy: Math.max(savedProgress[lessonId]?.bestAccuracy || 0, accuracy),
        attemptCount: (savedProgress[lessonId]?.attemptCount || 0) + 1,
        isCompleted: savedProgress[lessonId]?.isCompleted || isCompleted,
      };
      localStorage.setItem('lessonProgress', JSON.stringify(savedProgress));
    }
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setTotalScore(0);
    setAttemptCount(0);
    setErrorWords([]);
  };

  const handleBackToLessons = async () => {
    setSelectedLesson(null);
    setTotalScore(0);
    setAttemptCount(0);
    setErrorWords([]);
    
    // Reload lessons to get updated progress
    if (isAuthenticated) {
      try {
        const lessonsWithProgress = await LessonService.getLessonsWithProgress();
        setLessons(lessonsWithProgress);
        
        const completed = lessonsWithProgress
          .filter(l => l.isCompleted)
          .map(l => l.id);
        setCompletedLessons(completed);
      } catch (error) {
        console.error('Failed to reload lessons:', error);
      }
    }
  };

  const handleRecordingComplete = async (transcript: string, accuracy: number, words: string[]) => {
    setTotalScore((prev) => prev + accuracy);
    setAttemptCount((prev) => prev + 1);
    setLastTranscript(transcript); // Store transcript for AI generation
    
    // Update error words if accuracy is below 90%
    if (accuracy < 90 && words.length > 0) {
      setErrorWords(words);
    } else {
      setErrorWords([]);
    }

    // Save progress to server
    if (selectedLesson) {
      const result = await saveCompletedLesson(selectedLesson.id, accuracy);
      
      // Show toast if newly completed
      if (result?.isCompleted && !completedLessons.includes(selectedLesson.id)) {
        toast({
          title: "🎉 Chúc mừng!",
          description: `Bạn đã hoàn thành bài "${selectedLesson.title}"!`,
          duration: 5000,
        });
      } else if (result?.isNewBest) {
        toast({
          title: "🌟 Điểm cao mới!",
          description: `Điểm cao nhất: ${result.bestAccuracy.toFixed(1)}%`,
          duration: 3000,
        });
      }
    }
  };

  const handleStartPractice = () => {
    setShowFlashcard(true);
  };

  const handleFlashcardComplete = () => {
    setShowFlashcard(false);
    setErrorWords([]);
  };

  const handleFlashcardClose = () => {
    setShowFlashcard(false);
  };

  const handleStartPracticeExercises = async () => {
    if (!selectedLesson || !lastTranscript) {
      toast({
        title: "Lỗi",
        description: "Vui lòng luyện đọc trước khi tạo bài tập!",
        variant: "destructive",
      });
      return;
    }

    console.log('📚 Generating practice exercises based on reading errors...');
    setIsGeneratingLesson(true);
    
    try {
      // Map difficulty to valid API values  
      let difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'EASY'; // Default fallback
      const lessonDifficulty = selectedLesson.difficulty?.toLowerCase?.() || selectedLesson.difficulty;
      
      switch (lessonDifficulty) {
        case 'easy':
        case 'dễ':
        case 'DE':
          difficulty = 'EASY';
          break;
        case 'medium':
        case 'vừa':
        case 'trung bình':
        case 'TB':
          difficulty = 'MEDIUM';
          break;
        case 'hard':
        case 'khó':
        case 'KH':
          difficulty = 'HARD';
          break;
        default:
          console.warn('Unknown difficulty:', selectedLesson.difficulty, 'defaulting to EASY');
          difficulty = 'EASY';
      }

      const generateRequest = {
        standardScript: selectedLesson.text,
        childScript: lastTranscript,
        difficulty
      };
      
      console.log('🤖 Generating lesson with request:', generateRequest);
      console.log('📋 Original lesson difficulty:', selectedLesson.difficulty);
      console.log('📋 Mapped difficulty:', difficulty);
      
      const generatedLessonData = await LessonService.generateLesson(generateRequest);
      console.log('✅ Generated lesson:', generatedLessonData);
      
      // Show success toast
      toast({
        title: `🎉 Đã tạo bài tập: "${generatedLessonData.suggestedLesson.title}"`,
        description: `Bài tập tập trung vào: ${generatedLessonData.suggestedLesson.focusAreas.join(', ')}`,
      });
      
      // Open modal with generated lesson
      setGeneratedLesson(generatedLessonData);
      setShowGeneratedLesson(true);
      
    } catch (error) {
      console.error('❌ Failed to generate practice exercises:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo bài tập lúc này. Vui lòng thử lại sau!",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const averageScore = attemptCount > 0 ? Math.round(totalScore / attemptCount) : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  // Show lesson selector if no lesson is selected
  if (!selectedLesson) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <LessonSelector
          lessons={lessons}
          completedLessons={completedLessons}
          onSelectLesson={handleSelectLesson}
        />
      </div>
    );
  }

  // Show lesson practice
  return (
    <AuthGuard fallback={<ReadLoginRequired />}>
      <div className="relative">
        <div className="container mx-auto px-4 pt-4 pb-8 max-w-4xl">
          <div className="space-y-6 animate-fade-in">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBackToLessons}
            variant="outline"
            size="lg"
            className="gap-2 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div className="flex-1" />
        </div>

        {/* Badge cho biết đây là lộ trình bài tập */}
        <div className="flex items-center justify-center">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2 rounded-full border-2 border-primary/20">
            <span className="text-sm font-medium text-primary">📖 Lộ trình bài tập</span>
          </div>
        </div>

        {/* Lesson Info */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Bài {selectedLesson.id}: {selectedLesson.title}
          </h1>
          <p className="text-muted-foreground">
            {selectedLesson.description}
          </p>
          {attemptCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-success/10 px-4 py-2 rounded-full border border-success/20">
              <Trophy className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">
                Điểm trung bình: <span className="text-success font-bold text-lg">{averageScore}%</span>
              </span>
            </div>
          )}
        </div>

        <Reader text={selectedLesson.text} />

        <Recorder 
          expectedText={selectedLesson.text} 
          onRecordingComplete={handleRecordingComplete}
        />

        {errorWords.length > 0 && !showFlashcard && (
          <PracticeRecommendation
            errorWords={errorWords}
            onStartPractice={handleStartPractice}
            onStartPracticeExercises={handleStartPracticeExercises}
            isGeneratingLesson={isGeneratingLesson}
            expectedText={selectedLesson.text}
            childTranscript={lastTranscript}
          />
        )}
        </div>
      </div>

      {/* Sticky sidebar - phần hướng dẫn, fixed bên phải, căn giữa theo chiều dọc */}
      <div className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 w-72 z-10">
        <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 p-6 rounded-lg border border-primary/10 shadow-lg">
          <h3 className="font-semibold mb-3 text-lg">📚 Hướng dẫn luyện tập:</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Nhấn nút "Nghe đọc" để nghe máy đọc văn bản</li>
            <li>Theo dõi từng từ được làm nổi bật</li>
            <li>Nhấn vào micro để ghi âm giọng đọc của bạn</li>
            <li>Nhận phản hồi và lời khuyên để cải thiện</li>
            <li>Nhấn "Văn bản khác" để luyện tập thêm</li>
          </ol>
        </div>
      </div>

      {showFlashcard && errorWords.length > 0 && (
        <Flashcard
          words={errorWords}
          onComplete={handleFlashcardComplete}
          onClose={handleFlashcardClose}
        />
      )}

      {/* Generated Lesson Modal */}
      <GeneratedLessonModal
        isOpen={showGeneratedLesson}
        onClose={() => setShowGeneratedLesson(false)}
        generatedLesson={generatedLesson}
      />
      </div>
    </AuthGuard>
  );
};

export default Read;
