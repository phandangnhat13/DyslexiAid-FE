import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, BookOpen, TrendingUp, RotateCw, Award, 
  CheckCircle2, ArrowRight, Zap
} from "lucide-react";
import { RecommendedLesson } from "@/utils/lessonRecommendation";
import { getDifficultyInfo } from "@/constants/word-count.constants";

interface RecommendedLessonsProps {
  recommendations: RecommendedLesson[];
  onSelectLesson: (lesson: RecommendedLesson) => void;
  personalizedMessage?: {
    title: string;
    message: string;
    emoji: string;
  };
  compact?: boolean;
}

export const RecommendedLessons = ({ 
  recommendations, 
  onSelectLesson,
  personalizedMessage,
  compact = false
}: RecommendedLessonsProps) => {
  
  if (recommendations.length === 0) {
    return null;
  }

  const getReasonIcon = (type: string) => {
    switch (type) {
      case 'incomplete':
        return <TrendingUp className="h-4 w-4" />;
      case 'review':
        return <RotateCw className="h-4 w-4" />;
      case 'next':
        return <ArrowRight className="h-4 w-4" />;
      case 'similar':
        return <BookOpen className="h-4 w-4" />;
      case 'challenge':
        return <Zap className="h-4 w-4" />;
      case 'practice':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getReasonColor = (type: string) => {
    switch (type) {
      case 'incomplete':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'review':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'next':
        return 'bg-primary/10 text-primary border-primary/30';
      case 'similar':
        return 'bg-secondary/10 text-secondary border-secondary/30';
      case 'challenge':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'practice':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/30';
    }
  };

  const getLevelEmoji = (level: number) => {
    const emojis = ['🌱', '🌿', '🌻', '🌳', '🔥', '⭐'];
    return emojis[level - 1] || '📚';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-full p-2">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Bài tập đề xuất
          </h2>
        </div>

        {personalizedMessage && (
          <Card className="p-4 bg-gradient-to-r from-accent/10 to-secondary/10 border-accent/20">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{personalizedMessage.emoji}</span>
              <div>
                <h3 className="font-semibold mb-1">{personalizedMessage.title}</h3>
                <p className="text-sm text-muted-foreground">{personalizedMessage.message}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Recommendations Grid */}
      <div className={`grid gap-4 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {recommendations.map((lesson, index) => {
          const difficultyInfo = getDifficultyInfo(lesson.difficulty);
          const reasonColor = getReasonColor(lesson.reason.type);
          const reasonIcon = getReasonIcon(lesson.reason.type);

          return (
            <Card
              key={lesson.id}
              className="p-5 space-y-4 transition-all hover:shadow-lg border-2 border-primary/20 hover:border-primary/50 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Priority Badge */}
              {lesson.reason.priority >= 4 && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 gap-1">
                    <Sparkles className="h-3 w-3" />
                    Đề xuất
                  </Badge>
                </div>
              )}

              <div className="space-y-3">
                {/* Title and Icon */}
                <div className="flex items-start gap-3">
                  <div className="rounded-full p-2.5 bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold line-clamp-2 mb-1">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {lesson.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reason Badge */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${reasonColor} border`}>
                  {reasonIcon}
                  <span className="text-xs font-medium">{lesson.reason.message}</span>
                </div>

                {/* Metadata Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {getLevelEmoji(lesson.level)} Cấp {lesson.level}
                  </Badge>
                  {difficultyInfo && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${difficultyInfo.color}`}
                    >
                      {difficultyInfo.emoji} {lesson.difficulty}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    📝 {lesson.wordCount} từ
                  </Badge>
                </div>

                {/* Progress Info (if available) */}
                {lesson.progress && lesson.progress.attemptCount > 0 && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      <span>Điểm cao: {lesson.progress.bestAccuracy.toFixed(0)}%</span>
                    </div>
                    {lesson.progress.isCompleted && (
                      <div className="flex items-center gap-1 text-success">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Đã hoàn thành</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Button
                onClick={() => onSelectLesson(lesson)}
                className="w-full gap-2"
                size="sm"
                variant={lesson.progress?.isCompleted ? "outline" : "default"}
              >
                {lesson.progress?.isCompleted ? (
                  <>
                    <RotateCw className="h-4 w-4" />
                    Luyện lại
                  </>
                ) : lesson.progress?.attemptCount ? (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    Tiếp tục luyện
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


      {/* Tips */}
      {!compact && (
        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Mẹo:</strong> Các bài được đề xuất dựa trên tiến độ học tập và năng lực hiện tại của bạn. 
            Hãy hoàn thành những bài đã thử để mở khóa thêm bài mới!
          </p>
        </Card>
      )}
    </div>
  );
};

