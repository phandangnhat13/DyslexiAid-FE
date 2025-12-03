import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, FileText, BarChart3, Headphones, Mic, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <section className="container mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-balance bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Chào mừng đến với DyslexiAid
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground text-balance">
            Ứng dụng hỗ trợ trẻ em rối loạn đọc với công nghệ AI thân thiện
          </p>
          <div className="flex gap-4 justify-center flex-wrap pt-4">
            <Link to="/read">
              <Button size="lg" className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                <BookOpen className="h-5 w-5" />
                Bắt đầu luyện đọc
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
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

      <section className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 py-16 mt-16">
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
