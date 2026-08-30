// export default function MenuManagement() {
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold text-white mb-1">Quản lý Thực đơn</h1>
//       <p className="text-gray-600 text-sm mt-4">MenuManagement — Coming soon</p>
//     </div>
//   )
// }


import { Plus, Sparkles, SlidersHorizontal, ChevronRight, MoreVertical } from "lucide-react";

function MenuView() {
  const dishes = [
    {
      name: "Truffle Tagliatelle",
      badge: "Star Performer",
      badgeType: "primary",
      price: "$32.00",
      cost: "$8.40 (26.3%)",
      costPercent: 26.3,
      description:
        "Hand-rolled egg pasta, Périgord truffles, 30-month aged parmesan...",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-w5jd69lAMSGZcdU7PIJZYewujcWavO.png",
      action: "Edit Build",
    },
    {
      name: "Wagyu Ribeye",
      badge: "Margin Warning",
      badgeType: "warning",
      price: "$85.00",
      cost: "$49.30 (58%)",
      costPercent: 58,
      description:
        "Wagyu A5 Miyazakigyu, smoked bone marrow butter, seasonal root vegetables...",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-w5jd69lAMSGZcdU7PIJZYewujcWavO.png",
      action: "Edit Price",
    },
    {
      name: "Citrus Scallop Ceviche",
      badge: "",
      badgeType: "",
      price: "$24.00",
      cost: "$5.20 (21.6%)",
      costPercent: 21.6,
      description:
        "Hokkaido scallops, yuzu kosho, pressed cucumber, chili oil...",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-w5jd69lAMSGZcdU7PIJZYewujcWavO.png",
      action: "Edit Build",
    },
  ];

  return ( 
    <>
      <style>{`
        .menu-view {
          min-height: 100%;
          background: #f7f5f2;
          color: #1f1c1a;
          padding: 30px 34px 50px;
          font-family: Inter, "Segoe UI", Arial, sans-serif;
        }

        .menu-view-inner {
          max-width: 1320px;
          margin: 0 auto;
        }

        /* ==============================
           HEADER
        ============================== */

        .menu-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        .menu-eyebrow {
          margin: 0 0 7px;
          color: #e0611d;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .menu-title {
          margin: 0 0 8px;
          font-size: 28px;
          line-height: 1.15;
          font-weight: 750;
          letter-spacing: -0.025em;
          color: #1f1c1a;
        }

        .menu-description {
          margin: 0;
          max-width: 590px;
          color: #7a736c;
          font-size: 13.5px;
          line-height: 1.65;
        }

        .menu-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .menu-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 40px;
          padding: 0 15px;
          border-radius: 9px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          transition: all .15s ease;
        }

        .menu-button svg {
          width: 15px;
          height: 15px;
        }

        .menu-button-secondary {
          background: #fff;
          border: 1px solid #e7e1da;
          color: #1f1c1a;
        }

        .menu-button-secondary:hover {
          background: #f7f5f2;
        }

        .menu-button-primary {
          background: #1a1714;
          border: 1px solid #1a1714;
          color: #fff;
        }

        .menu-button-primary:hover {
          background: #e0611d;
          border-color: #e0611d;
        }

        /* ==============================
           KPI
        ============================== */

        .menu-kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .menu-kpi {
          background: #fff;
          border: 1px solid #ece7e1;
          border-radius: 13px;
          padding: 17px 19px;
          box-shadow:
            0 1px 2px rgba(26, 23, 20, .05),
            0 1px 7px rgba(26, 23, 20, .035);
        }

        .menu-kpi-label {
          display: block;
          margin-bottom: 10px;
          color: #7a736c;
          font-size: 10.5px;
          font-weight: 750;
          letter-spacing: .06em;
        }

        .menu-kpi-value {
          display: block;
          margin-bottom: 5px;
          color: #1f1c1a;
          font-size: 25px;
          line-height: 1;
          font-weight: 750;
        }

        .menu-kpi-value.green {
          color: #1e8a4c;
        }

        .menu-kpi-value.orange {
          color: #e0611d;
        }

        .menu-kpi-value.red {
          color: #d1372f;
        }

        .menu-kpi-value em {
          font-size: 12px;
          font-style: normal;
          font-weight: 500;
          color: #7a736c;
        }

        .menu-kpi-note {
          color: #7a736c;
          font-size: 11.5px;
        }

        .menu-kpi-note.green {
          color: #1e8a4c;
          font-weight: 600;
        }

        .menu-kpi-note.red {
          color: #d1372f;
          font-weight: 600;
        }

        /* ==============================
           MAIN GRID
        ============================== */

        .menu-main-grid {
          display: grid;
          grid-template-columns: 300px minmax(0, 1fr);
          gap: 18px;
          align-items: start;
        }

        .menu-side {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ==============================
           AI CARD
        ============================== */

        .menu-ai-card {
          background: #1a1714;
          color: #fff;
          border-radius: 14px;
          padding: 20px;
        }

        .menu-ai-label {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 15px;
          color: #e0611d;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .menu-ai-title {
          margin: 0 0 10px;
          color: #fff;
          font-size: 15px;
          line-height: 1.4;
          font-weight: 700;
        }

        .menu-ai-text {
          margin: 0 0 17px;
          color: #b7b0a8;
          font-size: 12px;
          line-height: 1.65;
        }

        .menu-ai-button {
          width: 100%;
          min-height: 38px;
          border: none;
          border-radius: 8px;
          background: #e0611d;
          color: #fff;
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 650;
          cursor: pointer;
          transition: background .15s ease;
        }

        .menu-ai-button:hover {
          background: #c04f13;
        }

        /* ==============================
           MARGIN CARD
        ============================== */

        .menu-margin-card {
          background: #fff;
          border: 1px solid #ece7e1;
          border-radius: 14px;
          box-shadow:
            0 1px 2px rgba(26, 23, 20, .05),
            0 1px 7px rgba(26, 23, 20, .035);
          padding: 18px 20px;
        }

        .menu-margin-title {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 13px;
          color: #1f1c1a;
          font-size: 11.5px;
          font-weight: 750;
        }

        .menu-margin-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d1372f;
        }

        .menu-margin-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 11px 0;
          border-top: 1px solid #ece7e1;
        }

        .menu-margin-item:first-of-type {
          border-top: none;
          padding-top: 0;
        }

        .menu-margin-name {
          color: #1f1c1a;
          font-size: 12.5px;
          font-weight: 650;
        }

        .menu-margin-note {
          margin-top: 3px;
          color: #7a736c;
          font-size: 10.5px;
        }

        .menu-margin-percent {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #d1372f;
          font-size: 13px;
          font-weight: 750;
        }

        /* ==============================
           DISH GRID
        ============================== */

        .menu-dish-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .menu-dish-card {
          overflow: hidden;
          background: #fff;
          border: 1px solid #ece7e1;
          border-radius: 14px;
          box-shadow:
            0 1px 2px rgba(26, 23, 20, .05),
            0 1px 7px rgba(26, 23, 20, .035);
        }

        .menu-dish-image {
          position: relative;
          height: 135px;
          background:
            linear-gradient(
              135deg,
              rgba(26,23,20,.08),
              rgba(26,23,20,.02)
            ),
            #e8ded3;
          background-position: center;
          background-size: cover;
        }

        .menu-dish-image::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,.03),
            rgba(0,0,0,.12)
          );
          pointer-events: none;
        }

        .menu-dish-badge {
          position: absolute;
          z-index: 1;
          top: 10px;
          left: 10px;
          padding: 4px 9px;
          border-radius: 999px;
          background: #e0611d;
          color: #fff;
          font-size: 10px;
          font-weight: 750;
        }

        .menu-dish-badge.warning {
          background: #d1372f;
        }

        .menu-dish-body {
          padding: 14px 16px 16px;
        }

        .menu-dish-title {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }

        .menu-dish-name {
          color: #1f1c1a;
          font-size: 14px;
          font-weight: 750;
        }

        .menu-dish-price {
          flex-shrink: 0;
          color: #1f1c1a;
          font-size: 14px;
          font-weight: 750;
        }

        .menu-dish-description {
          min-height: 36px;
          margin: 0 0 12px;
          color: #7a736c;
          font-size: 11.5px;
          line-height: 1.55;
        }

        .menu-food-cost {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .menu-food-cost span {
          color: #7a736c;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: .04em;
        }

        .menu-food-cost b {
          color: #1e8a4c;
          font-size: 11.5px;
        }

        .menu-food-cost b.warning {
          color: #d1372f;
        }

        .menu-cost-line {
          height: 5px;
          margin-bottom: 12px;
          overflow: hidden;
          border-radius: 999px;
          background: #ece7e1;
        }

        .menu-cost-fill {
          height: 100%;
          border-radius: inherit;
          background: #1e8a4c;
        }

        .menu-cost-fill.warning {
          background: #d1372f;
        }

        .menu-edit-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          min-height: 35px;
          border: 1px solid #ece7e1;
          border-radius: 8px;
          background: #f7f5f2;
          color: #1f1c1a;
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 650;
          cursor: pointer;
        }

        .menu-edit-button:hover {
          background: #ece7e1;
        }

        /* ==============================
           ADD NEW
        ============================== */

        .menu-new-card {
          min-height: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 28px 20px;
          border: 1.5px dashed #ded7cf;
          border-radius: 14px;
          background: transparent;
        }

        .menu-new-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          margin-bottom: 10px;
          border-radius: 50%;
          background: #fff;
          color: #7a736c;
          border: 1px solid #ece7e1;
        }

        .menu-new-title {
          margin-bottom: 5px;
          color: #1f1c1a;
          font-size: 13.5px;
          font-weight: 750;
        }

        .menu-new-text {
          max-width: 210px;
          margin: 0;
          color: #7a736c;
          font-size: 11.5px;
          line-height: 1.55;
        }

        /* ==============================
           RESPONSIVE
        ============================== */

        @media (max-width: 1100px) {
          .menu-kpis {
            grid-template-columns: repeat(2, 1fr);
          }

          .menu-main-grid {
            grid-template-columns: 1fr;
          }

          .menu-side {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 760px) {
          .menu-view {
            padding: 20px;
          }

          .menu-header {
            flex-direction: column;
          }

          .menu-header-actions {
            width: 100%;
          }

          .menu-button {
            flex: 1;
          }

          .menu-kpis {
            grid-template-columns: 1fr;
          }

          .menu-dish-grid {
            grid-template-columns: 1fr;
          }

          .menu-side {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="menu-view">
        <div className="menu-view-inner">

          {/* ================= HEADER ================= */}
          <section className="menu-header">
            <div>
              <p className="menu-eyebrow">Culinary Engineering</p>

              <h1 className="menu-title">
                The Seasonal Portfolio
              </h1>

              <p className="menu-description">
                Curate your restaurant identity. Balance inventory margins
                with creative vision through our intelligent menu architect.
              </p>
            </div>

            <div className="menu-header-actions">
              <button className="menu-button menu-button-secondary">
                <SlidersHorizontal />
                Refine View
              </button>

              <button className="menu-button menu-button-primary">
                <Plus />
                New Item
              </button>
            </div>
          </section>

          {/* ================= KPI ================= */}
          <section className="menu-kpis">

            <div className="menu-kpi">
              <span className="menu-kpi-label">
                AVERAGE PLATE MARGIN
              </span>

              <strong className="menu-kpi-value green">
                72.4%
              </strong>

              <span className="menu-kpi-note green">
                ↗ Up from last week
              </span>
            </div>

            <div className="menu-kpi">
              <span className="menu-kpi-label">
                MENU ENGINEERING SCORE
              </span>

              <strong className="menu-kpi-value">
                88<em>/100</em>
              </strong>

              <span className="menu-kpi-note">
                Overall assessment
              </span>
            </div>

            <div className="menu-kpi">
              <span className="menu-kpi-label">
                CRITICAL STOCK ALERTS
              </span>

              <strong className="menu-kpi-value red">
                04
              </strong>

              <span className="menu-kpi-note red">
                Requires action
              </span>
            </div>

            <div className="menu-kpi">
              <span className="menu-kpi-label">
                AI POTENTIAL LIFT
              </span>

              <strong className="menu-kpi-value orange">
                +$1.2k
              </strong>

              <span className="menu-kpi-note">
                Weekly
              </span>
            </div>

          </section>

          {/* ================= MAIN ================= */}
          <section className="menu-main-grid">

            {/* ---------- LEFT ---------- */}
            <div className="menu-side">

              <article className="menu-ai-card">
                <div className="menu-ai-label">
                  <Sparkles />
                  Intelligence Prompt
                </div>

                <h2 className="menu-ai-title">
                  Optimize “Truffle Tagliatelle”
                </h2>

                <p className="menu-ai-text">
                  Recent commodity price drops in European Black Truffles
                  suggest a margin increase of 12.5% is possible without
                  affecting volume if paired with a “Seasonal Limited” badge.
                </p>

                <button className="menu-ai-button">
                  Apply Recommendation
                </button>
              </article>

              <article className="menu-margin-card">

                <div className="menu-margin-title">
                  <span className="menu-margin-dot" />
                  Margin Compression
                </div>

                <div className="menu-margin-item">
                  <div>
                    <div className="menu-margin-name">
                      Wagyu Ribeye
                    </div>

                    <div className="menu-margin-note">
                      Market price volatility
                    </div>
                  </div>

                  <div className="menu-margin-percent">
                    58%
                    <ChevronRight size={14} />
                  </div>
                </div>

                <div className="menu-margin-item">
                  <div>
                    <div className="menu-margin-name">
                      Seared King Scallops
                    </div>

                    <div className="menu-margin-note">
                      Shipping surcharge
                    </div>
                  </div>

                  <div className="menu-margin-percent">
                    61%
                    <ChevronRight size={14} />
                  </div>
                </div>

              </article>

            </div>

            {/* ---------- DISHES ---------- */}
            <div className="menu-dish-grid">

              {dishes.map((dish) => (
                <article className="menu-dish-card" key={dish.name}>

                  <div
                    className="menu-dish-image"
                    style={{
                      backgroundImage: `url(${dish.image})`,
                    }}
                  >
                    {dish.badge && (
                      <span
                        className={`menu-dish-badge ${
                          dish.badgeType === "warning"
                            ? "warning"
                            : ""
                        }`}
                      >
                        {dish.badge}
                      </span>
                    )}
                  </div>

                  <div className="menu-dish-body">

                    <div className="menu-dish-title">
                      <span className="menu-dish-name">
                        {dish.name}
                      </span>

                      <span className="menu-dish-price">
                        {dish.price}
                      </span>
                    </div>

                    <p className="menu-dish-description">
                      {dish.description}
                    </p>

                    <div className="menu-food-cost">
                      <span>FOOD COST</span>

                      <b
                        className={
                          dish.costPercent >= 50
                            ? "warning"
                            : ""
                        }
                      >
                        {dish.cost}
                      </b>
                    </div>

                    <div className="menu-cost-line">
                      <div
                        className={`menu-cost-fill ${
                          dish.costPercent >= 50
                            ? "warning"
                            : ""
                        }`}
                        style={{
                          width: `${dish.costPercent}%`,
                        }}
                      />
                    </div>

                    <button className="menu-edit-button">
                      {dish.action}
                      <MoreVertical size={14} />
                    </button>

                  </div>
                </article>
              ))}

              {/* ADD NEW */}
              <article className="menu-new-card">

                <div className="menu-new-icon">
                  <Plus size={17} />
                </div>

                <div className="menu-new-title">
                  Add New Creation
                </div>

                <p className="menu-new-text">
                  Define ingredients, calculate margins, and publish
                  to floor terminals.
                </p>

              </article>

            </div>

          </section>

        </div>
      </div>
    </>
  );
}

export default MenuView;