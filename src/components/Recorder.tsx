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
  const [confirmedText, setConfirmedText] = useState("");
  const [partialText, setPartialText] = useState("");
  const [feedback, setFeedback] = useState<{
    accuracy: number;
    errors: string[];
    message: string;
  } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const canSendRef = useRef<boolean>(false);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      console.log("Starting recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone stream obtained");

      const ws = new WebSocket(import.meta.env.VITE_STT_WS_URL || "ws://localhost:4001/ws/stt");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        try {
          const audioCtx = new AudioContext({ sampleRate: 16000 });
          console.log(`AudioContext started. Rate: ${audioCtx.sampleRate}, State: ${audioCtx.state}`);
          
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
          toast({ title: "Đang ghi âm", description: "Hãy đọc to và rõ ràng nhé!" });
        } catch (err) {
          console.error("Error setting up audio processing:", err);
          toast({ title: "Lỗi", description: "Không thể khởi tạo xử lý âm thanh", variant: "destructive" });
          ws.close();
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WS Message:", data.type);
          if (data.type === "ready") {
            console.log("Server ready, enabling audio send");
            canSendRef.current = true;
            return;
          }
          if (data.type === "partial") {
            setPartialText(data.text);
          } else if (data.type === "final") {
            setConfirmedText((prev) => `${prev} ${data.text}`.trim());
            setPartialText("");
          } else if (data.type === "error") {
            console.error("Server reported error:", data.message);
            toast({ title: "Lỗi STT", description: data.message, variant: "destructive" });
            setIsRecording(false);
            cleanupAudio(stream);
          }
        } catch (e) {
          console.error("Error parsing WS message:", e);
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket error:", e);
        toast({ title: "Lỗi kết nối STT", description: "Không thể kết nối máy chủ STT.", variant: "destructive" });
      };

      ws.onclose = (e) => {
        console.log("WebSocket closed", e.code, e.reason);
        cleanupAudio(stream);
        setIsRecording(false); // Ensure UI updates
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

  const stopRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      try { wsRef.current?.send(JSON.stringify({ type: "stop" })); } catch {}
      wsRef.current?.close();
      canSendRef.current = false;
      setIsProcessing(false);
    }
  };

  // Utilities
  const floatTo16BitPCM = (float32Array: Float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Uint8Array(buffer);
  };

  const cleanupAudio = (stream: MediaStream) => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    audioCtxRef.current?.close();
    stream.getTracks().forEach((t) => t.stop());
  };

  const combinePartial = (prev: string, partial: string) => {
    return `${prev} ${partial}`.trim();
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

      {(confirmedText || partialText) && (
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Văn bản bạn đã đọc:</p>
          <p className="text-sm">
            {confirmedText} <span className="text-muted-foreground">{partialText}</span>
          </p>
        </div>
      )}

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
        </div>
      )}
    </Card>
  );
};
