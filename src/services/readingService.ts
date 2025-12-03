/**
 * Reading Service - Tích hợp với Backend API
 * Xử lý so sánh văn bản, phân tích lỗi đọc và Text-to-Speech
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Cache for TTS audio to avoid repeated API calls
const ttsCache = new Map<string, string>();

// ==================== Types ====================

export interface CompareResult {
  accuracyPercentage: number;
  highlightedOriginal: string;
  wrongWords: string[];
  details: {
    original: string;
    transcribed: string;
    correctChars: number;
    totalChars: number;
  };
}

export interface FeedbackMessage {
  accuracy: number;
  message: string;
  encouragement: string;
  errors: string[];
}

// ==================== Reading Service ====================

export class ReadingService {
  /**
   * So sánh văn bản gốc với văn bản đã đọc (không cần auth)
   */
  static async compareTexts(originalText: string, transcribedText: string): Promise<CompareResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/reading/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText,
          transcribedText,
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể so sánh văn bản');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Compare texts error:', error);
      // Fallback: so sánh local nếu API lỗi
      return this.compareTextsLocal(originalText, transcribedText);
    }
  }

  /**
   * So sánh văn bản local (fallback khi API không hoạt động)
   */
  static compareTextsLocal(original: string, transcribed: string): CompareResult {
    const origNorm = original.toLowerCase().trim();
    const transNorm = transcribed.toLowerCase().trim();

    let correctChars = 0;
    const highlighted: string[] = [];
    
    const maxLen = Math.max(origNorm.length, transNorm.length);
    for (let i = 0; i < maxLen; i++) {
      const origChar = origNorm[i] || '';
      const transChar = transNorm[i] || '';

      if (origChar === transChar && origChar !== '') {
        correctChars++;
        highlighted.push(`<span class="correct">${origChar}</span>`);
      } else if (origChar === '') {
        highlighted.push(`<span class="extra">${transChar}</span>`);
      } else {
        highlighted.push(`<span class="wrong">${origChar}</span>`);
      }
    }

    const accuracy = origNorm.length > 0 
      ? Math.round((correctChars / origNorm.length) * 100) 
      : 0;

    // Find wrong words
    const origWords = origNorm.split(/\s+/).filter(Boolean);
    const transWords = transNorm.split(/\s+/).filter(Boolean);
    const wrongWords: string[] = [];

    origWords.forEach((word, i) => {
      if (i >= transWords.length || word !== transWords[i]) {
        wrongWords.push(word);
      }
    });

    return {
      accuracyPercentage: accuracy,
      highlightedOriginal: highlighted.join(''),
      wrongWords,
      details: {
        original: origNorm,
        transcribed: transNorm,
        correctChars,
        totalChars: origNorm.length,
      },
    };
  }

  /**
   * Tạo feedback message dựa trên độ chính xác
   */
  static generateFeedback(accuracy: number, wrongWords: string[]): FeedbackMessage {
    let message: string;
    let encouragement: string;

    if (accuracy >= 95) {
      message = "🌟 Xuất sắc! Bạn đọc rất tuyệt vời!";
      encouragement = "Hãy tiếp tục phát huy nhé!";
    } else if (accuracy >= 90) {
      message = "🎉 Tuyệt vời! Bạn đọc rất tốt!";
      encouragement = "Chỉ còn một chút nữa thôi!";
    } else if (accuracy >= 80) {
      message = "👍 Tốt lắm! Bạn đã hoàn thành bài đọc!";
      encouragement = "Cố gắng thêm để đạt điểm cao hơn nhé!";
    } else if (accuracy >= 70) {
      message = "💪 Khá tốt! Bạn đang tiến bộ!";
      encouragement = "Hãy luyện thêm các từ khó nhé!";
    } else if (accuracy >= 50) {
      message = "📚 Cần cố gắng thêm!";
      encouragement = "Đọc chậm lại và rõ ràng hơn nhé!";
    } else {
      message = "🌱 Đừng nản chí!";
      encouragement = "Hãy nghe lại và thử đọc lại từ từ nhé!";
    }

    return {
      accuracy,
      message,
      encouragement,
      errors: wrongWords,
    };
  }

  /**
   * Text-to-Speech using Google TTS API (FREE)
   * Returns audio URL (blob URL)
   */
  static async textToSpeech(text: string): Promise<string> {
    // Check cache first
    const cacheKey = text;
    if (ttsCache.has(cacheKey)) {
      console.log('🔊 TTS from cache');
      return ttsCache.get(cacheKey)!;
    }

    try {
      console.log('🔊 Calling TTS API...');
      const response = await fetch(`${API_BASE_URL}/reading/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('TTS API error:', response.status, errorText);
        throw new Error(`TTS API failed: ${response.status}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      console.log('🔊 TTS audio received:', audioBlob.size, 'bytes');
      
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the result
      ttsCache.set(cacheKey, audioUrl);
      
      return audioUrl;
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }

  /**
   * Play text using Google TTS
   * Falls back to browser TTS if API fails
   */
  static async playText(text: string): Promise<HTMLAudioElement | null> {
    try {
      const audioUrl = await this.textToSpeech(text);
      const audio = new Audio(audioUrl);
      await audio.play();
      return audio;
    } catch (error) {
      console.warn('Google TTS failed, falling back to browser TTS:', error);
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
      return null;
    }
  }

  /**
   * Clear TTS cache
   */
  static clearCache(): void {
    ttsCache.forEach(url => URL.revokeObjectURL(url));
    ttsCache.clear();
  }
}

export default ReadingService;

