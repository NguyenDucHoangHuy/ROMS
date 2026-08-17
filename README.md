# 🍽️ ROMS — Restaurant Operations Management System (v2.0)
> **Dự án Thực tập** — Hệ thống Quản lý & Vận hành Nhà hàng Thông minh theo Thời gian thực (Real-time).

---

## 📌 1. Giới Thiệu Dự Án (About ROMS)
**ROMS (Restaurant Operations Management System)** là giải pháp phần mềm tổng thể nhằm chuyển đổi số quy trình vận hành nhà hàng F&B. Hệ thống giải quyết triệt để các hạn chế của mô hình truyền thống như: sai lệch đơn hàng, chậm trễ giữa Phục vụ và Bếp, thất thoát nguyên liệu kho và nghẽn nút thắt khi thanh toán/hoàn tiền.

ROMS kết hợp hệ sinh thái đa nền tảng gồm **Web App** (dành cho Khách hàng quét QR, Bếp KDS, Thu ngân POS, Quản lý Dashboard) và **Mobile App** (dành riêng cho Nhân viên Phục vụ di động & Điểm danh GPS), giao tiếp với nhau qua giao thức **WebSocket (Socket.IO)** hai chiều theo thời gian thực.

---

## ⚙️ 2. Bảng Thống Kê Phiên Bản & Thư Viện (Tech Stack & Versions)

Tất cả các dự án thuộc monorepo ROMS đều chạy chuẩn xác trên nền tảng **Node.js LTS (v20+ / v22+ / v24+)**:

### 🟢 2.1. Backend (`roms-backend`)
- **Framework Core**: NestJS `^11.0.1` (TypeScript `^5.1.3`)
- **Database & ORM**: PostgreSQL 16 + Prisma ORM `^6.19.3`
- **Real-time Gateway**: `@nestjs/platform-socket.io` `^11.1.28` + `socket.io` `^4.8.3`
- **Authentication & Security**: `@nestjs/jwt` `^11.0.2`, `@nestjs/passport` `^11.0.5`, `passport-jwt` `^4.0.1`, `bcrypt` `^6.0.0`
- **API Documentation**: `@nestjs/swagger` `^11.0.1`
- **Validation**: `class-validator` `^0.15.1`, `class-transformer` `^0.5.1`

### 🔵 2.2. Web App (`roms-web`)
- **Core Framework**: React `^19.2.8` + Vite `^8.2.0` (TypeScript `~6.0.2`)
- **Styling**: TailwindCSS `v4` + Shadcn/ui design tokens
- **Routing**: `react-router-dom` `^7.x`
- **State Management**: `zustand` `^5.x` (Global client state) & `@tanstack/react-query` `^5.x` (Server state caching)
- **Real-time Client**: `socket.io-client` `^4.x`
- **HTTP Client**: `axios` `^1.x` (Tự động đính kèm JWT & Refresh Token interceptors)
- **UI Components & Icons**: `lucide-react`, `recharts` (Biểu đồ báo cáo Manager)

### 🟣 2.3. Mobile App (`roms-mobile`)
- **Framework**: React Native `0.81.5` + Expo SDK `~54.0.35` (TypeScript `~5.9.2`)
- **Navigation**: React Navigation `^7.x` (`@react-navigation/native-stack`, `@react-navigation/bottom-tabs`)
- **State Management**: `zustand` & `@tanstack/react-query`
- **Hardware Integration**: `expo-location` (Điểm danh xác thực tọa độ GPS ca làm)
- **Storage**: `@react-native-async-storage/async-storage` (Lưu JWT Token phiên đăng nhập)
- **Real-time Client**: `socket.io-client`
- **Icons**: `lucide-react-native` + `react-native-svg`

---

## ⚡ 3. Luồng Vận Hành Real-time (How It Works)

Luồng vận hành của ROMS xoay quanh thực thể trung tâm là **`dining_session` (Lượt ăn của khách)**, kết nối tất cả các bộ phận trong nhà hàng qua các bước:

```text
[1. KHÁCH HÀNG]              [2. PHỤC VỤ]               [3. BẾP / KITCHEN]           [4. THU NGÂN / QUẢN LÝ]
  Quét QR tại bàn             Bấm order hộ                Màn hình KDS                  POS & Dashboard
        │                           │                           │                              │
        ▼                           ▼                           │                              │
  Gửi Order (Web) ───────► Tạo Đơn (Mobile)                    │                              │
        │                           │                           │                              │
        └───────────────────────────┴───────► NestJS API ───────┘                              │
                                                  │ (Socket.IO Real-time)                      │
                                                  ▼                                            │
                                            Cập nhật KDS ──────────────────────────────────────┘
                                            - Chef bấm "Nấu" (COOKING)
                                            - Tự động trừ Kho (Stock Ledger)
                                            - Chef bấm "Xong" (READY)
                                                  │
                                                  ▼
                                            Thông báo Phục vụ bưng món (SERVED)
                                                  │
                                                  ▼
                                            Thanh toán (Split Bill / QR / Complete Session)
```

1. **Khách bước vào bàn:** Khách dùng điện thoại quét mã QR dán tại bàn để xem Menu và chọn món. Hệ thống tự động tạo một phiên ăn (`dining_session`) và chuyển màu bàn sang **Màu Đỏ (Occupied)** trên sơ đồ bàn real-time.
2. **Truyền tin tức thời xuống Bếp (KDS):** Đơn hàng gửi đi lập tức nổi lên màn hình Bếp (Kitchen Display System). Khi Đầu bếp bấm **[Bắt đầu nấu]**, hệ thống tự động tra công thức (`recipes`) và trừ kho nguyên liệu tương ứng trong Sổ cái giao dịch kho (`stock_movements`).
3. **Trả món & Bưng phục vụ:** Bếp nấu xong bấm **[Hoàn tất]**, ứng dụng di động của Phục vụ nhận được thông báo đẩy để tới bưng món ra bàn.
4. **Thanh toán linh hoạt:** Khi khách tính tiền, Thu ngân xuất Hóa đơn (hỗ trợ Tách bill/Split Bill nếu khách muốn trả riêng). Thu ngân bấm Hoàn tất → Session đóng → Bàn chuyển sang **Màu Xám (Cleaning)** để dọn dẹp.

---

## ✨ 4. Các Tính Năng Nổi Bật Theo Phân Quyền (Core Features)

### 📱 1. Khách hàng (Client Web QR)
- Quét mã QR tại bàn để xem Thực đơn điện tử (không cần cài app).
- Đặt món trực tiếp, gửi ghi chú món ("Ít cay", "Không hành").
- Đặt bàn trước trực tuyến kèm cọc tiền qua VNPay/MoMo.
- Nhận gợi ý món ăn thông minh từ module AI Recommendation.
- Xem tiến trình nấu món theo thời gian thực (`PENDING` → `COOKING` → `READY` → `SERVED`).

### 🚶 2. Nhân viên Phục vụ (Waiter Mobile App)
- Xem Sơ đồ bàn ăn 2D dạng lưới trực quan (Màu sắc thể hiện Bàn trống / Đã đặt / Có khách / Đang dọn).
- Check-in nhận bàn cho khách đã đặt trước (Reservation Check-in).
- Hỗ trợ khách order hộ tại bàn, gọi thêm nước/món lẻ.
- Thao tác ghép bàn (Merge Tables) cho đoàn đông.
- Điểm danh ca làm việc bằng tọa độ GPS thực tế tại vị trí nhà hàng.

### 👨‍🍳 3. Đầu bếp (Kitchen KDS Web)
- Màn hình Bếp KDS Real-time phân loại đĩa ăn theo thứ tự thời gian gọi (FIFO).
- Thao tác 1-chạm chuyển trạng thái món: `PENDING` → `COOKING` → `READY`.
- Đánh dấu hết món nhanh (Out of Stock Alert) để hệ thống tự động khóa món trên Menu QR và Mobile Waiter App.
- Đẩy món ưu tiên (High Priority) cho bàn VIP hoặc bàn chờ lâu.

### 💳 4. Thu ngân (Cashier POS Web)
- Quản lý hóa đơn và trạng thái thanh toán của toàn bộ các phiên ăn.
- Hỗ trợ Split Bill (Thanh toán tách hóa đơn con theo món hoặc chia đều).
- Tích hợp quét thẻ thành viên / nhập SĐT để tự động tính chiết khấu hạng Loyalty (Vàng, Bạc, Đồng).
- Xử lý hoàn tiền / hủy giao dịch lỗi (Refund / Void) với passcode xác nhận từ Manager.

### 👔 5. Quản lý (Manager Dashboard)
- Biểu đồ báo cáo doanh thu, chi phí, món bán chạy và tích hợp AI Forecast dự báo lượng khách/doanh thu các ngày tiếp theo.
- Quản lý kho nguyên liệu tự động theo định lượng món ăn, cài đặt hạn mức cảnh báo tồn kho tối thiểu.
- Sắp xếp ca làm việc tuần cho nhân viên (Scheduling) chống xung đột lịch.
- Xem Hộp đen hệ thống (`audit_logs`) ghi lại vết mọi thao tác nhạy cảm (Read-Only).

---

## 🏗️ 5. Kiến Trúc Monorepo & Cấu Trúc Thư Mục

Dự án được tổ chức theo mô hình Monorepo gồm 3 thư mục mã nguồn độc lập với cấu trúc đã được chuẩn hóa:

```plaintext
ROMS/
├── 📁 roms-backend/            # Core Server NestJS v11 + PostgreSQL + Socket.IO
│   ├── prisma/                 # Database Schema (21 bảng / 6 Modules) & Migrations
│   └── src/
│       ├── common/             # Guards (RBAC), Interceptors, Filters, Decorators
│       ├── gateways/           # Socket.IO Real-time WebSockets Gateway
│       └── modules/            # Auth, Users, Tables, Menu, Orders, Inventory, Billing, HR, Audit
│
├── 📁 roms-web/                # Web Application (React 19 + Vite 8 + Tailwind v4 + Shadcn/ui)
│   └── src/
│       ├── constants/          # roles.ts, routes.ts, queryKeys.ts
│       ├── features/           # auth, client-qr, kds-kitchen, cashier-pos, manager
│       ├── layouts/            # AdminLayout, KitchenLayout, CashierLayout, ClientLayout
│       ├── routes/             # AppRoutes, ProtectedRoute (RBAC Guard)
│       ├── services/           # Axios Client + API Service modules
│       └── stores/             # Zustand (authStore, cartStore, kitchenStore, notificationStore)
│
└── 📁 roms-mobile/             # Mobile Application (React Native 0.81 + Expo SDK 54)
    └── src/
        ├── components/         # TableGrid2D, UI components
        ├── hooks/              # useGPSLocation, useSocketClient, useAuth
        ├── navigation/         # AppNavigator, AuthStack, WaiterTab
        ├── screens/            # LoginScreen, TableMapScreen, CreateOrderScreen, ShiftCheckInScreen, ProfileScreen
        ├── services/           # Axios api.ts, Socket.IO client
        └── stores/             # useWaiterAuthStore, useActiveTableStore
```

---

## 🚀 6. Hướng Dẫn Khởi Chạy Trên Máy Local (Quick Start)

### Yêu cầu hệ thống:
- Node.js LTS (v20, v22, v24)
- PostgreSQL 16+
- Git CLI

### Các bước thực hiện:

#### 1. Clone Repository
```bash
git clone https://github.com/NGUYENDUCHOANGHUY/ROMS.git
cd ROMS
```

#### 2. Khởi chạy Backend (`roms-backend`)
```bash
cd roms-backend
npm install

# Tạo file .env dựa trên template và cấu hình DATABASE_URL
# DATABASE_URL="postgresql://postgres:password@localhost:5432/roms_db?schema=public"

# Chạy Database Migration & Seed data mẫu
npx prisma migrate dev
npx prisma db seed

# Khởi chạy server ở chế độ Development
npm run start:dev
```
> 📚 Swagger API Docs: `http://localhost:3000/api/docs`

#### 3. Khởi chạy Frontend Web (`roms-web`)
```bash
cd ../roms-web
npm install
npm run dev
```
> 💻 Web App: `http://localhost:5173`

#### 4. Khởi chạy Mobile App (`roms-mobile`)
```bash
cd ../roms-mobile
npm install
npx expo start
```
> 📱 Tải ứng dụng **Expo Go** trên App Store / Google Play và quét mã QR hiển thị trên Terminal để trải nghiệm App Phục vụ trên điện thoại.

---

## 👥 7. Phân Công Trách Nhiệm Kỹ Thuật (Team Matrix)

| Thành viên | Vai trò | Nhiệm vụ chính |
| :--- | :--- | :--- |
| **Dev 1 (Lead)** | Backend Core Lead | Setup NestJS Base, Prisma Schema v2.0, Auth JWT/Refresh, RBAC Guards, Swagger Docs. |
| **Dev 2** | Real-time & AI Backend | Lập trình Socket.IO Gateway, Module Orders, Inventory Ledger, Billing & Refund, AI Analytics. |
| **Dev 3** | Frontend Client Dev | Web Khách hàng quét QR chọn món, Đặt bàn trực tuyến, AI Recommendations UI. |
| **Dev 4** | Frontend Admin/Kitchen | Màn hình Bếp KDS Real-time, Quầy POS Cashier, Dashboard Manager & Recharts. |
| **Dev 5** | Mobile App Developer | Lập trình App React Native Expo cho Phục vụ: Sơ đồ bàn 2D, Order hộ, Điểm danh GPS. |

---

© 2026 ROMS Team — Internship Project. All Rights Reserved.