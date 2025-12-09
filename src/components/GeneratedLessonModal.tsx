import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, BookOpen, Target, Mic, Volume2, 
  CheckCircle, X, TrendingUp, RotateCcw 
} from "lucide-react";
import { Reader } from "@/components/Reader";
import { Recorder } from "@/components/Recorder";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedLessonResponse } from "@/services/lessonService";

interface GeneratedLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedLesson: GeneratedLessonResponse | null;
}

export const GeneratedLessonModal = ({ 
  isOpen, 
  onClose, 
  generatedLesson 
}: GeneratedLessonModalProps) => {
  const { toast } = useToast();
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [errorWords, setErrorWords] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentScore(null);
      setAttemptCount(0);
      setErrorWords([]);
      setShowCelebration(false);
    }
  }, [isOpen]);

  const handleRecordingComplete = (transcript: string, accuracy: number, wrongWords: string[]) => {
    setCurrentScore(accuracy);
    setAttemptCount(prev => prev + 1);
    setErrorWords(wrongWords);

    if (accuracy >= 80) {
      setShowCelebration(true);
      toast({
        title: "🎉 Tuyệt vời!",
        description: `Bạn đã đọc đúng ${accuracy.toFixed(1)}%!`,
      });
    } else {
      toast({
        title: "💪 Cố gắng thêm nhé!",
        description: `Độ chính xác: ${accuracy.toFixed(1)}%. Hãy tập trung vào các từ được đánh dấu.`,
      });
    }
  };

  const handleTryAgain = () => {
    setCurrentScore(null);
    setErrorWords([]);
    setShowCelebration(false);
  };

  const handleClose = () => {
    setCurrentScore(null);
    setAttemptCount(0);
    setErrorWords([]);
    setShowCelebration(false);
    onClose();
  };

  if (!generatedLesson) return null;

  const { suggestedLesson, errors } = generatedLesson;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-3 rounded-full">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {suggestedLesson.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Bài tập luyện tập được tạo riêng cho bạn
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Stats */}
          {attemptCount > 0 && (
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Lần thử: {attemptCount}</span>
              </div>
              {currentScore !== null && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-secondary" />
                  <span>Điểm: {currentScore.toFixed(1)}%</span>
                </div>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Focus Areas */}
          <Card className="p-4 bg-gradient-to-r from-warning/5 to-accent/5 border-warning/20">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-warning" />
                <h3 className="font-semibold">Từ cần luyện tập đặc biệt:</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedLesson.focusAreas.map((word, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="px-3 py-1 bg-warning/10 border-warning/30 text-warning-foreground hover:bg-warning/20"
                  >
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Detected Errors */}
          {errors.length > 0 && (
            <Card className="p-4 bg-destructive/5 border-destructive/20">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-destructive" />
                  <h3 className="font-semibold">Lỗi đã phát hiện từ lần đọc trước:</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {errors.map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium text-destructive">"{error.word}"</div>
                        <div className="text-sm text-muted-foreground">
                          Đã đọc thành: <span className="font-medium">"{error.childRead}"</span>
                        </div>
                      </div>
                      <Badge variant="destructive" className="capitalize">
                        {error.errorType}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          <Separator />

          {/* Main Content */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Nội dung bài tập:</h3>
            </div>
            
            <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
              <Reader text={suggestedLesson.script} />
            </Card>
          </div>

          <Separator />

          {/* Recording Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-secondary" />
                <h3 className="text-lg font-semibold">Luyện đọc:</h3>
              </div>
              {currentScore !== null && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTryAgain}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Thử lại
                </Button>
              )}
            </div>

            <Recorder 
              expectedText={suggestedLesson.script}
              onRecordingComplete={handleRecordingComplete}
            />

            {/* Results */}
            {currentScore !== null && (
              <Card className={`p-4 border-2 ${
                currentScore >= 80 
                  ? 'bg-success/5 border-success/20' 
                  : 'bg-warning/5 border-warning/20'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-5 w-5 ${
                        currentScore >= 80 ? 'text-success' : 'text-warning'
                      }`} />
                      <span className="font-semibold">
                        Kết quả: {currentScore.toFixed(1)}%
                      </span>
                    </div>
                    <Badge variant={currentScore >= 80 ? "default" : "secondary"}>
                      {currentScore >= 80 ? 'Tuyệt vời!' : 'Cần cải thiện'}
                    </Badge>
                  </div>

                  {errorWords.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-warning">
                        Các từ cần luyện thêm:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {errorWords.map((word, index) => (
                          <Badge key={index} variant="outline" className="bg-warning/10 border-warning/30">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {showCelebration && currentScore >= 80 && (
                    <div className="text-center py-4">
                      <div className="text-4xl mb-2">🎉</div>
                      <p className="text-lg font-semibold text-success">
                        Chúc mừng! Bạn đã làm rất tốt!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tiếp tục luyện tập để cải thiện thêm nhé!
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleClose} variant="outline" className="flex-1">
              Đóng
            </Button>
            <Button 
              onClick={handleTryAgain} 
              className="flex-1 gap-2"
              disabled={currentScore === null}
            >
              <RotateCcw className="h-4 w-4" />
              Luyện lại
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
