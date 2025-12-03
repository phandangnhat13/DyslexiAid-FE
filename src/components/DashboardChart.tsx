import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, TrendingUp, Target, Award, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import LessonService, { UserStats, UserProgress } from "@/services/lessonService";

interface ChartDataPoint {
  day: string;
  date: string;
  accuracy: number;
  sessionsCompleted: number;
}

export const DashboardChart = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [progressList, setProgressList] = useState<UserProgress[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Load user stats and progress from API
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch stats and progress in parallel
        const [userStats, userProgress] = await Promise.all([
          LessonService.getUserStats(),
          LessonService.getAllProgress(),
        ]);

        setStats(userStats);
        setProgressList(userProgress);

        // Generate chart data from recent progress
        const chart = generateChartData(userProgress);
        setChartData(chart);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        // Use fallback mock data
        setChartData(generateMockChartData());
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated]);

  // Generate chart data from progress history
  const generateChartData = (progress: UserProgress[]): ChartDataPoint[] => {
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const today = new Date();
    
    // Group progress by day
    const progressByDay = new Map<string, { accuracy: number; count: number }>();
    
    progress.forEach(p => {
      if (p.lastAttemptAt) {
        const date = new Date(p.lastAttemptAt);
        const dayKey = date.toDateString();
        
        const existing = progressByDay.get(dayKey) || { accuracy: 0, count: 0 };
        existing.accuracy += p.bestAccuracy;
        existing.count += 1;
        progressByDay.set(dayKey, existing);
      }
    });

    // Generate last 7 days data
    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - index));
      const dayKey = date.toDateString();
      
      const dayProgress = progressByDay.get(dayKey);
      const avgAccuracy = dayProgress 
        ? Math.round(dayProgress.accuracy / dayProgress.count) 
        : 0;
      
      return {
        day,
        date: date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
        accuracy: avgAccuracy,
        sessionsCompleted: dayProgress?.count || 0,
      };
    });
  };

  // Fallback mock data
  const generateMockChartData = (): ChartDataPoint[] => {
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const today = new Date();
    
    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - index));
      
      return {
        day,
        date: date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
        accuracy: 0,
        sessionsCompleted: 0,
      };
    });
  };

  // Get common error words from progress
  const getCommonErrorWords = (): string[] => {
    // This would need a separate API endpoint to track error words
    // For now, return empty - could be enhanced later
    return [];
  };

  // Calculate streak (consecutive days with activity)
  const calculateStreak = (): number => {
    const activeDays = chartData.filter(d => d.sessionsCompleted > 0).length;
    return activeDays;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50" />
          <h3 className="text-xl font-semibold">Đăng nhập để xem tiến trình</h3>
          <p className="text-muted-foreground">
            Hãy đăng nhập để theo dõi tiến trình học tập và xem thống kê chi tiết.
          </p>
        </div>
      </Card>
    );
  }

  const totalSessions = stats?.totalAttempts || chartData.reduce((sum, day) => sum + day.sessionsCompleted, 0);
  const averageAccuracy = stats?.averageAccuracy || 0;
  const streak = calculateStreak();
  const completionRate = stats?.completionRate || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <p className="text-sm">Tổng số lần luyện</p>
            </div>
            <p className="text-4xl font-bold text-primary">{totalSessions}</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <p className="text-sm">Điểm trung bình</p>
            </div>
            <p className="text-4xl font-bold text-success">{averageAccuracy}%</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Award className="h-4 w-4" />
              <p className="text-sm">Điểm cao nhất</p>
            </div>
            <p className="text-4xl font-bold text-secondary">{stats?.bestAccuracy || 0}%</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <p className="text-sm">Bài đã hoàn thành</p>
            </div>
            <p className="text-4xl font-bold text-orange-500">
              {stats?.completedLessons || 0}/{stats?.totalLessons || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Completion Progress */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Tiến độ hoàn thành</h3>
            <span className="text-sm font-medium text-muted-foreground">
              {completionRate}%
            </span>
          </div>
          <Progress value={completionRate} className="h-4" />
          <p className="text-sm text-muted-foreground">
            Bạn đã hoàn thành {stats?.completedLessons || 0} trong tổng số {stats?.totalLessons || 0} bài học.
            {completionRate >= 100 && " 🎉 Xuất sắc!"}
            {completionRate >= 50 && completionRate < 100 && " 💪 Cố lên!"}
            {completionRate < 50 && " 📚 Hãy tiếp tục luyện tập!"}
          </p>
        </div>
      </Card>

      {/* Chart */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Biểu đồ tiến trình 7 ngày qua</h3>
        {chartData.some(d => d.accuracy > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
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
                formatter={(value: number, name: string) => [
                  name === 'accuracy' ? `${value}%` : value,
                  name === 'accuracy' ? 'Độ chính xác' : 'Số bài'
                ]}
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
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có dữ liệu luyện tập trong 7 ngày qua.</p>
            <p className="text-sm">Hãy bắt đầu luyện đọc để xem biểu đồ tiến trình!</p>
          </div>
        )}
      </Card>

      {/* Achievements */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">🏆 Thành tích</h3>
          <div className="space-y-4">
            {totalSessions >= 10 && (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="text-4xl">🌟</div>
                <div>
                  <p className="font-semibold">Người học chăm chỉ</p>
                  <p className="text-sm text-muted-foreground">Hoàn thành 10 lần luyện tập</p>
                </div>
              </div>
            )}

            {averageAccuracy >= 90 && (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
                <div className="text-4xl">🏆</div>
                <div>
                  <p className="font-semibold">Tiến bộ vượt bậc</p>
                  <p className="text-sm text-muted-foreground">Đạt trên 90% độ chính xác</p>
                </div>
              </div>
            )}

            {(stats?.completedLessons || 0) >= 5 && (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg border border-secondary/20">
                <div className="text-4xl">📚</div>
                <div>
                  <p className="font-semibold">Người đọc nhiều</p>
                  <p className="text-sm text-muted-foreground">Hoàn thành {stats?.completedLessons} bài học</p>
                </div>
              </div>
            )}

            {totalSessions === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Chưa có thành tích nào.</p>
                <p className="text-sm">Hãy bắt đầu luyện đọc để nhận thành tích!</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">📊 Thống kê chi tiết</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Tổng bài học</span>
              <span className="font-semibold">{stats?.totalLessons || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Bài đã hoàn thành</span>
              <span className="font-semibold text-success">{stats?.completedLessons || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Tỷ lệ hoàn thành</span>
              <span className="font-semibold">{stats?.completionRate || 0}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Tổng lần luyện tập</span>
              <span className="font-semibold">{stats?.totalAttempts || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Điểm trung bình</span>
              <span className="font-semibold text-primary">{stats?.averageAccuracy || 0}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Điểm cao nhất</span>
              <span className="font-semibold text-secondary">{stats?.bestAccuracy || 0}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tips */}
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
