import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, TrendingUp } from "lucide-react";

interface PracticeRecommendationProps {
  errorWords: string[];
  onStartPractice: () => void;
  onStartPracticeExercises?: () => void;
  isGeneratingLesson?: boolean;
  expectedText?: string;
  childTranscript?: string;
}

export const PracticeRecommendation = ({ 
  errorWords, 
  onStartPractice,
  onStartPracticeExercises,
  isGeneratingLesson = false,
  expectedText,
  childTranscript
}: PracticeRecommendationProps) => {
  if (errorWords.length === 0) return null;

  return (
    <Card className="p-6 space-y-4 border-2 border-warning bg-gradient-to-br from-warning/5 to-accent/5 animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="bg-warning/10 rounded-full p-3 mt-1">
          <Sparkles className="h-6 w-6 text-warning" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-warning" />
              Bài tập luyện tập được đề xuất
            </h3>
            <p className="text-sm text-muted-foreground">
              Chúng mình phát hiện {errorWords.length} từ bạn cần luyện thêm. 
              Hãy cùng luyện tập để cải thiện nhé! 💪
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Những từ cần luyện:</p>
            <div className="flex flex-wrap gap-2">
              {errorWords.map((word, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-sm px-3 py-1 bg-warning/10 border-warning/30 text-warning-foreground"
                >
                  {word}
                </Badge>
              ))}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Phương pháp luyện tập:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Xem và nghe cách phát âm đúng của từng từ</li>
              <li>Luyện đọc nhiều lần với flashcard</li>
              <li>Đánh dấu những từ đã thuộc để theo dõi tiến độ</li>
            </ul>
          </div>

          <div className="flex gap-3 flex-col sm:flex-row">
            <Button 
              onClick={onStartPractice}
              className="flex-1 gap-2 shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <Sparkles className="h-5 w-5" />
              Bắt đầu luyện tập với Flashcard
            </Button>
            
            {onStartPracticeExercises && expectedText && childTranscript && (
              <Button 
                onClick={onStartPracticeExercises}
                variant="outline"
                className="flex-1 gap-2 shadow-lg hover:shadow-xl transition-all border-primary/20 hover:bg-primary/10"
                size="lg"
                disabled={isGeneratingLesson}
              >
                {isGeneratingLesson ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    Đang tạo bài tập...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-5 w-5" />
                    Bài tập luyện tập
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

