// export default function AnalyticsDashboard() {
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold text-white mb-1">Tổng quan & Doanh thu</h1>
//       <p className="text-gray-400 text-sm mb-8">AI Analytics Dashboard</p>
//       <div className="text-gray-600 text-sm">AnalyticsDashboard — Coming soon</div>
//     </div>
//   )
// }

"use client";

import {
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

type Dish = {
  name: string;
  category: string;
  price: string;
  image: string;
  tag: string;
  tagClass?: string;
  metric: string;
  change: string;
};

const dishes: Dish[] = [
  {
    name: "Truffle Risotto",
    category: "ENTRÉE",
    price: "$32",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-w5jd69lAMSGZcdU7PIJZYewujcWavO.png",
    tag: "Trending",
    metric: "42%",
    change: "+12%",
  },
  {
    name: "Deconstructed Caprese",
    category: "APPETIZER",
    price: "$21",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-w5jd69lAMSGZcdU7PIJZYewujcWavO.png",
    tag: "High Margin",
    tagClass: "high",
    metric: "Stable",
    change: "12 min",
  },
  {
    name: "Wagyu Striploin",
    category: "MAINS",
    price: "$85",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-w5jd69lAMSGZcdU7PIJZYewujcWavO.png",
    tag: "Inventory Risk",
    tagClass: "risk",
    metric: "-8%",
    change: "26 min",
  },
];

function Header() {
  return (
    <div className="ai-page-heading">
      <div>
        <div className="ai-eyebrow">
          <Sparkles /> INTELLIGENT INSIGHTS
        </div>
        <h1>
          Culinary Intelligence <i>&amp;</i>
          <br />
          <em>Forecasting</em>
        </h1>
        <p>
          Leveraging real demand modeling to optimize your floor, kitchen, and
          inventory. ROMS AI analyzes historical patterns, local events, and
          seasonal trends to predict culinary decisions.
        </p>
      </div>
      <div className="ai-confidence">
        <small>SYSTEM CONFIDENCE</small>
        <b>94.6%</b>
        <div>
          <i />
        </div>
      </div>
    </div>
  );
}

function RevenueChart() {
  return (
    <section className="ai-chart-card">
      <div className="ai-chart-head">
        <div>
          <h2>Revenue vs. AI Forecast</h2>
          <p>7-Day Projection based on regional food festival &amp; weather</p>
        </div>
        <div className="chart-legend">
          <span>
            <i className="actual" /> Actual
          </span>
          <span>
            <i className="forecast" /> Forecast
          </span>
        </div>
      </div>
      <svg
        className="revenue-chart"
        viewBox="0 0 620 190"
        role="img"
        aria-label="Biểu đồ doanh thu thực tế và dự báo"
      >
        <path
          d="M10 143 C90 145, 128 140, 170 134 S248 112, 280 66 S357 76, 400 88 S472 89, 520 72"
          fill="none"
          stroke="#a56e16"
          strokeWidth="3"
        />
        <path
          d="M10 145 C100 145, 145 140, 190 130 S250 98, 286 65 S355 78, 410 88 S480 84, 530 56 S580 40, 610 25"
          fill="none"
          stroke="#e6d5bb"
          strokeWidth="3"
          strokeDasharray="8 7"
        />
        <path d="M10 150 H610" stroke="#eee5d8" />
        <path d="M10 35 V150" stroke="#eee5d8" />
        <circle cx="400" cy="88" r="5" fill="#a56e16" />
      </svg>
      <div className="chart-days">
        <span>MON</span>
        <span>TUE</span>
        <span>WED</span>
        <span>THU</span>
        <span>FRI</span>
        <span>SAT</span>
        <span>SUN</span>
      </div>
    </section>
  );
}

function InsightRail() {
  return (
    <aside className="ai-rail">
      <article className="inventory-suggestion">
        <div>
          <Lightbulb /> Inventory Suggestion
        </div>
        <p>
          Expected 3% surge in Sea Bass orders this weekend due to the local
          culinary festival. Your current stock covers 1.5 days.
        </p>
        <button>
          Execute Order <ChevronDown />
        </button>
      </article>
      <article className="waste-card">
        <small>WASTE REDUCTION</small>
        <b>
          -$1,420 <em>this week</em>
        </b>
        <span>
          <CheckCircle2 />
        </span>
      </article>
    </aside>
  );
}

function DishCards() {
  return (
    <section className="ai-dishes">
      <div className="ai-section-heading">
        <h2>Signature Item Performance</h2>
        <div>
          <button className="selected">Popularity</button>
          <button>Profitability</button>
        </div>
      </div>
      <div className="ai-dish-grid">
        {dishes.map((dish) => (
          <article className="ai-dish-card" key={dish.name}>
            <div
              className="ai-dish-photo"
              style={{ backgroundImage: `url(${dish.image})` }}
            >
              <span className={`ai-dish-tag ${dish.tagClass || ""}`}>
                {dish.tag}
              </span>
            </div>
            <div className="ai-dish-content">
              <div className="ai-dish-title">
                <div>
                  <small>{dish.category}</small>
                  <h3>{dish.name}</h3>
                </div>
                <b>{dish.price}</b>
              </div>
              <div className="ai-dish-stats">
                <span>
                  DEMAND TREND <strong>{dish.metric}</strong>
                </span>
                <span>
                  PREP TIME <strong>{dish.change}</strong>
                </span>
              </div>
              <div className="ai-dish-line">
                <i
                  style={{ width: dish.metric === "Stable" ? "65%" : "42%" }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StaffingOptimization() {
  return (
    <section className="staffing-card">
      <div className="staffing-copy">
        <div className="ai-eyebrow">
          <Users /> STAFFING INTELLIGENCE
        </div>
        <h2>
          Staffing <em>Optimization</em>
        </h2>
        <p>
          AI analysis of guest dwell times and course volume suggests you are
          over-staffed on the patio between 2 PM and 4 PM. Re-assigning 2
          servers to the bar section could significantly reduce labor costs.
        </p>
        <div className="staffing-recommendation">
          <span>1</span>
          <b>
            Peak Arrival Forecast<small>Expected 7:15 PM arrival wave</small>
          </b>
        </div>
        <div className="staffing-recommendation">
          <span>2</span>
          <b>
            Floor Efficiency<small>Recommended: 12 active floor agents</small>
          </b>
        </div>
      </div>
      <div className="heatmap-panel">
        <div>
          <small>KITCHEN WORKLOAD HEATMAP</small>
          <i />
        </div>
        <div className="heatmap-grid">
          {Array.from({ length: 20 }).map((_, index) => (
            <i key={index} className={`heat-${(index % 5) + 1}`} />
          ))}
        </div>
        <p>
          Predicted Congestion at <b>Grill Station @ 20:00</b>
        </p>
      </div>
      <div className="ai-chat-bubble">
        <BrainCircuit /> Ask AI: “Show me a plan to reduce labor cost”
      </div>
    </section>
  );
}

// export default function AiAnalyticsView() {
export default function AnalyticsDashboard() {
  return (
    <div className="ai-analytics-view" style={{ padding: '30px 34px 60px', background: '#f7f5f2' }}>
      <Header />
      <div className="ai-top-grid">
        <RevenueChart />
        <InsightRail />
      </div>
      <DishCards />
      <StaffingOptimization />
      <div className="ai-live-pill">
        <Zap /> AI Live View <small>ANALYZING FLOOR MOVEMENT</small>
      </div>
    </div>
  );
}
