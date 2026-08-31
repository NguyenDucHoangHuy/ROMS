// export default function InventoryPage() {
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold text-white mb-1">Quản lý Kho hàng</h1>
//       <p className="text-gray-600 text-sm mt-4">InventoryPage — Coming soon</p>
//     </div>
//   )
// }

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Settings,
} from "lucide-react";

import PageHeading from "../common/PageHeading";

function InventoryView() {
  const items = [
    [
      "Thịt bò Kobe A5",
      "Thịt & Gia cầm",
      "MT-KB-001",
      "12.5",
      "kg",
      "5.0",
      "Còn hàng",
      "ok",
    ],
    [
      "Sữa tươi không đường",
      "Sữa & Chế phẩm",
      "DR-ML-045",
      "15.0",
      "lit",
      "20.0",
      "Sắp hết",
      "late",
    ],
    [
      "Cà chua Cherry",
      "Rau củ",
      "VG-TM-012",
      "0.0",
      "kg",
      "3.0",
      "Hết hàng",
      "absent",
    ],
    [
      "Bột mì đa dụng",
      "Đồ khô",
      "DR-FL-002",
      "45.0",
      "kg",
      "10.0",
      "Còn hàng",
      "ok",
    ],
  ];
  return (
    <div style={{ padding: '30px 34px 60px' ,background: '#f7f5f2'}}>
      <PageHeading
        title="Danh sách nguyên liệu"
        description="Quản lý và theo dõi số lượng tồn kho nguyên liệu."
        actions={
          <button className="button primary">
            <Plus /> Thêm nguyên liệu
          </button>
        }
      />
      <div className="filter-bar">
        <button className="select-button">
          Tất cả Danh mục <ChevronDown />
        </button>
        <button className="select-button">
          Tất cả Trạng thái <ChevronDown />
        </button>
        <button className="icon-button">
          <Settings />
        </button>
      </div>
      <section className="panel table-panel inventory-table">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tên Nguyên liệu</th>
                <th>Danh mục</th>
                <th>Mã SKU</th>
                <th>Tồn kho hiện tại</th>
                <th>Đơn vị</th>
                <th>Mức tối thiểu</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item[2]}>
                  <td>
                    <b>{item[0]}</b>
                  </td>
                  <td>{item[1]}</td>
                  <td className="mono">{item[2]}</td>
                  <td className={item[6] === "Hết hàng" ? "late-text" : ""}>
                    {item[3]}
                  </td>
                  <td>{item[4]}</td>
                  <td>{item[5]}</td>
                  <td>
                    <span className={`status ${item[7]}`}>{item[6]}</span>
                  </td>
                  <td>
                    <button className="more-button">
                      <MoreVertical />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Hiển thị 1 đến 4 trong số 45 kết quả</span>
          <div className="pagination">
            <button>
              <ChevronLeft />
            </button>
            <button className="current">1</button>
            <button>2</button>
            <button>3</button>
            <button>
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default InventoryView;