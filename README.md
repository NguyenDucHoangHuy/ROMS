# 🍽️ ROMS — Restaurant Operations Management System (v2.0)
> **Dự án Thực tập** — Hệ thống Quản lý & Vận hành Nhà hàng Thông minh theo Thời gian thực (Real-time).

---

## 📌 1. Giới Thiệu Dự Án (About ROMS)
**ROMS (Restaurant Operations Management System)** là giải pháp phần mềm tổng thể nhằm chuyển đổi số quy trình vận hành nhà hàng F&B. Hệ thống giải quyết triệt để các hạn chế của mô hình truyền thống như: sai lệch đơn hàng, chậm trễ giữa Phục vụ và Bếp, thất thoát nguyên liệu kho và nghẽn nút thắt khi thanh toán/hoàn tiền.

ROMS kết hợp hệ sinh thái đa nền tảng gồm **Web App** (dành cho Khách hàng, Bếp, Thu ngân, Quản lý) và **Mobile App** (dành riêng cho Phục vụ), giao tiếp với nhau qua giao thức **WebSocket (Socket.IO)** hai chiều theo thời gian thực.

---

## ⚡ 2. Hệ Thống Hoạt Động Như Thế Nào? (How It Works)

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

- **Khách bước vào bàn:** Khách dùng điện thoại quét mã QR dán tại bàn để xem Menu và chọn món. Hệ thống tự động tạo một phiên ăn (`dining_session`) và chuyển màu bàn sang **Màu Đỏ (Occupied)** trên sơ đồ bàn real-time.
- **Truyền tin tức thời xuống Bếp (KDS):** Đơn hàng gửi đi lập tức nổi lên màn hình Bếp (Kitchen Display System). Khi Đầu bếp bấm **[Bắt đầu nấu]**, hệ thống tự động tra công thức (`recipes`) và trừ kho nguyên liệu tương ứng trong Sổ cái giao dịch kho (`stock_movements`).
- **Trả món & Bưng phục vụ:** Bếp nấu xong bấm **[Hoàn tất]**, ứng dụng di động của Phục vụ nhận được thông báo để tới bưng món ra bàn.
- **Thanh toán linh hoạt:** Khi khách tính tiền, Thu ngân xuất Hóa đơn (hỗ trợ Tách bill/Split Bill nếu khách muốn trả riêng). Thu ngân bấm Hoàn tất → Session đóng → Bàn chuyển sang **Màu Xám (Cleaning)** để dọn dẹp.

---

## ✨ 3. Các Tính Năng Nổi Bật Theo Phân Quyền (Core Features)

### 📱 1. Khách hàng (Client Web QR)
- Quét mã QR tại bàn để xem Thực đơn điện tử (không cần cài app).
- Đặt món trực tiếp, gửi ghi chú món ("Ít cay", "Không hành").
- Đặt bàn trước trực tuyến kèm cọc tiền qua VNPay/MoMo.
- Xem trạng thái món ăn đang nấu hay đã xong theo thời gian thực.

### 🚶 2. Nhân viên Phục vụ (Waiter Mobile App)
- Xem Sơ đồ bàn ăn 2D dạng lưới trực quan (Màu sắc thể hiện Bàn trống/Đã đặt/Có khách).
- Cảnh báo thông minh khi mở bàn có lịch cọc sắp tới (Time-limited Seating).
- Hỗ trợ khách order hộ tại bàn, gọi thêm nước/món lẻ.
- Điểm danh ca làm việc bằng tọa độ GPS thực tế của nhà hàng.

### 👨‍🍳 3. Đầu bếp (Kitchen KDS Web)
- Màn hình Bếp KDS Real-time phân loại đĩa ăn theo thứ tự thời gian gọi.
- Thao tác 1-chạm chuyển trạng thái món: `PENDING` → `COOKING` → `READY`.
- Báo hết nguyên liệu/từ chối nấu món để hệ thống tự đóng món trên Menu QR.

### 💳 4. Thu ngân (Cashier POS Web)
- Quản lý hóa đơn và trạng thái thanh toán của toàn bộ các phiên ăn.
- Hỗ trợ gộp bàn, chuyển bàn và Split Bill (Thanh toán tách hóa đơn con).
- Áp dụng mã Khuyến mãi/Coupon linh hoạt.
- Gửi yêu cầu Hoàn tiền (Refund) tới Manager khi có sự cố bấm nhầm bill.

### 👔 5. Quản lý (Manager Dashboard)
- Remote Approval: Phê duyệt yêu cầu Hoàn tiền từ xa qua Push Notification trên di động.
- Quản lý Kho nguyên liệu theo cơ chế Stock Ledger (Chống thất thoát).
- Cài đặt hạn mức cảnh báo tồn kho tối thiểu (`min_alert_threshold`).
- Xem Hộp đen hệ thống (`audit_logs`) ghi lại vết mọi thao tác nhạy cảm (Read-Only).
- Biểu đồ báo cáo doanh thu, món bán chạy, tỷ lệ lấp đầy bàn.

---

## 🏗️ 4. Kiến Trúc Monorepo & Cấu Trúc Thư Mục

Dự án được tổ chức theo mô hình Monorepo gồm 3 thư mục mã nguồn độc lập:

```plaintext
ROMS/
├── 📁 roms-backend/            # Core Server NestJS + PostgreSQL + Socket.IO
│   ├── prisma/                 # Database Schema (21 bảng / 6 Modules) & Migrations
│   └── src/
│       ├── common/             # Guards (RBAC), Interceptors, Filters, Decorators
│       ├── gateways/           # Socket.IO Real-time WebSockets Gateway
│       └── modules/            # Auth, Users, Tables, Menu, Orders, Inventory, Billing, HR, Audit
│
├── 📁 roms-web/                # Web Application (ReactJS Vite + Tailwind + Shadcn/ui)
│   └── src/
│       ├── features/           # client-qr, kds-kitchen, cashier-pos, manager
│       ├── components/         # TableMap2D, UI Components
│       └── services/           # Axios Interceptor & TanStack Query
│
└── 📁 roms-mobile/             # Mobile Application (React Native Expo)
    └── src/
        ├── screens/            # TableMapScreen, CreateOrderScreen, ShiftCheckInScreen
        ├── hooks/              # useGPSLocation, useSocketClient
        └── navigation/         # React Navigation
```

---

## 🛠️ 5. Công Nghệ Sử Dụng (Tech Stack Matrix)

| Thành Phần | Công Nghệ / Thư Viện | Vai Trò chính |
| :--- | :--- | :--- |
| **Backend Core** | NestJS (TypeScript) | Framework chuẩn Doanh nghiệp, Modular Monolith. |
| **Database & ORM** | PostgreSQL 16 + Prisma | Database quan hệ, Type-safe ORM, Auto-migration. |
| **Real-time Engine** | Socket.IO Gateway | Bắn sự kiện real-time giữa Web Khách, Bếp, POS và App Phục vụ. |
| **Frontend Web** | ReactJS (Vite) + TailwindCSS | Tốc độ render cực nhanh, Shadcn/ui component library. |
| **Mobile App** | React Native (Expo SDK 54) | App di động cho Phục vụ, hỗ trợ Expo Go test nhanh. |
| **State & Fetching** | TanStack Query & Zustand | Cache API state và Quản lý Global State gọn nhẹ. |

---

## 🚀 6. Hướng Dẫn Khởi Chạy Trên Máy Local (Quick Start)

### Yêu cầu hệ thống:
- Node.js v20.x hoặc v22.x LTS trở lên
- PostgreSQL 16+
- Git CLI

### Các bước thực hiện:

#### 1. Clone Repository
```bash
git clone [https://github.com/NGUYENDUCHOANGHUY/ROMS.git](https://github.com/NGUYENDUCHOANGHUY/ROMS.git)
cd ROMS
```

#### 2. Khởi chạy Backend (`roms-backend`)
```bash
cd roms-backend
npm install

# Tạo file .env dựa trên template và cấu hình DATABASE_URL
# DATABASE_URL="postgresql://postgres:password@localhost:5432/roms_db?schema=public"

# Chạy Database Migration & Seed data
npx prisma migrate dev
npx prisma db seed

# Khởi chạy server ở chế độ Development
npm run start:dev
```
> Swagger API Docs: `http://localhost:3000/api/docs`

#### 3. Khởi chạy Frontend Web (`roms-web`)
```bash
cd ../roms-web
npm install
npm run dev
```
> Web App: `http://localhost:5173`

#### 4. Khởi chạy Mobile App (`roms-mobile`)
```bash
cd ../roms-mobile
npm install
npx expo start
```
> Tải ứng dụng Expo Go trên App Store / Google Play và quét mã QR hiển thị trên Terminal để trải nghiệm App Phục vụ trên điện thoại.

---

## 👥 7. Phân Công Trách Nhiệm Kỹ Thuật (Team Matrix)

| Thành viên | Vai trò | Nhiệm vụ chính |
| :--- | :--- | :--- |
| **Dev 1 (Lead)** | Backend Core Lead | Setup NestJS Base, Prisma Schema v2.0, Auth JWT/Refresh, RBAC Guards, Swagger. |
| **Dev 2** | Real-time & AI Backend | Lập trình Socket.IO Gateway, Module Orders, Inventory Ledger, Billing & Refund. |
| **Dev 3** | Frontend Client Dev | Web Khách hàng quét QR chọn món, Đặt bàn trực tuyến, Layout Mobile-First. |
| **Dev 4** | Frontend Admin/Kitchen | Màn hình Bếp KDS Real-time, Quầy POS Cashier, Dashboard Manager & Recharts. |
| **Dev 5** | Mobile App Developer | Lập trình App React Native Expo cho Phục vụ: Sơ đồ bàn 2D, Order hộ, Điểm danh GPS. |

---

© 2026 ROMS Team — Internship Project. All Rights Reserved.