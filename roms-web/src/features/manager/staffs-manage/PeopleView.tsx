import {
  CalendarDays,
  ChevronRight,
  Download,
  Gauge,
  Search,
  Users,
} from "lucide-react";

import PageHeading from "../common/PageHeading";
import KPI from "../common/KPI";

function PeopleView() {
  const people = [
    ["Julian Vasselli", "EXECUTIVE CHEF", "On-Shift", "$54.00/hr"],
    ["Elena Rossi", "MAITRE D’", "On-Shift", "$32.00/hr"],
    ["Marcus Thorne", "SENIOR SERVER", "Off-Duty", "$24.00/hr"],
    ["Sienna Blanc", "PASTRY CHEF", "On-Shift", "$48.00/hr"],
  ];
  return (
    <div style={{ padding: '30px 34px 60px',background: '#f7f5f2' }}>
      <PageHeading
        eyebrow="TEAM LOGISTICS"
        title="Culinary & Service Collective"
        description="Manage your brigade with surgical precision. From executive chefs to front-of-house leads, maintain the harmony that defines a five-star operation."
        actions={
          <>
            <button className="button secondary">
              <Download /> Export Roster
            </button>
            <button className="button primary">
              <Users /> Onboard Talent
            </button>
          </>
        }
      />
      <div className="people-kpis">
        <KPI icon={Users} label="ACTIVE BRIGADE" value="42" detail="people" />
        <KPI
          icon={Gauge}
          label="FLOOR EFFICIENCY"
          value="94%"
          detail="peak readiness"
        />
        <KPI
          icon={CalendarDays}
          label="OPEN SHIFTS"
          value="08"
          detail="to fill"
        />
        <div className="labor-tile">
          <small>LABOR COST %</small>
          <b>28.4</b>
          <span>↓ 1.2% vs Last Week</span>
        </div>
      </div>
      <div className="people-layout">
        <aside className="quick-filters panel">
          <h3>QUICK FILTERS</h3>
          <button className="selected">
            All Personnel <b>42</b>
          </button>
          <button>
            Kitchen Brigade <b>18</b>
          </button>
          <button>
            Front of House <b>22</b>
          </button>
          <button>
            Management <b>02</b>
          </button>
          <label className="search compact">
            <Search />
            <input placeholder="Name, Role, or ID" />
          </label>
          <div className="rbac">
            <small>RBAC STATUS</small>
            <p>
              Manager <i />{" "}
            </p>
            <p>
              Chef de Cuisine <i />{" "}
            </p>
            <p>
              Server <i className="yellow" />
            </p>
          </div>
        </aside>
        <section className="personnel panel">
          <div className="personnel-head">
            <b>PERSONNEL</b>
            <span>DESIGNATION</span>
            <span>STATUS</span>
            <span>LABOR RATE</span>
          </div>
          {people.map(([name, role, status, rate]) => (
            <div className="personnel-row" key={name}>
              <div className="person">
                <span className="person-avatar">
                  {name
                    .split(" ")
                    .map((x) => x[0])
                    .join("")}
                </span>
                <span>
                  <b>{name}</b>
                  <small>ID: WST-8821</small>
                </span>
              </div>
              <span className="role-tag">{role}</span>
              <span
                className={status === "On-Shift" ? "on-shift" : "off-shift"}
              >
                ● {status}
              </span>
              <strong>
                {rate}
                <small>42 hrs this week</small>
              </strong>
            </div>
          ))}
        </section>
      </div>
      <section className="people-banner">
        <div>
          <small>Precision in Performance</small>
          <b>Every move is calculated. Every plate is a masterpiece.</b>
          <p>
            Staff efficiency is tracked directly to kitchen output and floor
            feedback.
          </p>
          <button className="button primary">
            View Performance Analytics <ChevronRight />
          </button>
        </div>
      </section>
    </div>
  );
}

export default PeopleView;