import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecorderProps {
  expectedText: string;
  onRecordingComplete?: (transcript: string, accuracy: number) => void;
}

export const Recorder = ({ expectedText, onRecordingComplete }: RecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<{
    accuracy: number;
    errors: string[];
    message: string;
  } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Đang ghi âm",
        description: "Hãy đọc to và rõ ràng nhé!",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    // Mock STT API - In real app, send to backend
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

    // Mock transcript (in reality, this comes from STT API)
    const mockTranscript = expectedText; // Simulate perfect reading
    
    // Mock assessment
    const mockAccuracy = Math.floor(Math.random() * 20) + 80; // 80-100%
    const words = expectedText.split(" ");
    const errorCount = Math.floor((100 - mockAccuracy) / 10);
    const mockErrors = words.slice(0, errorCount);

    const mockFeedback = {
      accuracy: mockAccuracy,
      errors: mockErrors,
      message: mockAccuracy >= 90 
        ? "Tuyệt vời! Con đọc rất tốt! 🌟" 
        : mockAccuracy >= 75 
        ? "Tốt lắm! Chỉ cần luyện thêm một chút nữa thôi! 👍"
        : "Cố gắng lên! Mỗi ngày con đều tiến bộ hơn! 💪"
    };

    setTranscript(mockTranscript);
    setFeedback(mockFeedback);
    setIsProcessing(false);
    
    onRecordingComplete?.(mockTranscript, mockAccuracy);

    toast({
      title: "Hoàn thành!",
      description: `Độ chính xác: ${mockAccuracy}%`,
      variant: mockAccuracy >= 80 ? "default" : "destructive",
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Ghi âm giọng đọc của bạn</h3>
        {feedback && (
          <Badge 
            variant={feedback.accuracy >= 80 ? "default" : "secondary"}
            className="text-sm"
          >
            Độ chính xác: {feedback.accuracy}%
          </Badge>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className="rounded-full h-24 w-24 shadow-lg hover:shadow-xl transition-all"
        >
          {isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : isRecording ? (
            <Square className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {isRecording 
          ? "Đang ghi âm... Nhấn để dừng" 
          : isProcessing 
          ? "Đang xử lý..." 
          : "Nhấn vào micro để bắt đầu ghi âm"}
      </p>

      {feedback && (
        <div className="space-y-4 pt-4 border-t">
          <div className={`p-4 rounded-lg ${
            feedback.accuracy >= 80 
              ? "bg-success/10 border-l-4 border-success" 
              : "bg-warning/10 border-l-4 border-warning"
          }`}>
            <p className="font-semibold text-lg mb-2">{feedback.message}</p>
            {feedback.errors.length > 0 && (
              <div className="text-sm">
                <p className="font-medium mb-1">Những từ cần luyện thêm:</p>
                <div className="flex flex-wrap gap-2">
                  {feedback.errors.map((word, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Văn bản bạn đã đọc:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        </div>
      )}
    </Card>
  );
};
