import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, UserPlus, BookOpen, BarChart3, Sparkles } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";

interface LoginRequiredProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  featureList?: string[];
}

export const LoginRequired = ({ 
  title = "Đăng nhập để sử dụng tính năng này", 
  description = "Bạn cần đăng nhập để truy cập vào tính năng này và theo dõi tiến trình học tập của mình.",
  icon: Icon = Lock,
  featureList = []
}: LoginRequiredProps) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const handleSignIn = () => {
    setAuthModalTab('login');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthModalTab('register');
    setShowAuthModal(true);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center max-w-md w-full shadow-lg border-2 border-primary/10">
            <div className="space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="bg-primary/10 rounded-full p-6">
                  <Icon className="h-12 w-12 text-primary" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Feature List */}
              {featureList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Những gì bạn có thể làm:</h3>
                  <div className="space-y-2">
                    {featureList.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleSignIn}
                  className="w-full gap-2"
                  size="lg"
                >
                  <LogIn className="h-4 w-4" />
                  Đăng nhập ngay
                </Button>
                
                <Button 
                  onClick={handleSignUp}
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                >
                  <UserPlus className="h-4 w-4" />
                  Tạo tài khoản mới
                </Button>
              </div>

              {/* Demo accounts info */}
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p className="font-medium mb-2">🎯 Tài khoản demo:</p>
                <div className="space-y-1">
                  <p><strong>Admin:</strong> admin@demo.com / demo1234</p>
                  <p><strong>Teacher:</strong> teacher@demo.com / demo1234</p>
                  <p><strong>Student:</strong> student@demo.com / demo1234</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
      />
    </>
  );
};

// Preset components for different pages
export const ReadLoginRequired = () => (
  <LoginRequired
    title="Đăng nhập để luyện đọc"
    description="Hãy đăng nhập để bắt đầu hành trình cải thiện kỹ năng đọc với sự hỗ trợ của AI."
    icon={BookOpen}
    featureList={[
      "Nghe đọc văn bản với công nghệ text-to-speech",
      "Ghi âm giọng đọc và nhận phản hồi tức thì",
      "Theo dõi tiến độ học tập chi tiết",
      "Bài tập được đề xuất dựa trên lỗi đọc"
    ]}
  />
);

export const RecommendationsLoginRequired = () => (
  <LoginRequired
    title="Đăng nhập để xem bài tập đề xuất"
    description="Bài tập được cá nhân hóa dựa trên tiến độ học tập và những khó khăn cụ thể của bạn."
    icon={Sparkles}
    featureList={[
      "Bài tập được tạo bởi AI dựa trên lỗi đọc",
      "Tự động đề xuất sau mỗi 10 bài hoàn thành",
      "Luyện tập tập trung vào điểm yếu",
      "Theo dõi tiến bộ qua từng bài tập"
    ]}
  />
);

export const DashboardLoginRequired = () => (
  <LoginRequired
    title="Đăng nhập để xem tiến trình"
    description="Theo dõi chi tiết quá trình học tập, thống kê thành tích và xu hướng cải thiện."
    icon={BarChart3}
    featureList={[
      "Biểu đồ tiến độ trực quan theo thời gian",
      "Thống kê độ chính xác và tốc độ đọc",
      "Phân tích điểm mạnh và điểm yếu",
      "Lịch sử luyện tập chi tiết"
    ]}
  />
);
