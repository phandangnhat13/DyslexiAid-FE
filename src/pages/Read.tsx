import { useState } from "react";
import { Reader } from "@/components/Reader";
import { Recorder } from "@/components/Recorder";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// Sample texts for practice
const sampleTexts = [
  "Hôm nay trời nắng đẹp. Bạn Mai đi chơi công viên với bố mẹ. Bạn rất vui vẻ.",
  "Con mèo nhỏ thích uống sữa. Mỗi ngày con mèo đều được cho ăn cá tươi.",
  "Gia đình tôi có bốn người. Bố mẹ và hai anh em tôi. Chúng tôi yêu thương nhau.",
  "Buổi sáng tôi thức dậy sớm. Tôi đánh răng rửa mặt và ăn sáng. Sau đó tôi đi học.",
];

const Read = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  const currentText = sampleTexts[currentTextIndex];

  const handleNextText = () => {
    setCurrentTextIndex((prev) => (prev + 1) % sampleTexts.length);
  };

  const handleRecordingComplete = (transcript: string, accuracy: number) => {
    setTotalScore((prev) => prev + accuracy);
    setAttemptCount((prev) => prev + 1);
  };

  const averageScore = attemptCount > 0 ? Math.round(totalScore / attemptCount) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Luyện đọc
          </h1>
          <p className="text-muted-foreground">
            Nghe, đọc theo và ghi âm giọng của bạn
          </p>
          {attemptCount > 0 && (
            <div className="inline-block bg-success/10 px-4 py-2 rounded-full border border-success/20">
              <span className="text-sm font-medium">
                Điểm trung bình: <span className="text-success font-bold text-lg">{averageScore}%</span>
              </span>
            </div>
          )}
        </div>

        <Reader text={currentText} />

        <Recorder 
          expectedText={currentText} 
          onRecordingComplete={handleRecordingComplete}
        />

        <div className="flex justify-center">
          <Button
            onClick={handleNextText}
            variant="outline"
            className="gap-2 rounded-full"
            size="lg"
          >
            <RefreshCw className="h-4 w-4" />
            Văn bản khác
          </Button>
        </div>

        <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 p-6 rounded-lg border border-primary/10">
          <h3 className="font-semibold mb-3 text-lg">📚 Hướng dẫn luyện tập:</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Nhấn nút "Nghe đọc" để nghe máy đọc văn bản</li>
            <li>Theo dõi từng từ được làm nổi bật</li>
            <li>Nhấn vào micro để ghi âm giọng đọc của bạn</li>
            <li>Nhận phản hồi và lời khuyên để cải thiện</li>
            <li>Nhấn "Văn bản khác" để luyện tập thêm</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Read;
