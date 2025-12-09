import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, BarChart3, Headphones, Mic, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 -z-10 bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/background.jpeg')",
          backgroundSize: "100%", // Điều chỉnh kích thước ở đây
        }}
      />
      {/* Background Overlay */}
      <div className="fixed inset-0 -z-5 bg-white/80 backdrop-blur-sm" />
      
      <section className="container mx-auto px-4 py-16 text-center animate-fade-in relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Title - Always show */}
          <div className="space-y-6 mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-balance bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Chào mừng đến với DyslexiAid
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-balance">
              Ứng dụng hỗ trợ trẻ em rối loạn đọc với công nghệ AI thân thiện
            </p>
          </div>

          {/* Main Call to Action */}
          <div className="space-y-8">
            {isAuthenticated && user ? (
              /* Personalized welcome for authenticated users */
              <div className="bg-gradient-to-r from-success/10 via-primary/10 to-secondary/10 p-8 rounded-2xl border">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Xin chào, {user?.name || user?.username}! 👋
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Sẵn sàng tiếp tục hành trình học tập của bạn?
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link to="/read">
                    <Button size="lg" className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                      <BookOpen className="h-5 w-5" />
                      Tiếp tục luyện đọc
                    </Button>
                  </Link>
                  <Link to="/recommendations">
                    <Button variant="outline" size="lg" className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                      <Sparkles className="h-5 w-5" />
                      Bài tập đề xuất
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* General CTA for non-authenticated users */
              <div className="text-center space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Bắt đầu ngay hôm nay
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Đăng nhập để trải nghiệm đầy đủ tính năng và theo dõi tiến trình học tập của bạn.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link to="/read">
                    <Button size="lg" className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                      <BookOpen className="h-5 w-5" />
                      Bắt đầu luyện đọc
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-12">Tính năng nổi bật</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-slide-up border-2">
            <div className="bg-primary/10 rounded-full p-4 w-fit">
              <Headphones className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Nghe đọc văn bản</h3>
            <p className="text-muted-foreground">
              Công nghệ text-to-speech giúp trẻ nghe cách phát âm chính xác từng từ, từng câu
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-slide-up border-2" style={{ animationDelay: "0.1s" }}>
            <div className="bg-secondary/10 rounded-full p-4 w-fit">
              <Mic className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold">Ghi âm & so sánh</h3>
            <p className="text-muted-foreground">
              Ghi lại giọng đọc của trẻ và nhận phản hồi tức thì về độ chính xác
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-slide-up border-2" style={{ animationDelay: "0.2s" }}>
            <div className="bg-success/10 rounded-full p-4 w-fit">
              <BarChart3 className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold">Theo dõi tiến trình</h3>
            <p className="text-muted-foreground">
              Biểu đồ trực quan giúp cha mẹ và trẻ theo dõi sự tiến bộ từng ngày
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-slide-up border-2" style={{ animationDelay: "0.3s" }}>
            <div className="bg-warning/10 rounded-full p-4 w-fit">
              <Sparkles className="h-8 w-8 text-warning" />
            </div>
            <h3 className="text-xl font-semibold">Phản hồi tích cực</h3>
            <p className="text-muted-foreground">
              Mỗi lần luyện tập đều nhận được lời động viên và khích lệ từ hệ thống
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-slide-up border-2" style={{ animationDelay: "0.4s" }}>
            <div className="bg-primary/10 rounded-full p-4 w-fit">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Dễ sử dụng</h3>
            <p className="text-muted-foreground">
              Giao diện thân thiện, màu sắc dễ chịu, phù hợp với trẻ em từ 6-12 tuổi
            </p>
          </Card>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 py-16 mt-16 relative z-10">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hãy cùng con bắt đầu hành trình học đọc thú vị và hiệu quả ngay hôm nay!
          </p>
          <Link to="/read">
            <Button size="lg" className="gap-2 rounded-full shadow-lg">
              <BookOpen className="h-5 w-5" />
              Thử ngay miễn phí
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
