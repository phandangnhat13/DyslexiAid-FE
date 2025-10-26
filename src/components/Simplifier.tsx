import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Simplifier = () => {
  const [originalText, setOriginalText] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSimplify = async () => {
    if (!originalText.trim()) {
      toast({
        title: "Chưa có văn bản",
        description: "Vui lòng nhập văn bản cần đơn giản hóa",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Mock AI simplification - In real app, call backend API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple mock logic: shorten sentences, use simpler words
    const mockSimplified = mockSimplifyText(originalText);
    
    setSimplifiedText(mockSimplified);
    setIsProcessing(false);

    toast({
      title: "Hoàn thành!",
      description: "Văn bản đã được đơn giản hóa",
    });
  };

  const mockSimplifyText = (text: string): string => {
    // Mock simplification logic
    const simplifications: Record<string, string> = {
      "hôm nay": "hôm nay",
      "trời mưa to": "trời mưa",
      "học sinh": "các bạn",
      "không ra sân chơi": "không chơi ngoài sân",
      "vì vậy": "nên",
      "do đó": "nên",
      "bởi vì": "vì",
      "tuy nhiên": "nhưng",
      "mặc dù": "dù",
      "những": "các",
      "rất nhiều": "nhiều",
      "khá lớn": "lớn",
    };

    let simplified = text;
    
    // Apply simple word replacements
    Object.entries(simplifications).forEach(([complex, simple]) => {
      const regex = new RegExp(complex, 'gi');
      simplified = simplified.replace(regex, simple);
    });

    // Break long sentences
    simplified = simplified.replace(/([.!?])\s*([A-ZÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ])/g, '$1\n$2');
    
    return simplified;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(simplifiedText);
    setCopied(true);
    toast({
      title: "Đã sao chép",
      description: "Văn bản đã được sao chép vào clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleTexts = [
    "Hôm nay trời mưa to nên học sinh không ra sân chơi được.",
    "Mặc dù thời tiết không thuận lợi nhưng các em vẫn rất vui vẻ học bài trong lớp.",
    "Do đó, giáo viên đã quyết định tổ chức những trò chơi trong nhà để các em giải trí.",
  ];

  const loadSample = (text: string) => {
    setOriginalText(text);
    setSimplifiedText("");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Văn bản gốc</h3>
          <div className="flex gap-2 flex-wrap">
            {sampleTexts.map((text, index) => (
              <Button
                key={index}
                onClick={() => loadSample(text)}
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
              >
                Mẫu {index + 1}
              </Button>
            ))}
          </div>
        </div>
        
        <Textarea
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder="Nhập văn bản cần đơn giản hóa..."
          className="min-h-[150px] text-base resize-none"
        />

        <Button
          onClick={handleSimplify}
          disabled={isProcessing || !originalText.trim()}
          className="w-full gap-2 rounded-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Làm dễ hơn
            </>
          )}
        </Button>
      </Card>

      {simplifiedText && (
        <Card className="p-6 space-y-4 animate-slide-up border-2 border-success/20 bg-success/5">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Văn bản đơn giản hóa</h3>
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="gap-2 rounded-full"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Đã sao chép
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Sao chép
                </>
              )}
            </Button>
          </div>

          <div className="p-4 bg-card rounded-lg border text-base leading-relaxed whitespace-pre-line">
            {simplifiedText}
          </div>

          <div className="text-sm text-muted-foreground bg-success/10 p-4 rounded-lg border-l-4 border-success">
            <p className="font-medium text-success-foreground mb-1">✨ Kết quả:</p>
            <p>Văn bản đã được làm đơn giản hơn, dễ đọc và dễ hiểu hơn cho trẻ!</p>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
        <h3 className="font-semibold mb-3">💡 Cách hoạt động:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>Thay thế từ phức tạp bằng từ đơn giản hơn</li>
          <li>Chia nhỏ câu dài thành câu ngắn</li>
          <li>Loại bỏ các cụm từ không cần thiết</li>
          <li>Giữ nguyên ý nghĩa của văn bản</li>
        </ul>
      </Card>
    </div>
  );
};
