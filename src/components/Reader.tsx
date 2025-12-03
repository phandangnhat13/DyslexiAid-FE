import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, Square, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReadingService } from "@/services/readingService";

interface ReaderProps {
  text: string;
  onComplete?: () => void;
}

export const Reader = ({ text, onComplete }: ReaderProps) => {
  const [isReading, setIsReading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const { toast } = useToast();
  const words = text.split(" ");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startReading = async () => {
    setIsLoading(true);
    
    try {
      const audio = await ReadingService.playText(text);
      
      if (!audio) {
        throw new Error('Failed to get audio');
      }

      audioRef.current = audio;
      setIsReading(true);
      setIsLoading(false);
      setCurrentWordIndex(0);

      // Get audio duration and calculate word timing
      audio.onloadedmetadata = () => {
        const duration = audio.duration * 1000; // Convert to ms
        const wordDuration = duration / words.length;
        let wordIndex = 0;

        intervalRef.current = setInterval(() => {
          if (wordIndex < words.length) {
            setCurrentWordIndex(wordIndex);
            wordIndex++;
          } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
        }, wordDuration);
      };

      audio.onended = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCurrentWordIndex(-1);
        setIsReading(false);
        audioRef.current = null;
        onComplete?.();
      };

      audio.onerror = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsReading(false);
        setCurrentWordIndex(-1);
        audioRef.current = null;
        toast({
          title: "Lỗi",
          description: "Không thể đọc văn bản. Vui lòng thử lại.",
          variant: "destructive",
        });
      };

    } catch (error) {
      console.error('TTS Error:', error);
      setIsLoading(false);
      toast({
        title: "Lỗi",
        description: "Không thể tải giọng đọc. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const stopReading = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
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
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải...
            </>
          ) : isReading ? (
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
