/**
 * Word Count Range Constants
 * Quy định số từ theo độ khó
 */

export interface WordCountRange {
  label: string;
  labelVi: string;
  min: number;
  max: number;
  description: string;
  color: string;
  emoji: string;
}

export const WORD_COUNT_RANGES: Record<string, WordCountRange> = {
  EASY: {
    label: '10-30 từ',
    labelVi: 'Dễ',
    min: 10,
    max: 30,
    description: 'Phù hợp cho người mới bắt đầu',
    color: 'bg-success/10 text-success border-success/30',
    emoji: '🌱'
  },
  MEDIUM: {
    label: '25-60 từ',
    labelVi: 'Trung bình',
    min: 25,
    max: 60,
    description: 'Phát triển kỹ năng đọc',
    color: 'bg-warning/10 text-warning border-warning/30',
    emoji: '🌻'
  },
  HARD: {
    label: '50+ từ',
    labelVi: 'Khó',
    min: 50,
    max: 999,
    description: 'Thử thách nâng cao',
    color: 'bg-destructive/10 text-destructive border-destructive/30',
    emoji: '🔥'
  }
};

export const getDifficultyInfo = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'dễ':
    case 'easy':
      return {
        ...WORD_COUNT_RANGES.EASY,
        color: 'bg-success/10 text-success border-success/30'
      };
    case 'trung bình':
    case 'medium':
      return {
        ...WORD_COUNT_RANGES.MEDIUM,
        color: 'bg-warning/10 text-warning border-warning/30'
      };
    case 'khó':
    case 'hard':
      return {
        ...WORD_COUNT_RANGES.HARD,
        color: 'bg-destructive/10 text-destructive border-destructive/30'
      };
    default:
      return null;
  }
};

export const getWordCountLabel = (difficulty: string): string => {
  const info = getDifficultyInfo(difficulty);
  return info?.label || '';
};
