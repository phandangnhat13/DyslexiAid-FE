import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, Lock, CheckCircle2, Star, TrendingUp, Award,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { Lesson, LessonWithProgress } from "@/services/lessonService";

interface LessonSelectorProps {
  lessons: (Lesson | LessonWithProgress)[];
  completedLessons: number[];
  onSelectLesson: (lesson: Lesson) => void;
}

// Type guard to check if lesson has progress
const hasProgress = (lesson: Lesson | LessonWithProgress): lesson is LessonWithProgress => {
  return 'isCompleted' in lesson;
};

const ITEMS_PER_PAGE = 9; // 3x3 grid

export const LessonSelector = ({ 
  lessons, 
  completedLessons,
  onSelectLesson 
}: LessonSelectorProps) => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalLessons = lessons.length;
  
  // Calculate completed count from lessons data (more accurate)
  const completedCount = useMemo(() => {
    return lessons.filter(l => {
      if (hasProgress(l)) {
        return l.isCompleted;
      }
      return completedLessons.includes(l.id);
    }).length;
  }, [lessons, completedLessons]);

  // Calculate attempted lessons (any lesson with attemptCount > 0)
  const attemptedCount = useMemo(() => {
    return lessons.filter(l => hasProgress(l) && l.attemptCount > 0).length;
  }, [lessons]);

  // Calculate average best accuracy across attempted lessons
  const averageBestAccuracy = useMemo(() => {
    const attemptedLessons = lessons.filter(l => hasProgress(l) && l.attemptCount > 0) as LessonWithProgress[];
    if (attemptedLessons.length === 0) return 0;
    const totalAccuracy = attemptedLessons.reduce((sum, l) => sum + l.bestAccuracy, 0);
    return Math.round(totalAccuracy / attemptedLessons.length);
  }, [lessons]);

  const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  // Get unique levels
  const levels = useMemo(() => {
    const uniqueLevels = [...new Set(lessons.map(l => l.level))].sort((a, b) => a - b);
    return uniqueLevels;
  }, [lessons]);

  // Filter lessons by selected level
  const filteredLessons = useMemo(() => {
    if (selectedLevel === null) {
      return lessons;
    }
    return lessons.filter(l => l.level === selectedLevel);
  }, [lessons, selectedLevel]);

  // Pagination
  const totalPages = Math.ceil(filteredLessons.length / ITEMS_PER_PAGE);
  const paginatedLessons = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLessons.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLessons, currentPage]);

  // Reset page when level changes
  const handleLevelChange = (level: number | null) => {
    setSelectedLevel(level);
    setCurrentPage(1);
  };

  const getLevelInfo = (level: number) => {
    switch (level) {
      case 1:
        return { color: "bg-green-500", textColor: "text-green-600", label: "Cấp 1", fullLabel: "Rất dễ", emoji: "🌱" };
      case 2:
        return { color: "bg-green-600", textColor: "text-green-700", label: "Cấp 2", fullLabel: "Dễ", emoji: "🌿" };
      case 3:
        return { color: "bg-yellow-500", textColor: "text-yellow-600", label: "Cấp 3", fullLabel: "Trung bình", emoji: "🌻" };
      case 4:
        return { color: "bg-yellow-600", textColor: "text-yellow-700", label: "Cấp 4", fullLabel: "Trung bình+", emoji: "🌳" };
      case 5:
        return { color: "bg-orange-500", textColor: "text-orange-600", label: "Cấp 5", fullLabel: "Khó", emoji: "🔥" };
      case 6:
        return { color: "bg-red-500", textColor: "text-red-600", label: "Cấp 6", fullLabel: "Rất khó", emoji: "⭐" };
      default:
        return { color: "bg-gray-500", textColor: "text-gray-600", label: "Cấp ?", fullLabel: "?", emoji: "❓" };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Dễ":
        return "bg-success/10 text-success border-success/30";
      case "Trung bình":
        return "bg-warning/10 text-warning border-warning/30";
      case "Khó":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  // Count completed for each level
  const getLevelStats = (level: number) => {
    const levelLessons = lessons.filter(l => l.level === level);
    const completed = levelLessons.filter(l => {
      if (hasProgress(l)) {
        return l.isCompleted;
      }
      return completedLessons.includes(l.id);
    }).length;
    return { total: levelLessons.length, completed };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with progress */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Lộ trình luyện đọc
          </h1>
          <p className="text-muted-foreground text-lg">
            {totalLessons} bài học từ dễ đến khó
          </p>
        </div>

        <Card className="p-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-semibold">Tiến độ của bạn</span>
              </div>
              <span className="text-sm font-medium">
                {completedCount}/{totalLessons} bài hoàn thành
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            
            {/* Show additional stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-4">
                {attemptedCount > 0 && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Đã thử: {attemptedCount} bài
                  </span>
                )}
                {averageBestAccuracy > 0 && (
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Điểm TB: {averageBestAccuracy}%
                  </span>
                )}
              </div>
              {completedCount > 0 && (
                <span className="text-success font-medium">
                  {Math.round(progressPercentage)}% hoàn thành
                </span>
              )}
            </div>

            {completedCount === totalLessons && totalLessons > 0 && (
              <div className="flex items-center justify-center gap-2 text-success pt-2">
                <Star className="h-5 w-5 fill-success" />
                <span className="font-medium">Xuất sắc! Bạn đã hoàn thành tất cả!</span>
                <Star className="h-5 w-5 fill-success" />
              </div>
            )}
            
            {attemptedCount > 0 && completedCount === 0 && (
              <p className="text-xs text-muted-foreground text-center">
                💡 Đạt 80% trở lên để hoàn thành bài học
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Level Filter Tabs */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground">Chọn cấp độ:</h3>
        <div className="flex flex-wrap gap-2">
          {/* All levels button */}
          <Button
            variant={selectedLevel === null ? "default" : "outline"}
            size="sm"
            onClick={() => handleLevelChange(null)}
            className="gap-2"
          >
            📚 Tất cả
            <Badge variant="secondary" className="ml-1">
              {lessons.length}
            </Badge>
          </Button>

          {/* Level buttons */}
          {levels.map((level) => {
            const levelInfo = getLevelInfo(level);
            const stats = getLevelStats(level);
            const isSelected = selectedLevel === level;

            return (
              <Button
                key={level}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleLevelChange(level)}
                className={`gap-2 ${isSelected ? '' : 'hover:bg-muted'}`}
              >
                <span>{levelInfo.emoji}</span>
                <span>{levelInfo.label}</span>
                <Badge 
                  variant={isSelected ? "secondary" : "outline"} 
                  className={`ml-1 text-xs ${stats.completed === stats.total && stats.total > 0 ? 'bg-success/20 text-success' : ''}`}
                >
                  {stats.completed}/{stats.total}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Current filter info */}
      {selectedLevel !== null && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Đang xem:</span>
          <Badge variant="outline" className="gap-1">
            {getLevelInfo(selectedLevel).emoji} {getLevelInfo(selectedLevel).label} - {getLevelInfo(selectedLevel).fullLabel}
          </Badge>
          <span className="text-muted-foreground">({filteredLessons.length} bài)</span>
        </div>
      )}

      {/* Lessons Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedLessons.map((lesson, index) => {
          const progress = hasProgress(lesson) ? lesson : null;
          const isCompleted = progress ? progress.isCompleted : completedLessons.includes(lesson.id);
          const isLocked = lesson.locked;
          const levelInfo = getLevelInfo(lesson.level);

          return (
            <Card
              key={lesson.id}
              className={`p-5 space-y-4 transition-all hover:shadow-lg border-2 ${
                isCompleted 
                  ? 'border-success bg-success/5' 
                  : isLocked 
                  ? 'border-muted bg-muted/5 opacity-60' 
                  : 'border-primary/20 hover:border-primary/50'
              } animate-slide-up`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`rounded-full p-2.5 ${
                    isCompleted 
                      ? 'bg-success/10' 
                      : isLocked 
                      ? 'bg-muted' 
                      : 'bg-primary/10'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : isLocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold line-clamp-1">
                          {lesson.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {lesson.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${levelInfo.color} text-white border-0`}
                      >
                        {levelInfo.emoji} {levelInfo.label}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${getDifficultyColor(lesson.difficulty)} text-xs`}
                      >
                        {lesson.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {lesson.wordCount} từ
                      </Badge>
                    </div>

                    {/* Show best accuracy if available */}
                    {progress && progress.bestAccuracy > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Award className="h-3 w-3" />
                        <span>Điểm cao: {progress.bestAccuracy.toFixed(0)}%</span>
                        {progress.attemptCount > 0 && (
                          <span className="ml-2">• {progress.attemptCount} lần</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => onSelectLesson(lesson)}
                disabled={isLocked}
                className="w-full gap-2"
                variant={isCompleted ? "outline" : "default"}
                size="sm"
              >
                {isLocked ? (
                  <>
                    <Lock className="h-4 w-4" />
                    Đang khóa
                  </>
                ) : isCompleted ? (
                  <>
                    <BookOpen className="h-4 w-4" />
                    Luyện lại
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4" />
                    Bắt đầu học
                  </>
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {paginatedLessons.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Không có bài học nào ở cấp độ này</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show limited page numbers
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                    className="w-10 h-10"
                  >
                    {page}
                  </Button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <span key={page} className="px-2 text-muted-foreground">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>

          <span className="text-sm text-muted-foreground ml-4">
            Trang {currentPage}/{totalPages}
          </span>
        </div>
      )}

      {/* Tips */}
      <Card className="p-6 bg-gradient-to-r from-accent/10 to-secondary/10 border-accent/20">
        <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-accent" />
          💡 Mẹo học tập hiệu quả
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>Bắt đầu từ bài dễ để làm quen với cách luyện tập</li>
          <li>Luyện mỗi ngày 15-20 phút để tiến bộ đều đặn</li>
          <li>Nghe kỹ cách phát âm trước khi tự đọc</li>
          <li>Đừng vội, hãy đọc chậm và rõ ràng</li>
          <li>Đạt 80% trở lên để hoàn thành bài học</li>
        </ul>
      </Card>
    </div>
  );
};
