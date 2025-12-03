import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Volume2, ChevronLeft, ChevronRight, X, CheckCircle2, RotateCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReadingService } from "@/services/readingService";

interface FlashcardProps {
  words: string[];
  onComplete: () => void;
  onClose: () => void;
}

export const Flashcard = ({ words, onComplete, onClose }: FlashcardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [masteredWords, setMasteredWords] = useState<Set<number>>(new Set());
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const dragStartX = useRef(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;
  const totalMastered = masteredWords.size;

  const speakWord = async () => {
    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    setIsSpeaking(true);
    try {
      const audio = await ReadingService.playText(currentWord);
      if (audio) {
        currentAudioRef.current = audio;
        audio.onended = () => {
          setIsSpeaking(false);
          currentAudioRef.current = null;
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          currentAudioRef.current = null;
        };
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
      toast({
        title: "Lỗi",
        description: "Không thể phát âm. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setDragOffset(0);
    } else {
      // Kết thúc
      if (totalMastered === words.length) {
        toast({
          title: "🎉 Hoàn thành xuất sắc!",
          description: `Bạn đã nắm vững tất cả ${words.length} từ!`,
        });
        onComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setDragOffset(0);
    }
  };

  // Touch/Mouse drag handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    dragStartX.current = clientX;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - dragStartX.current;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Threshold for swipe (100px)
    if (dragOffset > 100 && currentIndex > 0) {
      handlePrevious();
    } else if (dragOffset < -100 && currentIndex < words.length - 1) {
      handleNext();
    } else {
      setDragOffset(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const markAsMastered = () => {
    const newMastered = new Set(masteredWords);
    newMastered.add(currentIndex);
    setMasteredWords(newMastered);
    
    toast({
      title: "Tuyệt vời! ⭐",
      description: `Bạn đã nắm vững từ "${currentWord}"`,
    });
    
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setDragOffset(0);
    setMasteredWords(new Set());
  };

  const isCurrentMastered = masteredWords.has(currentIndex);
  const allMastered = totalMastered === words.length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-2xl p-6 space-y-6 animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Luyện tập Flashcard
            </h2>
            <p className="text-sm text-muted-foreground">
              Thẻ {currentIndex + 1}/{words.length} • Đã nắm vững: {totalMastered}/{words.length}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Tiến độ</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {allMastered ? (
          /* Completion Screen */
          <div className="py-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-success/10 rounded-full p-6">
                <CheckCircle2 className="h-16 w-16 text-success" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-success">
                🎉 Hoàn thành xuất sắc!
              </h3>
              <p className="text-muted-foreground">
                Bạn đã nắm vững tất cả {words.length} từ!
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRestart} variant="outline" className="gap-2">
                <RotateCw className="h-4 w-4" />
                Luyện lại
              </Button>
              <Button onClick={onClose} className="gap-2">
                Hoàn thành
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Flashcard - Swipeable */}
            <div className="relative h-72 touch-none select-none">
              <Card 
                className={`absolute inset-0 flex items-center justify-center p-8 border-2 transition-all cursor-grab active:cursor-grabbing ${
                  isCurrentMastered ? 'border-success bg-success/5' : 'border-primary'
                } ${isDragging ? 'shadow-2xl scale-105' : 'shadow-lg'}`}
                style={{
                  transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Kéo sang trái/phải để chuyển thẻ</p>
                    <p className="text-5xl font-bold">{currentWord}</p>
                  </div>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord();
                    }}
                    variant="default"
                    size="lg"
                    className="gap-2 rounded-full shadow-lg"
                    disabled={isSpeaking}
                  >
                    {isSpeaking ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                    {isSpeaking ? "Đang phát..." : "Nghe phát âm"}
                  </Button>

                  {isCurrentMastered && (
                    <div className="flex items-center gap-2 justify-center text-success">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">Đã nắm vững</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Swipe indicators */}
              {dragOffset > 50 && currentIndex > 0 && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary/20 rounded-full p-3 animate-pulse">
                  <ChevronLeft className="h-8 w-8 text-primary" />
                </div>
              )}
              {dragOffset < -50 && currentIndex < words.length - 1 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary/20 rounded-full p-3 animate-pulse">
                  <ChevronRight className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <Button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                variant="outline"
                className="gap-2 flex-1"
                size="lg"
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              
              {!isCurrentMastered && (
                <Button
                  onClick={markAsMastered}
                  variant="default"
                  className="gap-2 flex-1 bg-success hover:bg-success/90"
                  size="lg"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Đã thuộc
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                variant="outline"
                className="gap-2 flex-1"
                size="lg"
              >
                Tiếp theo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Hint */}
            <div className="text-center text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
              💡 Kéo thẻ sang trái/phải hoặc dùng nút điều hướng để chuyển từ
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

