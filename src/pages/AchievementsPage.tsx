import React from 'react';
import { useQuery } from '@tanstack/react-query';
// Giả định: Import Icon từ thư viện bạn dùng (lucide-react)
import { Trophy, Star, Shield, Award, XCircle, Clock } from 'lucide-react'; 

// --- Định nghĩa Kiểu Dữ liệu (Types) ---
// Dữ liệu trả về từ API /api/achievements
interface AchievementDefinition {
  name: string;
  description: string;
  code: string; // FIRST_SESSION, THREE_DAY_STREAK, v.v.
  icon: string | null;
}

interface UserAchievement {
  id: number;
  dateEarned: string;
  achievement: AchievementDefinition;
}

// Hàm fetch API (Bạn cần thay thế bằng hàm fetcher thực tế của dự án)
const fetchUserAchievements = async (): Promise<UserAchievement[]> => {
  const token = localStorage.getItem('accessToken'); // Hoặc cách bạn lưu trữ token
  const response = await fetch('/api/achievements', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, 
    },
  });

  if (!response.ok) {
    // Nếu token hết hạn hoặc lỗi server
    throw new Error('Lỗi khi tải thành tựu. Vui lòng đăng nhập lại.');
  }
  return response.json();
};

// Hàm ánh xạ code thành Component Icon thực tế
const getIconComponent = (iconCode: string) => {
    switch (iconCode) {
        case 'trophy-01': return <Trophy className="w-8 h-8 text-yellow-500" />;
        case 'star-01': return <Star className="w-8 h-8 text-blue-500" />;
        case 'fire-03': return <Shield className="w-8 h-8 text-red-500" />; // Dùng Shield cho Streak
        case 'crown-01': return <Award className="w-8 h-8 text-green-500" />;
        default: return <Clock className="w-8 h-8 text-gray-400" />;
    }
};


export default function AchievementsPage() {
  const { data: achievements, isLoading, error } = useQuery<UserAchievement[], Error>({
    queryKey: ['userAchievements'],
    queryFn: fetchUserAchievements,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-lg">Đang tải thành tựu...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 text-center">
        <XCircle className="w-6 h-6 inline-block mr-2" />
        <p>Lỗi kết nối: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 dark:text-white">
        🏆 Thành Tựu Của Bạn
      </h1>
      
      {achievements && achievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((item) => (
            <div 
              key={item.id} 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-indigo-100"
            >
              <div className="flex items-start space-x-4">
                {getIconComponent(item.achievement.icon || '')}
                <div>
                  <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                    {item.achievement.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {item.achievement.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Đạt được vào: {new Date(item.dateEarned).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xl font-semibold text-gray-500">
            Bạn chưa đạt được thành tựu nào. Hãy bắt đầu luyện tập để mở khóa chúng!
          </p>
        </div>
      )}
    </div>
  );
}