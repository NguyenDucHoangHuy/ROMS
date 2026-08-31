import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  ShoppingBasket,
  Sparkles,
  Store,
} from "lucide-react";

import PageHeading from "../common/PageHeading";
import KPI from "../common/KPI";

export default function SuppliersView() {
  const suppliers = [
    [
      "Green Meadow Farms",
      "Rau củ quả tươi",
      "Nguyễn Văn A",
      "090-123-4567",
      "3",
    ],
    ["Ocean Prime Seafood", "Hải sản", "Trần Thị B", "091-987-6543", "0"],
    ["Sunrise Poultry", "Gia cầm & Trứng", "Lê Hoàng C", "098-555-1212", "1"],
    ["Elite Packaging", "Vật tư tiêu hao", "Phạm Thị D", "093-222-3333", "!"],
  ];
  return (
    <div style={{ padding: '30px 34px 60px',background: '#f7f5f2' }}>
      <PageHeading
        title="Nhà cung cấp"
        description="Quản lý đối tác và nguồn nguyên liệu của bạn."
        actions={
          <button className="button primary">
            <Plus /> Đăng ký nhà cung cấp mới
          </button>
        }
      />
      <div className="kpi-grid three">
        <KPI
          icon={Store}
          label="Tổng Nhà Cung Cấp"
          value="24"
          detail="+3 tháng này"
        />
        <KPI
          icon={ShoppingBasket}
          label="Đơn Chờ Giao"
          value="12"
          detail="Cần theo dõi"
        />
        <KPI
          icon={Sparkles}
          label="Đối Tác Ưu Tiên"
          value="8"
          detail="Ký hợp đồng dài hạn"
        />
      </div>
      <section className="panel table-panel supplier-panel">
        <div className="supplier-toolbar">
          <label className="search compact">
            <Search />
            <input placeholder="Tìm theo tên, danh mục..." />
          </label>
          <button className="icon-button">
            <Settings />
          </button>
          <small>Xuất CSV</small>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tên nhà cung cấp</th>
                <th>Danh mục</th>
                <th>Người liên hệ</th>
                <th>Số điện thoại</th>
                <th>Đơn hàng đang giao</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(([name, category, contact, phone, orders]) => (
                <tr key={name}>
                  <td>
                    <div className="supplier-name">
                      <span>{name.slice(0, 2).toUpperCase()}</span>
                      <b>
                        {name}
                        <small>Đã xác thực</small>
                      </b>
                    </div>
                  </td>
                  <td>
                    <span className="tag">{category}</span>
                  </td>
                  <td>{contact}</td>
                  <td>{phone}</td>
                  <td>
                    <span
                      className={`order-count ${orders === "!" ? "danger" : ""}`}
                    >
                      {orders}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Hiển thị 1-4 trên 24</span>
          <div className="pagination">
            <button>
              <ChevronLeft />
            </button>
            <button>
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}