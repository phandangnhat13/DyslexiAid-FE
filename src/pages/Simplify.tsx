import { Simplifier } from "@/components/Simplifier";

const Simplify = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Đơn giản hóa văn bản
          </h1>
          <p className="text-muted-foreground">
            Biến văn bản phức tạp thành câu từ dễ hiểu với công nghệ AI
          </p>
        </div>

        <Simplifier />
      </div>
    </div>
  );
};

export default Simplify;
