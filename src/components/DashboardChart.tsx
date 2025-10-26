import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Mock data for the last 7 days
const generateMockData = () => {
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const today = new Date();
  
  return days.map((day, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - index));
    
    return {
      day,
      date: date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
      accuracy: Math.floor(Math.random() * 20) + 75, // 75-95%
      sessionsCompleted: Math.floor(Math.random() * 3) + 1, // 1-4 sessions
    };
  });
};

const mockData = generateMockData();

// Common errors mock data
const commonErrors = [
  { word: "đọc", count: 5 },
  { word: "ngắn", count: 4 },
  { word: "vui", count: 3 },
  { word: "chơi", count: 3 },
  { word: "sáng", count: 2 },
];

export const DashboardChart = () => {
  const totalSessions = mockData.reduce((sum, day) => sum + day.sessionsCompleted, 0);
  const averageAccuracy = Math.round(
    mockData.reduce((sum, day) => sum + day.accuracy, 0) / mockData.length
  );

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Tổng số buổi luyện</p>
            <p className="text-4xl font-bold text-primary">{totalSessions}</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Điểm trung bình</p>
            <p className="text-4xl font-bold text-success">{averageAccuracy}%</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Chuỗi ngày liên tiếp</p>
            <p className="text-4xl font-bold text-secondary">7 🔥</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Biểu đồ tiến trình 7 ngày</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="day" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              name="Độ chính xác (%)"
              dot={{ fill: 'hsl(var(--primary))', r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Từ cần luyện thêm</h3>
          <div className="space-y-3">
            {commonErrors.map((error, index) => (
              <div 
                key={error.word} 
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-primary">
                    #{index + 1}
                  </span>
                  <span className="font-medium">{error.word}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {error.count} lần
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Thành tích</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <div className="text-4xl">🌟</div>
              <div>
                <p className="font-semibold">Người học chăm chỉ</p>
                <p className="text-sm text-muted-foreground">Hoàn thành 7 ngày liên tiếp</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
              <div className="text-4xl">🏆</div>
              <div>
                <p className="font-semibold">Tiến bộ vượt bậc</p>
                <p className="text-sm text-muted-foreground">Đạt trên 90% độ chính xác</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg border border-secondary/20">
              <div className="text-4xl">📚</div>
              <div>
                <p className="font-semibold">Người đọc nhiều</p>
                <p className="text-sm text-muted-foreground">Hoàn thành {totalSessions} bài luyện tập</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
        <h3 className="font-semibold mb-3 text-lg">💪 Lời khuyên:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>Hãy luyện tập ít nhất 15 phút mỗi ngày</li>
          <li>Tập trung vào những từ khó để cải thiện nhanh hơn</li>
          <li>Đọc to và rõ ràng để máy ghi âm chính xác</li>
          <li>Đừng nản lòng nếu chưa đạt điểm cao, mỗi ngày con đều tiến bộ!</li>
        </ul>
      </Card>
    </div>
  );
};
