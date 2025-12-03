import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Loader2, RotateCcw, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReadingService from "@/services/readingService";

interface RecorderProps {
  expectedText: string;
  onRecordingComplete?: (transcript: string, accuracy: number, wrongWords: string[]) => void;
}

// Check if Web Speech API is supported
const isSpeechRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

// Type definitions for Web Speech API (not included in TypeScript by default)
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export const Recorder = ({ expectedText, onRecordingComplete }: RecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [feedback, setFeedback] = useState<{
    accuracy: number;
    errors: string[];
    message: string;
    encouragement: string;
    highlightedText?: string;
  } | null>(null);
  const [sttMethod, setSttMethod] = useState<'web' | 'websocket'>('web');
  
  // Web Speech API refs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  
  // WebSocket STT refs (fallback)
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canSendRef = useRef<boolean>(false);
  const confirmedTextRef = useRef<string>("");
  const partialTextRef = useRef<string>("");
  
  const { toast } = useToast();

  // Initialize Web Speech API
  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognitionClass();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'vi-VN'; // Vietnamese
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcriptPart + ' ';
          } else {
            interim += transcriptPart;
          }
        }
        
        if (final) {
          setTranscript(prev => (prev + ' ' + final).trim());
        }
        setInterimTranscript(interim);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          // Toast handled elsewhere to avoid dependency issues
          console.error('Microphone permission denied');
        } else if (event.error === 'no-speech') {
          // Ignore no-speech errors during recording
        } else {
          console.error(`Speech recognition error: ${event.error}`);
          // Try WebSocket fallback
          setSttMethod('websocket');
        }
      };

      recognitionRef.current.onend = () => {
        // Auto-restart handled in startWebSpeechRecording
      };

      setSttMethod('web');
      console.log('✅ Web Speech API initialized');
    } else {
      console.log('⚠️ Web Speech API not supported, using WebSocket');
      setSttMethod('websocket');
    }

    return () => {
      cleanupAll();
    };
  }, []);

  // Cleanup all resources
  const cleanupAll = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      wsRef.current?.close();
      processorRef.current?.disconnect();
      sourceRef.current?.disconnect();
      audioCtxRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch (e) {
      console.error("Cleanup error:", e);
    }
  };

  // Process comparison with backend
  const processComparison = useCallback(async (transcribedText: string) => {
    if (!transcribedText.trim()) {
      setIsProcessing(false);
      toast({
        title: "Không nhận được giọng nói",
        description: "Vui lòng thử lại và đọc to, rõ ràng hơn nhé!",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("🔍 Comparing texts...");
      console.log("Expected:", expectedText);
      console.log("Got:", transcribedText);

      // Call API to compare texts
      const result = await ReadingService.compareTexts(expectedText, transcribedText);
      
      // Generate feedback
      const feedbackData = ReadingService.generateFeedback(result.accuracyPercentage, result.wrongWords);
      
      setFeedback({
        accuracy: feedbackData.accuracy,
        errors: feedbackData.errors,
        message: feedbackData.message,
        encouragement: feedbackData.encouragement,
        highlightedText: result.highlightedOriginal,
      });

      // Call callback with results
      if (onRecordingComplete) {
        console.log("✅ Calling onRecordingComplete with accuracy:", result.accuracyPercentage);
        onRecordingComplete(transcribedText, result.accuracyPercentage, result.wrongWords);
      }

      // Show toast based on accuracy
      if (result.accuracyPercentage >= 80) {
        toast({
          title: feedbackData.message,
          description: `Độ chính xác: ${result.accuracyPercentage}%`,
        });
      }

    } catch (error) {
      console.error("Error processing comparison:", error);
      toast({
        title: "Lỗi",
        description: "Không thể phân tích kết quả. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [expectedText, onRecordingComplete, toast]);

  // Start recording with Web Speech API
  const startWebSpeechRecording = async () => {
    setTranscript("");
    setInterimTranscript("");
    setFeedback(null);

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
        toast({ 
          title: "🎤 Đang ghi âm", 
          description: "Hãy đọc to và rõ ràng theo văn bản mẫu!" 
        });
      }
    } catch (error) {
      console.error("Error starting Web Speech:", error);
      toast({
        title: "Lỗi",
        description: "Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.",
        variant: "destructive",
      });
    }
  };

  // Stop recording with Web Speech API
  const stopWebSpeechRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (e) {
      // Ignore
    }

    // Wait a bit for final transcript
    await new Promise(resolve => setTimeout(resolve, 500));

    const finalTranscript = (transcript + ' ' + interimTranscript).trim();
    console.log("Final transcript:", finalTranscript);

    if (finalTranscript) {
      await processComparison(finalTranscript);
    } else {
      setIsProcessing(false);
      toast({
        title: "Không nhận được giọng nói",
        description: "Vui lòng thử lại và đọc to hơn nhé!",
        variant: "destructive",
      });
    }
  };

  // Start recording with WebSocket (Speechmatics)
  const startWebSocketRecording = async () => {
    setTranscript("");
    setInterimTranscript("");
    setFeedback(null);
    confirmedTextRef.current = "";
    partialTextRef.current = "";

    try {
      console.log("Starting WebSocket recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const wsUrl = import.meta.env.VITE_STT_WS_URL || "ws://localhost:4001/ws/stt";
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        try {
          const audioCtx = new AudioContext({ sampleRate: 16000 });
          audioCtxRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          sourceRef.current = source;
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;
          
          processor.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const pcm16 = floatTo16BitPCM(input);
            if (ws.readyState === WebSocket.OPEN && canSendRef.current) {
              ws.send(pcm16);
            }
          };
          
          source.connect(processor);
          processor.connect(audioCtx.destination);
          setIsRecording(true);
          toast({ title: "🎤 Đang ghi âm", description: "Hãy đọc to và rõ ràng nhé!" });
        } catch (err) {
          console.error("Error setting up audio processing:", err);
          toast({ title: "Lỗi", description: "Không thể khởi tạo xử lý âm thanh", variant: "destructive" });
          ws.close();
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "ready") {
            canSendRef.current = true;
            return;
          }
          if (data.type === "partial") {
            setInterimTranscript(data.text);
            partialTextRef.current = data.text;
          } else if (data.type === "final") {
            setTranscript((prev) => {
              const newText = `${prev} ${data.text}`.trim();
              confirmedTextRef.current = newText;
              return newText;
            });
            setInterimTranscript("");
            partialTextRef.current = "";
          } else if (data.type === "error") {
            console.error("Server reported error:", data.message);
            toast({ title: "Lỗi STT", description: data.message, variant: "destructive" });
            setIsRecording(false);
            cleanupAudio();
          }
        } catch (e) {
          console.error("Error parsing WS message:", e);
        }
      };

      ws.onerror = () => {
        console.error("WebSocket error - falling back to Web Speech API");
        toast({ 
          title: "Không thể kết nối STT Server", 
          description: "Đang chuyển sang phương thức khác...", 
          variant: "destructive" 
        });
        setSttMethod('web');
        cleanupAudio();
      };

      ws.onclose = () => {
        cleanupAudio();
        setIsRecording(false);
      };
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Lỗi",
        description: "Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.",
        variant: "destructive",
      });
    }
  };

  // Stop WebSocket recording
  const stopWebSocketRecording = async () => {
    if (!isRecording) return;
    
    setIsRecording(false);
    setIsProcessing(true);
    canSendRef.current = false;

    try { 
      wsRef.current?.send(JSON.stringify({ type: "stop" })); 
    } catch (e) {
      // Ignore
    }
    
    wsRef.current?.close();
    cleanupAudio();

    await new Promise(resolve => setTimeout(resolve, 800));

    const finalTranscript = confirmedTextRef.current.trim() || partialTextRef.current.trim();
    
    if (finalTranscript) {
      await processComparison(finalTranscript);
    } else {
      setIsProcessing(false);
      toast({
        title: "Không nhận được giọng nói",
        description: "Vui lòng thử lại và đọc to hơn nhé!",
        variant: "destructive",
      });
    }
  };

  // Unified start/stop functions
  const startRecording = () => {
    if (sttMethod === 'web' && isSpeechRecognitionSupported()) {
      startWebSpeechRecording();
    } else {
      startWebSocketRecording();
    }
  };

  const stopRecording = () => {
    if (sttMethod === 'web') {
      stopWebSpeechRecording();
    } else {
      stopWebSocketRecording();
    }
  };

  const handleRetry = () => {
    setTranscript("");
    setInterimTranscript("");
    setFeedback(null);
    confirmedTextRef.current = "";
    partialTextRef.current = "";
  };

  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play expected text using OpenAI TTS
  const playExpectedText = async () => {
    if (isPlayingTTS) {
      // Stop current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      window.speechSynthesis?.cancel();
      setIsPlayingTTS(false);
      return;
    }

    setIsPlayingTTS(true);
    toast({
      title: "🔊 Đang tải giọng đọc...",
      description: "Vui lòng chờ trong giây lát",
    });

    try {
      const audio = await ReadingService.playText(expectedText);
      if (audio) {
        audioRef.current = audio;
        audio.onended = () => setIsPlayingTTS(false);
        audio.onerror = () => {
          setIsPlayingTTS(false);
          toast({
            title: "Lỗi",
            description: "Không thể phát âm. Đang thử phương thức khác...",
            variant: "destructive",
          });
        };
        toast({
          title: "🔊 Đang phát âm mẫu",
          description: "Hãy lắng nghe và đọc theo nhé!",
        });
      } else {
        // Browser TTS is playing
        setIsPlayingTTS(false);
        toast({
          title: "🔊 Đang phát âm mẫu",
          description: "Sử dụng giọng đọc trình duyệt",
        });
      }
    } catch (error) {
      setIsPlayingTTS(false);
      toast({
        title: "Lỗi",
        description: "Không thể phát âm. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // Play individual word
  const playWord = async (word: string) => {
    try {
      await ReadingService.playText(word);
    } catch (error) {
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'vi-VN';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Utilities
  const floatTo16BitPCM = (float32Array: Float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Uint8Array(buffer);
  };

  const cleanupAudio = () => {
    try {
      processorRef.current?.disconnect();
      sourceRef.current?.disconnect();
      audioCtxRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch (e) {
      console.error("Audio cleanup error:", e);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "bg-success text-success-foreground";
    if (accuracy >= 80) return "bg-green-500 text-white";
    if (accuracy >= 70) return "bg-yellow-500 text-white";
    if (accuracy >= 50) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  const currentTranscript = transcript + (interimTranscript ? ' ' + interimTranscript : '');

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-xl font-semibold">🎤 Ghi âm giọng đọc của bạn</h3>
        <div className="flex items-center gap-2">
          {feedback && (
            <Badge className={`text-sm ${getAccuracyColor(feedback.accuracy)}`}>
              Độ chính xác: {feedback.accuracy}%
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {sttMethod === 'web' ? '🌐 Web Speech' : '🔌 WebSocket'}
          </Badge>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 flex-wrap">
        {/* Listen button */}
        <Button
          onClick={playExpectedText}
          variant={isPlayingTTS ? "secondary" : "outline"}
          size="lg"
          className={`rounded-full h-16 w-16 shadow-md hover:shadow-lg transition-all ${isPlayingTTS ? 'animate-pulse' : ''}`}
          title={isPlayingTTS ? "Dừng phát" : "Nghe mẫu"}
        >
          {isPlayingTTS ? (
            <Square className="h-5 w-5" />
          ) : (
            <Volume2 className="h-6 w-6" />
          )}
        </Button>

        {/* Record button */}
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

        {/* Retry button */}
        {feedback && (
          <Button
            onClick={handleRetry}
            variant="outline"
            size="lg"
            className="rounded-full h-16 w-16 shadow-md hover:shadow-lg transition-all"
            title="Thử lại"
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {isRecording 
          ? "🔴 Đang ghi âm... Đọc theo văn bản mẫu rồi nhấn để dừng" 
          : isProcessing 
          ? "⏳ Đang phân tích kết quả..." 
          : feedback 
          ? "Nhấn 🔄 để thử lại hoặc 🎤 để đọc lại"
          : "Nhấn 🔊 để nghe mẫu, sau đó nhấn 🎤 để bắt đầu đọc"}
      </p>

      {/* Live transcript */}
      {(currentTranscript || isRecording) && !feedback && (
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">📝 Bạn đang đọc:</p>
          <p className="text-sm min-h-[40px]">
            <span className="text-foreground">{transcript}</span>
            {interimTranscript && (
              <span className="text-muted-foreground italic"> {interimTranscript}</span>
            )}
            {isRecording && !currentTranscript && (
              <span className="text-muted-foreground italic animate-pulse">Đang lắng nghe...</span>
            )}
          </p>
        </div>
      )}

      {/* Feedback section */}
      {feedback && (
        <div className="space-y-4 pt-4 border-t animate-fade-in">
          {/* Accuracy banner */}
          <div className={`p-4 rounded-lg ${
            feedback.accuracy >= 80 
              ? "bg-success/10 border-l-4 border-success" 
              : feedback.accuracy >= 50
              ? "bg-warning/10 border-l-4 border-warning"
              : "bg-destructive/10 border-l-4 border-destructive"
          }`}>
            <p className="font-semibold text-lg mb-1">{feedback.message}</p>
            <p className="text-sm text-muted-foreground">{feedback.encouragement}</p>
          </div>

          {/* What you read vs expected */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">📖 Văn bản mẫu:</p>
              <p className="text-sm">{expectedText}</p>
            </div>
            
            {transcript && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">📝 Bạn đã đọc:</p>
                <p className="text-sm italic">{transcript}</p>
              </div>
            )}
          </div>

          {/* Error words */}
          {feedback.errors.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
              <p className="font-medium mb-2 text-sm">📌 Những từ cần luyện thêm:</p>
              <div className="flex flex-wrap gap-2">
                {feedback.errors.slice(0, 10).map((word, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-sm bg-white dark:bg-gray-800 border-orange-300 cursor-pointer hover:bg-orange-100 active:scale-95 transition-transform"
                    onClick={() => playWord(word)}
                    title="Nhấn để nghe phát âm"
                  >
                    🔊 {word}
                  </Badge>
                ))}
                {feedback.errors.length > 10 && (
                  <Badge variant="outline" className="text-sm">
                    +{feedback.errors.length - 10} từ khác
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Nhấn vào từ để nghe phát âm mẫu
              </p>
            </div>
          )}

          {/* Tips for improvement */}
          {feedback.accuracy < 80 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg text-sm">
              <p className="font-medium mb-2">💡 Gợi ý cải thiện:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Nhấn 🔊 để nghe cách đọc mẫu trước khi thử lại</li>
                <li>Đọc chậm và rõ ràng từng từ</li>
                <li>Chú ý phát âm đúng các từ được đánh dấu màu cam</li>
                <li>Luyện tập các từ khó bằng cách nhấn vào từng từ để nghe</li>
              </ul>
            </div>
          )}

          {/* Celebration for high accuracy */}
          {feedback.accuracy >= 90 && (
            <div className="bg-success/10 p-4 rounded-lg text-center">
              <p className="text-2xl mb-2">🎉 🌟 🏆</p>
              <p className="font-semibold text-success">Tuyệt vời! Bạn đọc rất xuất sắc!</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
