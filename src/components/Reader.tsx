import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReaderProps {
  text: string;
  onComplete?: () => void;
}

export const Reader = ({ text, onComplete }: ReaderProps) => {
  const [isReading, setIsReading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const { toast } = useToast();
  const words = text.split(" ");

  useEffect(() => {
    // Cleanup speech synthesis on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const startReading = () => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Không hỗ trợ",
        description: "Trình duyệt của bạn không hỗ trợ tính năng đọc văn bản",
        variant: "destructive",
      });
      return;
    }

    window.speechSynthesis.cancel();
    setIsReading(true);
    setCurrentWordIndex(0);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.8; // Đọc chậm hơn để trẻ dễ theo dõi
    
    // Simulate word-by-word highlighting
    const wordDuration = 60000 / (120 * words.length); // Approximate duration per word
    let wordIndex = 0;
    
    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        setCurrentWordIndex(wordIndex);
        wordIndex++;
      } else {
        clearInterval(interval);
        setCurrentWordIndex(-1);
        setIsReading(false);
        onComplete?.();
      }
    }, wordDuration);

    utterance.onend = () => {
      clearInterval(interval);
      setCurrentWordIndex(-1);
      setIsReading(false);
      onComplete?.();
    };

    utterance.onerror = () => {
      clearInterval(interval);
      setIsReading(false);
      setCurrentWordIndex(-1);
      toast({
        title: "Lỗi",
        description: "Không thể đọc văn bản. Vui lòng thử lại.",
        variant: "destructive",
      });
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setCurrentWordIndex(-1);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Văn bản luyện đọc</h3>
        <Button
          onClick={isReading ? stopReading : startReading}
          variant={isReading ? "destructive" : "default"}
          className="gap-2 rounded-full"
        >
          {isReading ? (
            <>
              <Square className="h-4 w-4" />
              Dừng lại
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4" />
              Nghe đọc
            </>
          )}
        </Button>
      </div>

      <div className="text-lg leading-relaxed p-4 bg-muted/30 rounded-lg">
        {words.map((word, index) => (
          <span
            key={index}
            className={`transition-all duration-200 ${
              index === currentWordIndex
                ? "bg-primary text-primary-foreground px-1 rounded font-semibold"
                : ""
            }`}
          >
            {word}{" "}
          </span>
        ))}
      </div>

      <div className="text-sm text-muted-foreground bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
        <p className="font-medium text-accent-foreground">💡 Mẹo:</p>
        <p>Hãy theo dõi từng từ được làm nổi bật và cố gắng đọc theo nhé!</p>
      </div>
    </Card>
  );
};
