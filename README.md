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
- **Ghi âm**: Ghi lại giọng đọc của trẻ 
- **Phản hồi tức thì**: Nhận điểm số và feedback về những từ cần luyện thêm 
- **Nhiều văn bản mẫu**: Chọn văn bản khác để luyện tập

### 3. Bài tập đề xuất
- GỢi ý thêm bài tập cho trẻ luyện đọc
- Đa dạng bài dựa trên tiến trình mà trẻ đã hoàn thành

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
  - whisper API (Speech To Text)
    ...

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Hãy tạo Pull Request hoặc Issue.

## 📄 License

MIT License

---

Được xây dựng với ❤️ cho các em nhỏ đang học đọc
