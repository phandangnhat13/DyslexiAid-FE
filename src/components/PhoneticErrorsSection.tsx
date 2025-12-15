import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, BookOpen, Loader2, RefreshCw, 
  Volume2, Sparkles, ChevronRight, CheckCircle
} from "lucide-react";
import LessonService, { 
  UserPhoneticError, 
  PhoneticLesson, 
  PHONETIC_ERROR_LABELS,
  PhoneticErrorType
} from "@/services/lessonService";

interface PhoneticErrorsSectionProps {
  onSelectLesson?: (lesson: PhoneticLesson) => void;
}

export const PhoneticErrorsSection = ({ onSelectLesson }: PhoneticErrorsSectionProps) => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<UserPhoneticError[]>([]);
  const [lessons, setLessons] = useState<PhoneticLesson[]>([]);
  const [isLoadingErrors, setIsLoadingErrors] = useState(true);
  const [isGeneratingLessons, setIsGeneratingLessons] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Dễ');
  const [message, setMessage] = useState<string>('');

  // Load phonetic errors on mount
  useEffect(() => {
    loadPhoneticErrors();
  }, []);

  const loadPhoneticErrors = async () => {
    setIsLoadingErrors(true);
    try {
      const data = await LessonService.getUserPhoneticErrors();
      setErrors(data);
      console.log('[PhoneticErrors] Loaded errors:', data);
    } catch (error) {
      console.error('[PhoneticErrors] Error loading:', error);
    } finally {
      setIsLoadingErrors(false);
    }
  };

  const generateLessons = async () => {
    if (errors.length === 0) {
      setMessage('Chưa phát hiện lỗi phát âm. Hãy luyện đọc thêm để hệ thống ghi nhận!');
      return;
    }

    setIsGeneratingLessons(true);
    setMessage('');
    try {
      const response = await LessonService.generatePhoneticLessons(selectedDifficulty, 3);
      setLessons(response.lessons);
      if (response.message) {
        setMessage(response.message);
      }
      console.log('[PhoneticErrors] Generated lessons:', response);
    } catch (error) {
      console.error('[PhoneticErrors] Error generating lessons:', error);
      setMessage('Không thể tạo bài học lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsGeneratingLessons(false);
    }
  };

  const getErrorLabel = (errorType: string) => {
    return PHONETIC_ERROR_LABELS[errorType as PhoneticErrorType] || {
      name: errorType,
      description: 'Lỗi phát âm',
      emoji: '🔤',
      color: 'bg-gray-100 text-gray-800'
    };
  };

  // Sort errors by count (most frequent first)
  const sortedErrors = [...errors].sort((a, b) => b.error_count - a.error_count);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-2">
          <Volume2 className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          Bài tập theo lỗi phát âm
        </h2>
      </div>

      {/* Phonetic Errors Summary */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Lỗi phát âm đã ghi nhận
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadPhoneticErrors}
            disabled={isLoadingErrors}
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingErrors ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isLoadingErrors ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : errors.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="text-5xl">✨</div>
            <p className="text-muted-foreground">
              Chưa phát hiện lỗi phát âm nào!
            </p>
            <p className="text-sm text-muted-foreground">
              Hãy luyện đọc trong mục <strong>"Luyện đọc"</strong> để hệ thống ghi nhận và phân tích lỗi phát âm của bạn.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Error badges grid */}
            <div className="flex flex-wrap gap-2">
              {sortedErrors.map((error) => {
                const label = getErrorLabel(error.error_type);
                return (
                  <Badge 
                    key={error.id}
                    variant="outline"
                    className={`${label.color} px-3 py-1.5 text-sm`}
                  >
                    <span className="mr-1">{label.emoji}</span>
                    {label.name}
                    <span className="ml-2 bg-white/50 rounded-full px-2 py-0.5 text-xs font-bold">
                      {error.error_count}x
                    </span>
                  </Badge>
                );
              })}
            </div>

            {/* Sample words */}
            {sortedErrors.length > 0 && sortedErrors[0].sample_words.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Ví dụ từ thường đọc sai:
                </p>
                <div className="flex flex-wrap gap-2">
                  {sortedErrors.slice(0, 3).flatMap(err => 
                    err.sample_words.slice(0, 2).map((word, idx) => (
                      <code 
                        key={`${err.id}-${idx}`}
                        className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-sm"
                      >
                        {word}
                      </code>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Generate Lessons Section */}
      {errors.length > 0 && (
        <Card className="p-5 space-y-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            Tạo bài tập luyện phát âm
          </h3>
          
          <p className="text-sm text-muted-foreground">
            AI sẽ tạo bài tập tập trung vào các âm bạn hay phát âm sai nhất.
          </p>

          {/* Difficulty selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Độ khó:</span>
            <div className="flex gap-2">
              {['Dễ', 'Trung bình', 'Khó'].map((diff) => (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={generateLessons} 
            disabled={isGeneratingLessons}
            className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {isGeneratingLessons ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tạo bài tập...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Tạo bài tập ({errors.length} lỗi phát âm)
              </>
            )}
          </Button>

          {message && (
            <p className="text-sm text-center text-muted-foreground">
              {message}
            </p>
          )}
        </Card>
      )}

      {/* Generated Lessons */}
      {lessons.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Bài tập được tạo ({lessons.length} bài)
            {lessons.some(l => l.id) && (
              <Badge variant="outline" className="bg-green-100 text-green-800 gap-1">
                <CheckCircle className="h-3 w-3" />
                Đã lưu
              </Badge>
            )}
          </h3>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson, index) => (
              <Card 
                key={lesson.id || index}
                className="p-5 space-y-3 hover:shadow-lg transition-shadow border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400"
              >
                <h4 className="font-semibold text-lg line-clamp-2">
                  {lesson.title}
                </h4>
                
                {lesson.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {lesson.description}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">
                    📝 {lesson.wordCount} từ
                  </Badge>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800">
                    {lesson.difficulty}
                  </Badge>
                  {lesson.id && (
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      ID: {lesson.id}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground italic line-clamp-3 bg-muted/30 p-2 rounded">
                  "{lesson.text.substring(0, 100)}..."
                </p>

                {/* Navigate directly if lesson has ID, otherwise use callback */}
                <Button 
                  onClick={() => {
                    if (lesson.id) {
                      // Lesson đã được lưu vào DB, navigate trực tiếp
                      navigate(`/practice/${lesson.id}`);
                    } else if (onSelectLesson) {
                      // Fallback: use callback
                      onSelectLesson(lesson);
                    }
                  }}
                  className="w-full gap-2"
                  variant={lesson.id ? "default" : "outline"}
                >
                  Luyện tập ngay
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <Card className="p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Mẹo:</strong> Hệ thống tự động phân tích lỗi phát âm mỗi khi bạn luyện đọc. 
          Hãy thường xuyên luyện tập để theo dõi tiến bộ và cải thiện phát âm!
        </p>
      </Card>
    </div>
  );
};

