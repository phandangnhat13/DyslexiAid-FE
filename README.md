# DyslexiAid - Ứng dụng hỗ trợ trẻ rối loạn đọc

Ứng dụng web thân thiện giúp trẻ em (6-12 tuổi) bị rối loạn đọc cải thiện kỹ năng đọc thông qua:
- 🎧 Nghe văn bản được đọc to (Text-to-Speech)
- 🎤 Ghi âm giọng đọc và nhận phản hồi
- ✨ Đơn giản hóa văn bản phức tạp bằng AI
- 📊 Theo dõi tiến trình học qua biểu đồ

## 🚀 Cài đặt và chạy

### Yêu cầu
- Node.js 18+ và npm

### Các bước cài đặt

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy ứng dụng ở chế độ development
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:8080`

## 🎨 Tính năng

### 1. Trang chủ (/)
- Giới thiệu ứng dụng
- Các tính năng nổi bật
- Call-to-action để bắt đầu

### 2. Luyện đọc (/read)
- **Text-to-Speech**: Nghe máy đọc văn bản với highlight từng từ
- **Ghi âm**: Ghi lại giọng đọc của trẻ bằng MediaRecorder API
- **Phản hồi tức thì**: Nhận điểm số và feedback về những từ cần luyện thêm
- **Nhiều văn bản mẫu**: Chọn văn bản khác để luyện tập

### 3. Đơn giản hóa (/simplify)
- Nhập văn bản phức tạp
- AI mock đơn giản hóa thành câu dễ hiểu
- Sao chép kết quả
- Văn bản mẫu để thử nghiệm

### 4. Tiến trình (/dashboard)
- Biểu đồ line chart hiển thị độ chính xác 7 ngày
- Thống kê: tổng buổi học, điểm trung bình, chuỗi ngày
- Danh sách từ cần luyện thêm
- Hệ thống thành tích động viên

## 🛠 Công nghệ

- **Framework**: React 18 + TypeScript + Vite
- **UI**: TailwindCSS + shadcn/ui
- **Routing**: React Router v6
- **Charts**: Recharts
- **Audio**: 
  - Web Speech API (Text-to-Speech)
  - MediaRecorder API (ghi âm)
- **Mock API**: Data giả trong components (không cần backend)

## 📁 Cấu trúc thư mục

```
src/
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── Navbar.tsx        # Thanh điều hướng
│   ├── Reader.tsx        # TTS + highlight text
│   ├── Recorder.tsx      # Ghi âm + feedback
│   ├── Simplifier.tsx    # Đơn giản hóa văn bản
│   └── DashboardChart.tsx # Biểu đồ tiến trình
├── pages/
│   ├── Index.tsx         # Trang chủ
│   ├── Read.tsx          # Trang luyện đọc
│   ├── Simplify.tsx      # Trang đơn giản hóa
│   └── Dashboard.tsx     # Trang thống kê
├── App.tsx               # Main app + routing
├── index.css             # Design system (colors, fonts)
└── main.tsx              # Entry point
```

## 🎯 Test nhanh

### Test TTS (Text-to-Speech)
1. Vào `/read`
2. Nhấn "Nghe đọc"
3. Quan sát từng từ được highlight

### Test ghi âm
1. Vào `/read`
2. Nhấn vào icon micro
3. Cho phép truy cập microphone
4. Đọc văn bản
5. Nhấn lại để dừng
6. Xem feedback và điểm số

### Test đơn giản hóa
1. Vào `/simplify`
2. Nhập văn bản hoặc chọn "Mẫu 1/2/3"
3. Nhấn "Làm dễ hơn"
4. Xem kết quả đơn giản hóa

### Test dashboard
1. Vào `/dashboard`
2. Xem biểu đồ 7 ngày
3. Kiểm tra thống kê và thành tích

## 🎨 Design System

### Màu sắc (Pastel - thân thiện cho trẻ)
- **Primary**: Tím nhạt (#A78BFA) - Bình tĩnh, khuyến khích
- **Secondary**: Xanh ngọc (#5EEAD4) - Thân thiện
- **Accent**: Hồng nhạt (#F9A8D4) - Ấm áp
- **Success**: Xanh lá (#6EE7B7) - Tích cực
- **Warning**: Cam nhạt (#FCD34D) - Chú ý

### Typography
- Font: **Lexend** - thiết kế đặc biệt cho người khó đọc
- Size lớn, spacing rộng, dễ đọc

### Components
- Bo tròn nhiều (rounded-full, rounded-lg)
- Shadow nhẹ nhàng
- Animations mượt mà
- Responsive đầy đủ

## 🔮 Tương lai (cần backend thật)

Khi kết nối backend, thay thế các mock sau:

1. **TTS API** (`/api/tts`): Trả audio URL thật
2. **STT API** (`/api/stt`): Chuyển audio thành text
3. **Assessment API** (`/api/assess`): Phân tích chính xác và lỗi
4. **Simplify API** (`/api/simplify`): LLM đơn giản hóa văn bản
5. **Database**: Lưu tiến trình, lịch sử, user data

## 📝 Lưu ý

- Trình duyệt cần hỗ trợ Web Speech API và MediaRecorder
- Cần cấp quyền microphone để ghi âm
- TTS tiếng Việt có thể khác nhau trên mỗi trình duyệt
- Tất cả data hiện tại đều mock, không lưu vào database

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Hãy tạo Pull Request hoặc Issue.

## 📄 License

MIT License

---

Được xây dựng với ❤️ cho các em nhỏ đang học đọc
