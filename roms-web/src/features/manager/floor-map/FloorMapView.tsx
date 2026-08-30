import {
  CalendarDays,
  Clock3,
  Utensils,
  Users,
} from "lucide-react";

import PageHeading from "../common/PageHeading";
import KPI from "../common/KPI";

function FloorMapView() {
  return (
    <div style={{ padding: '30px 34px 60px', background: '#f7f5f2' }}>
      <PageHeading
        eyebrow="FLOOR OPERATIONS"
        title="Dining Room Map"
        description="Theo dõi trạng thái bàn và điều phối khu vực phục vụ."
        actions={
          <>
            <button className="button secondary">Main Hall</button>
            <button className="button primary">+ New Reservation</button>
          </>
        }
      />
      <div className="floor-kpis">
        <KPI
          icon={Users}
          label="TOTAL CAPACITY"
          value="142 / 189"
          detail="75% utilization"
        />
        <KPI
          icon={Clock3}
          label="AVG. TURNOVER"
          value="54 MIN"
          detail="+8% vs. Tuesday"
        />
        <KPI
          icon={Utensils}
          label="ACTIVE TABLES"
          value="22 OF 34"
          detail="2 reserved"
        />
        <div className="revenue-tile">
          <small>CURRENT REVENUE</small>
          <b>$4,812</b>
          <span>Until 8:00 PM</span>
        </div>
      </div>
      <div className="floor-layout">
        <section className="floor-canvas panel">
          <div className="floor-tabs">
            <button className="selected">Main Hall</button>
            <button>Terrace</button>
            <button>Private Room</button>
          </div>
          <div className="floor-legend">
            <span>
              <i className="occupied" /> Occupied
            </span>
            <span>
              <i className="available" /> Available
            </span>
            <span>
              <i className="reserved" /> Reserved
            </span>
          </div>
          <div className="table-map">
            <div className="restaurant-label">THE MIXOLOGY BAR</div>
            <button className="dining-table table-one">
              T-01<strong>6-Top</strong>
              <small>OCCUPIED • 42m</small>
            </button>
            <button className="dining-table table-two">
              T-02<strong>4</strong>
              <small>AVAILABLE</small>
            </button>
            <button className="dining-table vip-table">
              VIP-01<strong>8-Top</strong>
              <small>RESERVED • 19:30</small>
            </button>
            <div className="bottom-tables">
              <button>
                W-01
                <br />
                <b>2</b>
              </button>
              <button>
                W-02
                <br />
                <b>2</b>
              </button>
              <button>
                W-03
                <br />
                <b>2</b>
              </button>
              <button>
                W-04
                <br />
                <b>2</b>
              </button>
            </div>
          </div>
        </section>
        <aside className="floor-side">
          <section className="panel table-detail">
            <h3>Table Details</h3>
            <div className="detail-empty">
              <Utensils />
              <i>Select a table on the map to manage status and orders.</i>
            </div>
          </section>
          <section className="panel live-updates">
            <h3>
              LIVE UPDATES <b>•</b>
            </h3>
            <p>
              <Utensils /> Entrees ready for T-01<small>Kitchen • 2m ago</small>
            </p>
            <p>
              <CalendarDays /> VIP Arrival: Mr. Hender Son
              <small>Hostess • 5m ago</small>
            </p>
            <p>
              <Clock3 /> Table T-09 Cleared<small>Server • 14m ago</small>
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default FloorMapView;