# Family Expense Tracker

Ứng dụng quản lý chi tiêu gia đình với giao diện PWA hiện đại, hỗ trợ nhập liệu bằng ngôn ngữ tự nhiên tiếng Việt.

## Tính năng

### Quản lý giao dịch
- Nhập chi tiêu/thu nhập bằng ngôn ngữ tự nhiên (VD: "ăn phở 50k", "lương tháng 15tr")
- Tự động phân loại danh mục dựa trên từ khóa
- Lịch sử giao dịch với bộ lọc và phân trang
- Hỗ trợ giao dịch định kỳ (hàng ngày/tuần/tháng/năm)

### Báo cáo & Thống kê
- Tổng quan thu chi theo tháng
- Biểu đồ thu chi theo ngày/tháng/năm
- Thống kê theo danh mục và thành viên

### Quản lý danh mục
- 20 danh mục mặc định (13 chi tiêu + 7 thu nhập)
- Tùy chỉnh icon, màu sắc và từ khóa
- Thêm danh mục tùy chỉnh

### Gia đình
- Tạo gia đình và mời thành viên bằng mã mời
- Phân quyền Admin/Member
- Chia sẻ dữ liệu chi tiêu trong gia đình

### Tính năng khác
- Ngân sách theo danh mục
- Mục tiêu tiết kiệm
- Khoản vay/cho vay
- Đầu tư
- Thông báo đẩy (Push Notifications)
- Avatar người dùng (upload ảnh)

## Công nghệ

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Web Push API

### Frontend
- React 18 + Vite
- React Router v6
- Recharts (biểu đồ)
- PWA với VitePWA

## Cài đặt

### Yêu cầu
- Node.js 18+
- MongoDB

### Backend

```bash
cd server
npm install
cp .env.example .env
# Cấu hình .env với MongoDB URI và JWT secret
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## Cấu trúc thư mục

```
├── server/
│   ├── config/          # Cấu hình database
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # NLP parser, Push service
│   └── index.js         # Entry point
│
├── client/
│   ├── public/          # Static files, SW
│   └── src/
│       ├── api/         # API client
│       ├── components/  # React components
│       ├── context/     # Auth context
│       └── pages/       # Page components
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/join` - Tham gia gia đình
- `GET /api/auth/me` - Thông tin user
- `PUT /api/auth/avatar` - Cập nhật avatar

### Transactions
- `GET /api/transactions` - Danh sách giao dịch
- `POST /api/transactions` - Tạo giao dịch
- `POST /api/transactions/parse` - Phân tích NLP
- `DELETE /api/transactions/:id` - Xóa giao dịch

### Categories
- `GET /api/categories` - Danh sách danh mục
- `POST /api/categories` - Tạo danh mục
- `PUT /api/categories/:id` - Cập nhật danh mục
- `DELETE /api/categories/:id` - Xóa danh mục

### Reports
- `GET /api/reports/summary` - Tổng quan
- `GET /api/reports/daily` - Theo ngày
- `GET /api/reports/monthly` - Theo tháng

### Family
- `GET /api/family` - Thông tin gia đình
- `PUT /api/family` - Cập nhật gia đình
- `POST /api/family/regenerate-code` - Tạo mã mời mới

## Biến môi trường

```env
MONGODB_URI=mongodb://localhost:27017/family-expense
JWT_SECRET=your-secret-key
PORT=5000
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

## License

MIT

---

Made with ❤️ by Ba Thóc
