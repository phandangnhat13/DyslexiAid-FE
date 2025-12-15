import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  History, Clock, Target, Trophy, ChevronRight, 
  Loader2, Calendar, TrendingUp, Eye
} from "lucide-react";
import LessonService, { 
  LessonAttemptsResponse, 
  AllAttemptsResponse,
  LessonAttempt 
} from "@/services/lessonService";

interface LessonHistoryProps {
  lessonId?: number; // Nếu có, chỉ hiện lịch sử của lesson đó
  compact?: boolean;
}

export const LessonHistory = ({ lessonId, compact = false }: LessonHistoryProps) => {
  const [allAttempts, setAllAttempts] = useState<AllAttemptsResponse | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonAttemptsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        if (lessonId) {
          const data = await LessonService.getLessonAttempts(lessonId);
          setSelectedLesson(data);
        } else {
          const data = await LessonService.getAllAttempts();
          setAllAttempts(data);
        }
      } catch (error) {
        console.error('[LessonHistory] Error loading:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [lessonId]);

  const loadLessonDetail = async (id: number) => {
    setIsLoadingDetail(true);
    try {
      const data = await LessonService.getLessonAttempts(id);
      setSelectedLesson(data);
    } catch (error) {
      console.error('[LessonHistory] Error loading detail:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}p ${secs}s` : `${secs}s`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600 bg-green-100';
    if (accuracy >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'EASY': 'bg-green-100 text-green-800',
      'Dễ': 'bg-green-100 text-green-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'Trung bình': 'bg-yellow-100 text-yellow-800',
      'HARD': 'bg-red-100 text-red-800',
      'Khó': 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Hiển thị chi tiết cho một lesson
  if (lessonId && selectedLesson) {
    return (
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Lịch sử làm bài
          </h3>
          {selectedLesson.summary.isCompleted && (
            <Badge className="bg-green-100 text-green-800">
              <Trophy className="h-3 w-3 mr-1" />
              Đã hoàn thành
            </Badge>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">
              {selectedLesson.summary.totalAttempts}
            </div>
            <div className="text-xs text-muted-foreground">Lần thử</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className={`text-2xl font-bold ${getAccuracyColor(selectedLesson.summary.bestAccuracy)}`}>
              {selectedLesson.summary.bestAccuracy.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Điểm cao nhất</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {selectedLesson.summary.averageAccuracy.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Trung bình</div>
          </div>
        </div>

        {/* Attempts list */}
        {selectedLesson.attempts.length > 0 ? (
          <ScrollArea className="max-h-60">
            <div className="space-y-2">
              {selectedLesson.attempts.map((attempt, index) => (
                <AttemptItem 
                  key={attempt.id} 
                  attempt={attempt} 
                  isLatest={index === 0}
                  formatDate={formatDate}
                  formatDuration={formatDuration}
                  getAccuracyColor={getAccuracyColor}
                  lessonText={selectedLesson.lessonText}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Chưa có lần làm bài nào
          </div>
        )}
      </Card>
    );
  }

  // Hiển thị tất cả lịch sử
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Lịch sử luyện tập
        </h3>
        <Badge variant="outline">
          {allAttempts?.total || 0} lần
        </Badge>
      </div>

      {allAttempts && allAttempts.attempts.length > 0 ? (
        <ScrollArea className={compact ? "max-h-48" : "max-h-96"}>
          <div className="space-y-2">
            {allAttempts.attempts.map((attempt) => (
              <Dialog key={attempt.id}>
                <DialogTrigger asChild>
                  <div 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => loadLessonDetail(attempt.lessonId)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{attempt.lessonTitle}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(attempt.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getDifficultyColor(attempt.lessonDifficulty)}>
                        {attempt.lessonDifficulty}
                      </Badge>
                      <Badge className={getAccuracyColor(attempt.accuracy)}>
                        {attempt.accuracy.toFixed(0)}%
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Chi tiết bài học
                    </DialogTitle>
                  </DialogHeader>
                  
                  {isLoadingDetail ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : selectedLesson ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg">{selectedLesson.lessonTitle}</h4>
                        <Badge className={getDifficultyColor(selectedLesson.lessonDifficulty || '')}>
                          {selectedLesson.lessonDifficulty}
                        </Badge>
                      </div>

                      {/* Summary */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-muted/30 rounded-lg p-2 text-center">
                          <div className="text-lg font-bold">
                            {selectedLesson.summary.totalAttempts}
                          </div>
                          <div className="text-xs text-muted-foreground">Lần thử</div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-2 text-center">
                          <div className={`text-lg font-bold ${getAccuracyColor(selectedLesson.summary.bestAccuracy)}`}>
                            {selectedLesson.summary.bestAccuracy.toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Cao nhất</div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-2 text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {selectedLesson.summary.averageAccuracy.toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">TB</div>
                        </div>
                      </div>

                      {/* Recent attempts */}
                      <div>
                        <h5 className="text-sm font-medium mb-2">Các lần làm gần đây:</h5>
                        <ScrollArea className="max-h-40">
                          <div className="space-y-2">
                            {selectedLesson.attempts.slice(0, 5).map((a, idx) => (
                              <AttemptItem 
                                key={a.id} 
                                attempt={a} 
                                isLatest={idx === 0}
                                formatDate={formatDate}
                                formatDuration={formatDuration}
                                getAccuracyColor={getAccuracyColor}
                                lessonText={selectedLesson.lessonText}
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Không có dữ liệu
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-8 space-y-2">
          <div className="text-4xl">📝</div>
          <p className="text-muted-foreground">Chưa có lịch sử luyện tập</p>
          <p className="text-sm text-muted-foreground">
            Hãy vào "Luyện đọc" để bắt đầu!
          </p>
        </div>
      )}
    </Card>
  );
};

// Sub-component for attempt item
interface AttemptItemProps {
  attempt: LessonAttempt;
  isLatest: boolean;
  formatDate: (date: string) => string;
  formatDuration: (seconds?: number | null) => string;
  getAccuracyColor: (accuracy: number) => string;
  lessonText?: string; // Bản gốc để so sánh
}

const AttemptItem = ({ 
  attempt, 
  isLatest, 
  formatDate, 
  formatDuration, 
  getAccuracyColor,
  lessonText,
}: AttemptItemProps) => {
  const hasDetails = attempt.transcript || (attempt.errorWords && attempt.errorWords.length > 0);
  
  return (
    <div 
      className={`p-3 rounded-lg ${
        isLatest ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
            #{attempt.attemptNumber}
          </div>
          <div>
            <div className="text-sm font-medium flex items-center gap-2">
              <Target className="h-3 w-3" />
              <span className={getAccuracyColor(attempt.accuracy)}>
                {attempt.accuracy.toFixed(1)}%
              </span>
              {isLatest && (
                <Badge variant="outline" className="text-xs">Mới nhất</Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {formatDuration(attempt.duration)}
              <span>•</span>
              {formatDate(attempt.createdAt)}
            </div>
          </div>
        </div>
        
        {hasDetails && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Eye className="h-4 w-4" />
                Chi tiết
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  📝 Chi tiết lần #{attempt.attemptNumber}
                  <Badge className={getAccuracyColor(attempt.accuracy)}>
                    {attempt.accuracy.toFixed(1)}%
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Các từ đọc sai */}
                {attempt.errorWords && attempt.errorWords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-red-600">
                      ❌ Các từ đọc sai ({attempt.errorWords.length} từ):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {attempt.errorWords.map((word, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="bg-red-100 text-red-800 border-red-300"
                        >
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Bản gốc */}
                {lessonText && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-blue-600">
                      📖 Bản gốc:
                    </h4>
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                      <p className="text-sm leading-relaxed">{lessonText}</p>
                    </div>
                  </div>
                )}
                
                {/* Bản ghi của user */}
                {attempt.transcript && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-green-600">
                      🎤 Bạn đã đọc:
                    </h4>
                    <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                      <p className="text-sm leading-relaxed">{attempt.transcript}</p>
                    </div>
                  </div>
                )}

                {/* Không có dữ liệu */}
                {!attempt.transcript && (!attempt.errorWords || attempt.errorWords.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">
                    Không có dữ liệu chi tiết cho lần này.
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Quick preview of error words */}
      {attempt.errorWords && attempt.errorWords.length > 0 && (
        <div className="mt-2 pt-2 border-t border-dashed">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-red-600 font-medium">Từ sai:</span>
            {attempt.errorWords.slice(0, 3).map((word, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs bg-red-50 text-red-700 border-red-200"
              >
                {word}
              </Badge>
            ))}
            {attempt.errorWords.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{attempt.errorWords.length - 3} từ khác
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonHistory;

