import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Reader } from "@/components/Reader";
import { Recorder } from "@/components/Recorder";
import { PracticeRecommendation } from "@/components/PracticeRecommendation";
import { Flashcard } from "@/components/Flashcard";
import { GeneratedLessonModal } from "@/components/GeneratedLessonModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LessonService, { type Lesson, type GeneratedLessonResponse } from "@/services/lessonService";
import { Loader2 } from "lucide-react";

/**
 * Trang luyện tập cho Bài tập đề xuất
 * Đây là bài tập mới ngoài lộ trình chính
 */
const Practice = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalScore, setTotalScore] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [errorWords, setErrorWords] = useState<string[]>([]);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLessonResponse | null>(null);
  const [showGeneratedLesson, setShowGeneratedLesson] = useState(false);

  // Load lesson by ID
  useEffect(() => {
    const loadLesson = async () => {
      if (!lessonId) {
        navigate('/recommendations');
        return;
      }

      setIsLoading(true);
      try {
        const lessonData = await LessonService.getLessonById(parseInt(lessonId));
        if (lessonData) {
          setLesson(lessonData);
        } else {
          toast({
            title: "Lỗi",
            description: "Không tìm thấy bài học này",
            variant: "destructive",
          });
          navigate('/recommendations');
        }
      } catch (error) {
        console.error('Failed to load lesson:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải bài học. Vui lòng thử lại.",
          variant: "destructive",
        });
        navigate('/recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    loadLesson();
  }, [lessonId, navigate, toast]);

  const handleBackToRecommendations = () => {
    navigate('/recommendations');
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

    // Save progress (bài tập đề xuất vẫn lưu progress nhưng không tính vào lộ trình chính)
    if (lesson) {
      try {
        await LessonService.updateProgress(lesson.id, accuracy);
        
        // 🏆 Ghi nhật ký phiên để kiểm tra thành tựu
        try {
          await LessonService.createSessionLog({
            exercises: 1,
            score: Math.round(accuracy),
            progress: Math.round(accuracy),
          });
          console.log('🏆 Session log created - checking achievements');
        } catch (logError) {
          console.warn('Could not create session log:', logError);
        }
        
        toast({
          title: accuracy >= 80 ? "🎉 Tuyệt vời!" : "🌟 Tiếp tục cố gắng!",
          description: `Độ chính xác: ${accuracy.toFixed(1)}%`,
          variant: accuracy >= 80 ? "default" : "default",
        });
      } catch (error) {
        console.error('Failed to save progress:', error);
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
    if (!lesson || !lastTranscript) {
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
      const lessonDifficulty = lesson.difficulty?.toLowerCase?.() || lesson.difficulty;
      
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
          console.warn('Unknown difficulty:', lesson.difficulty, 'defaulting to EASY');
          difficulty = 'EASY';
      }

      const generateRequest = {
        standardScript: lesson.text,
        childScript: lastTranscript,
        difficulty
      };
      
      console.log('🤖 Generating lesson with request:', generateRequest);
      console.log('📋 Original lesson difficulty:', lesson.difficulty);
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="relative">
      <div className="container mx-auto px-4 pt-4 pb-8 max-w-4xl">
        <div className="space-y-6 animate-fade-in">
          {/* Header with back button */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBackToRecommendations}
              variant="outline"
              size="lg"
              className="gap-2 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <div className="flex-1" />
          </div>

          {/* Badge cho biết đây là bài tập đề xuất */}
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2 rounded-full border-2 border-primary/20">
              <span className="text-sm font-medium text-primary">✨ Bài tập đề xuất</span>
            </div>
          </div>

          {/* Lesson Info */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {lesson.title}
            </h1>
            <p className="text-muted-foreground">
              {lesson.description}
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

          <Reader text={lesson.text} />

          <Recorder 
            expectedText={lesson.text} 
            onRecordingComplete={handleRecordingComplete}
          />

          {errorWords.length > 0 && !showFlashcard && (
            <PracticeRecommendation
              errorWords={errorWords}
              onStartPractice={handleStartPractice}
              onStartPracticeExercises={handleStartPracticeExercises}
              isGeneratingLesson={isGeneratingLesson}
              expectedText={lesson.text}
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
            <li>Hoàn thành bài tập để mở khóa thêm bài mới</li>
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
  );
};

export default Practice;

