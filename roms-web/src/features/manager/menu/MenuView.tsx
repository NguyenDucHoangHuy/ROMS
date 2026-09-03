// import { Plus, Sparkles, SlidersHorizontal, ChevronRight, MoreVertical } from "lucide-react";

// function MenuView() {
//   const dishes = [
//     {
//       name: "Truffle Tagliatelle",
//       badge: "Star Performer",
//       badgeType: "primary",
//       price: "$32.00",
//       cost: "$8.40 (26.3%)",
//       costPercent: 26.3,
//       description:
//         "Hand-rolled egg pasta, Périgord truffles, 30-month aged parmesan...",
//       image:
//         "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-w5jd69lAMSGZcdU7PIJZYewujcWavO.png",
//       action: "Edit Build",
//     },
//     {
//       name: "Wagyu Ribeye",
//       badge: "Margin Warning",
//       badgeType: "warning",
//       price: "$85.00",
//       cost: "$49.30 (58%)",
//       costPercent: 58,
//       description:
//         "Wagyu A5 Miyazakigyu, smoked bone marrow butter, seasonal root vegetables...",
//       image:
//         "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-w5jd69lAMSGZcdU7PIJZYewujcWavO.png",
//       action: "Edit Price",
//     },
//     {
//       name: "Citrus Scallop Ceviche",
//       badge: "",
//       badgeType: "",
//       price: "$24.00",
//       cost: "$5.20 (21.6%)",
//       costPercent: 21.6,
//       description:
//         "Hokkaido scallops, yuzu kosho, pressed cucumber, chili oil...",
//       image:
//         "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-w5jd69lAMSGZcdU7PIJZYewujcWavO.png",
//       action: "Edit Build",
//     },
//   ];

//   return ( 
//     <>
//       <style>{`
//         .menu-view {
//           min-height: 100%;
//           background: #f7f5f2;
//           color: #1f1c1a;
//           padding: 30px 34px 50px;
//           font-family: Inter, "Segoe UI", Arial, sans-serif;
//         }

//         .menu-view-inner {
//           max-width: 1320px;
//           margin: 0 auto;
//         }

//         /* ==============================
//            HEADER
//         ============================== */

//         .menu-header {
//           display: flex;
//           align-items: flex-start;
//           justify-content: space-between;
//           gap: 24px;
//           margin-bottom: 24px;
//         }

//         .menu-eyebrow {
//           margin: 0 0 7px;
//           color: #e0611d;
//           font-size: 11px;
//           font-weight: 800;
//           letter-spacing: .12em;
//           text-transform: uppercase;
//         }

//         .menu-title {
//           margin: 0 0 8px;
//           font-size: 28px;
//           line-height: 1.15;
//           font-weight: 750;
//           letter-spacing: -0.025em;
//           color: #1f1c1a;
//         }

//         .menu-description {
//           margin: 0;
//           max-width: 590px;
//           color: #7a736c;
//           font-size: 13.5px;
//           line-height: 1.65;
//         }

//         .menu-header-actions {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           flex-shrink: 0;
//         }

//         .menu-button {
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           gap: 7px;
//           min-height: 40px;
//           padding: 0 15px;
//           border-radius: 9px;
//           font-family: inherit;
//           font-size: 13px;
//           font-weight: 650;
//           cursor: pointer;
//           transition: all .15s ease;
//         }

//         .menu-button svg {
//           width: 15px;
//           height: 15px;
//         }

//         .menu-button-secondary {
//           background: #fff;
//           border: 1px solid #e7e1da;
//           color: #1f1c1a;
//         }

//         .menu-button-secondary:hover {
//           background: #f7f5f2;
//         }

//         .menu-button-primary {
//           background: #1a1714;
//           border: 1px solid #1a1714;
//           color: #fff;
//         }

//         .menu-button-primary:hover {
//           background: #e0611d;
//           border-color: #e0611d;
//         }

//         /* ==============================
//            KPI
//         ============================== */

//         .menu-kpis {
//           display: grid;
//           grid-template-columns: repeat(4, 1fr);
//           gap: 14px;
//           margin-bottom: 20px;
//         }

//         .menu-kpi {
//           background: #fff;
//           border: 1px solid #ece7e1;
//           border-radius: 13px;
//           padding: 17px 19px;
//           box-shadow:
//             0 1px 2px rgba(26, 23, 20, .05),
//             0 1px 7px rgba(26, 23, 20, .035);
//         }

//         .menu-kpi-label {
//           display: block;
//           margin-bottom: 10px;
//           color: #7a736c;
//           font-size: 10.5px;
//           font-weight: 750;
//           letter-spacing: .06em;
//         }

//         .menu-kpi-value {
//           display: block;
//           margin-bottom: 5px;
//           color: #1f1c1a;
//           font-size: 25px;
//           line-height: 1;
//           font-weight: 750;
//         }

//         .menu-kpi-value.green {
//           color: #1e8a4c;
//         }

//         .menu-kpi-value.orange {
//           color: #e0611d;
//         }

//         .menu-kpi-value.red {
//           color: #d1372f;
//         }

//         .menu-kpi-value em {
//           font-size: 12px;
//           font-style: normal;
//           font-weight: 500;
//           color: #7a736c;
//         }

//         .menu-kpi-note {
//           color: #7a736c;
//           font-size: 11.5px;
//         }

//         .menu-kpi-note.green {
//           color: #1e8a4c;
//           font-weight: 600;
//         }

//         .menu-kpi-note.red {
//           color: #d1372f;
//           font-weight: 600;
//         }

//         /* ==============================
//            MAIN GRID
//         ============================== */

//         .menu-main-grid {
//           display: grid;
//           grid-template-columns: 300px minmax(0, 1fr);
//           gap: 18px;
//           align-items: start;
//         }

//         .menu-side {
//           display: flex;
//           flex-direction: column;
//           gap: 16px;
//         }

//         /* ==============================
//            AI CARD
//         ============================== */

//         .menu-ai-card {
//           background: #1a1714;
//           color: #fff;
//           border-radius: 14px;
//           padding: 20px;
//         }

//         .menu-ai-label {
//           display: flex;
//           align-items: center;
//           gap: 7px;
//           margin-bottom: 15px;
//           color: #e0611d;
//           font-size: 10.5px;
//           font-weight: 800;
//           letter-spacing: .08em;
//           text-transform: uppercase;
//         }

//         .menu-ai-title {
//           margin: 0 0 10px;
//           color: #fff;
//           font-size: 15px;
//           line-height: 1.4;
//           font-weight: 700;
//         }

//         .menu-ai-text {
//           margin: 0 0 17px;
//           color: #b7b0a8;
//           font-size: 12px;
//           line-height: 1.65;
//         }

//         .menu-ai-button {
//           width: 100%;
//           min-height: 38px;
//           border: none;
//           border-radius: 8px;
//           background: #e0611d;
//           color: #fff;
//           font-family: inherit;
//           font-size: 12.5px;
//           font-weight: 650;
//           cursor: pointer;
//           transition: background .15s ease;
//         }

//         .menu-ai-button:hover {
//           background: #c04f13;
//         }

//         /* ==============================
//            MARGIN CARD
//         ============================== */

//         .menu-margin-card {
//           background: #fff;
//           border: 1px solid #ece7e1;
//           border-radius: 14px;
//           box-shadow:
//             0 1px 2px rgba(26, 23, 20, .05),
//             0 1px 7px rgba(26, 23, 20, .035);
//           padding: 18px 20px;
//         }

//         .menu-margin-title {
//           display: flex;
//           align-items: center;
//           gap: 7px;
//           margin-bottom: 13px;
//           color: #1f1c1a;
//           font-size: 11.5px;
//           font-weight: 750;
//         }

//         .menu-margin-dot {
//           width: 7px;
//           height: 7px;
//           border-radius: 50%;
//           background: #d1372f;
//         }

//         .menu-margin-item {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 10px;
//           padding: 11px 0;
//           border-top: 1px solid #ece7e1;
//         }

//         .menu-margin-item:first-of-type {
//           border-top: none;
//           padding-top: 0;
//         }

//         .menu-margin-name {
//           color: #1f1c1a;
//           font-size: 12.5px;
//           font-weight: 650;
//         }

//         .menu-margin-note {
//           margin-top: 3px;
//           color: #7a736c;
//           font-size: 10.5px;
//         }

//         .menu-margin-percent {
//           display: flex;
//           align-items: center;
//           gap: 5px;
//           color: #d1372f;
//           font-size: 13px;
//           font-weight: 750;
//         }

//         /* ==============================
//            DISH GRID
//         ============================== */

//         .menu-dish-grid {
//           display: grid;
//           grid-template-columns: repeat(2, minmax(0, 1fr));
//           gap: 16px;
//         }

//         .menu-dish-card {
//           overflow: hidden;
//           background: #fff;
//           border: 1px solid #ece7e1;
//           border-radius: 14px;
//           box-shadow:
//             0 1px 2px rgba(26, 23, 20, .05),
//             0 1px 7px rgba(26, 23, 20, .035);
//         }

//         .menu-dish-image {
//           position: relative;
//           height: 135px;
//           background:
//             linear-gradient(
//               135deg,
//               rgba(26,23,20,.08),
//               rgba(26,23,20,.02)
//             ),
//             #e8ded3;
//           background-position: center;
//           background-size: cover;
//         }

//         .menu-dish-image::after {
//           content: "";
//           position: absolute;
//           inset: 0;
//           background: linear-gradient(
//             to bottom,
//             rgba(0,0,0,.03),
//             rgba(0,0,0,.12)
//           );
//           pointer-events: none;
//         }

//         .menu-dish-badge {
//           position: absolute;
//           z-index: 1;
//           top: 10px;
//           left: 10px;
//           padding: 4px 9px;
//           border-radius: 999px;
//           background: #e0611d;
//           color: #fff;
//           font-size: 10px;
//           font-weight: 750;
//         }

//         .menu-dish-badge.warning {
//           background: #d1372f;
//         }

//         .menu-dish-body {
//           padding: 14px 16px 16px;
//         }

//         .menu-dish-title {
//           display: flex;
//           align-items: baseline;
//           justify-content: space-between;
//           gap: 10px;
//           margin-bottom: 8px;
//         }

//         .menu-dish-name {
//           color: #1f1c1a;
//           font-size: 14px;
//           font-weight: 750;
//         }

//         .menu-dish-price {
//           flex-shrink: 0;
//           color: #1f1c1a;
//           font-size: 14px;
//           font-weight: 750;
//         }

//         .menu-dish-description {
//           min-height: 36px;
//           margin: 0 0 12px;
//           color: #7a736c;
//           font-size: 11.5px;
//           line-height: 1.55;
//         }

//         .menu-food-cost {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-bottom: 6px;
//         }

//         .menu-food-cost span {
//           color: #7a736c;
//           font-size: 10px;
//           font-weight: 750;
//           letter-spacing: .04em;
//         }

//         .menu-food-cost b {
//           color: #1e8a4c;
//           font-size: 11.5px;
//         }

//         .menu-food-cost b.warning {
//           color: #d1372f;
//         }

//         .menu-cost-line {
//           height: 5px;
//           margin-bottom: 12px;
//           overflow: hidden;
//           border-radius: 999px;
//           background: #ece7e1;
//         }

//         .menu-cost-fill {
//           height: 100%;
//           border-radius: inherit;
//           background: #1e8a4c;
//         }

//         .menu-cost-fill.warning {
//           background: #d1372f;
//         }

//         .menu-edit-button {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 6px;
//           width: 100%;
//           min-height: 35px;
//           border: 1px solid #ece7e1;
//           border-radius: 8px;
//           background: #f7f5f2;
//           color: #1f1c1a;
//           font-family: inherit;
//           font-size: 11.5px;
//           font-weight: 650;
//           cursor: pointer;
//         }

//         .menu-edit-button:hover {
//           background: #ece7e1;
//         }

//         /* ==============================
//            ADD NEW
//         ============================== */

//         .menu-new-card {
//           min-height: 250px;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           text-align: center;
//           padding: 28px 20px;
//           border: 1.5px dashed #ded7cf;
//           border-radius: 14px;
//           background: transparent;
//         }

//         .menu-new-icon {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 36px;
//           height: 36px;
//           margin-bottom: 10px;
//           border-radius: 50%;
//           background: #fff;
//           color: #7a736c;
//           border: 1px solid #ece7e1;
//         }

//         .menu-new-title {
//           margin-bottom: 5px;
//           color: #1f1c1a;
//           font-size: 13.5px;
//           font-weight: 750;
//         }

//         .menu-new-text {
//           max-width: 210px;
//           margin: 0;
//           color: #7a736c;
//           font-size: 11.5px;
//           line-height: 1.55;
//         }

//         /* ==============================
//            RESPONSIVE
//         ============================== */

//         @media (max-width: 1100px) {
//           .menu-kpis {
//             grid-template-columns: repeat(2, 1fr);
//           }

//           .menu-main-grid {
//             grid-template-columns: 1fr;
//           }

//           .menu-side {
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//           }
//         }

//         @media (max-width: 760px) {
//           .menu-view {
//             padding: 20px;
//           }

//           .menu-header {
//             flex-direction: column;
//           }

//           .menu-header-actions {
//             width: 100%;
//           }

//           .menu-button {
//             flex: 1;
//           }

//           .menu-kpis {
//             grid-template-columns: 1fr;
//           }

//           .menu-dish-grid {
//             grid-template-columns: 1fr;
//           }

//           .menu-side {
//             grid-template-columns: 1fr;
//           }
//         }
//       `}</style>

//       <div className="menu-view">
//         <div className="menu-view-inner">

//           {/* ================= HEADER ================= */}
//           <section className="menu-header">
//             <div>
//               <p className="menu-eyebrow">Culinary Engineering</p>

//               <h1 className="menu-title">
//                 The Seasonal Portfolio
//               </h1>

//               <p className="menu-description">
//                 Curate your restaurant identity. Balance inventory margins
//                 with creative vision through our intelligent menu architect.
//               </p>
//             </div>

//             <div className="menu-header-actions">
//               <button className="menu-button menu-button-secondary">
//                 <SlidersHorizontal />
//                 Refine View
//               </button>

//               <button className="menu-button menu-button-primary">
//                 <Plus />
//                 New Item
//               </button>
//             </div>
//           </section>

//           {/* ================= KPI ================= */}
//           <section className="menu-kpis">

//             <div className="menu-kpi">
//               <span className="menu-kpi-label">
//                 AVERAGE PLATE MARGIN
//               </span>

//               <strong className="menu-kpi-value green">
//                 72.4%
//               </strong>

//               <span className="menu-kpi-note green">
//                 ↗ Up from last week
//               </span>
//             </div>

//             <div className="menu-kpi">
//               <span className="menu-kpi-label">
//                 MENU ENGINEERING SCORE
//               </span>

//               <strong className="menu-kpi-value">
//                 88<em>/100</em>
//               </strong>

//               <span className="menu-kpi-note">
//                 Overall assessment
//               </span>
//             </div>

//             <div className="menu-kpi">
//               <span className="menu-kpi-label">
//                 CRITICAL STOCK ALERTS
//               </span>

//               <strong className="menu-kpi-value red">
//                 04
//               </strong>

//               <span className="menu-kpi-note red">
//                 Requires action
//               </span>
//             </div>

//             <div className="menu-kpi">
//               <span className="menu-kpi-label">
//                 AI POTENTIAL LIFT
//               </span>

//               <strong className="menu-kpi-value orange">
//                 +$1.2k
//               </strong>

//               <span className="menu-kpi-note">
//                 Weekly
//               </span>
//             </div>

//           </section>

//           {/* ================= MAIN ================= */}
//           <section className="menu-main-grid">

//             {/* ---------- LEFT ---------- */}
//             <div className="menu-side">

//               <article className="menu-ai-card">
//                 <div className="menu-ai-label">
//                   <Sparkles />
//                   Intelligence Prompt
//                 </div>

//                 <h2 className="menu-ai-title">
//                   Optimize “Truffle Tagliatelle”
//                 </h2>

//                 <p className="menu-ai-text">
//                   Recent commodity price drops in European Black Truffles
//                   suggest a margin increase of 12.5% is possible without
//                   affecting volume if paired with a “Seasonal Limited” badge.
//                 </p>

//                 <button className="menu-ai-button">
//                   Apply Recommendation
//                 </button>
//               </article>

//               <article className="menu-margin-card">

//                 <div className="menu-margin-title">
//                   <span className="menu-margin-dot" />
//                   Margin Compression
//                 </div>

//                 <div className="menu-margin-item">
//                   <div>
//                     <div className="menu-margin-name">
//                       Wagyu Ribeye
//                     </div>

//                     <div className="menu-margin-note">
//                       Market price volatility
//                     </div>
//                   </div>

//                   <div className="menu-margin-percent">
//                     58%
//                     <ChevronRight size={14} />
//                   </div>
//                 </div>

//                 <div className="menu-margin-item">
//                   <div>
//                     <div className="menu-margin-name">
//                       Seared King Scallops
//                     </div>

//                     <div className="menu-margin-note">
//                       Shipping surcharge
//                     </div>
//                   </div>

//                   <div className="menu-margin-percent">
//                     61%
//                     <ChevronRight size={14} />
//                   </div>
//                 </div>

//               </article>

//             </div>

//             {/* ---------- DISHES ---------- */}
//             <div className="menu-dish-grid">

//               {dishes.map((dish) => (
//                 <article className="menu-dish-card" key={dish.name}>

//                   <div
//                     className="menu-dish-image"
//                     style={{
//                       backgroundImage: `url(${dish.image})`,
//                     }}
//                   >
//                     {dish.badge && (
//                       <span
//                         className={`menu-dish-badge ${
//                           dish.badgeType === "warning"
//                             ? "warning"
//                             : ""
//                         }`}
//                       >
//                         {dish.badge}
//                       </span>
//                     )}
//                   </div>

//                   <div className="menu-dish-body">

//                     <div className="menu-dish-title">
//                       <span className="menu-dish-name">
//                         {dish.name}
//                       </span>

//                       <span className="menu-dish-price">
//                         {dish.price}
//                       </span>
//                     </div>

//                     <p className="menu-dish-description">
//                       {dish.description}
//                     </p>

//                     <div className="menu-food-cost">
//                       <span>FOOD COST</span>

//                       <b
//                         className={
//                           dish.costPercent >= 50
//                             ? "warning"
//                             : ""
//                         }
//                       >
//                         {dish.cost}
//                       </b>
//                     </div>

//                     <div className="menu-cost-line">
//                       <div
//                         className={`menu-cost-fill ${
//                           dish.costPercent >= 50
//                             ? "warning"
//                             : ""
//                         }`}
//                         style={{
//                           width: `${dish.costPercent}%`,
//                         }}
//                       />
//                     </div>

//                     <button className="menu-edit-button">
//                       {dish.action}
//                       <MoreVertical size={14} />
//                     </button>

//                   </div>
//                 </article>
//               ))}

//               {/* ADD NEW */}
//               <article className="menu-new-card">

//                 <div className="menu-new-icon">
//                   <Plus size={17} />
//                 </div>

//                 <div className="menu-new-title">
//                   Add New Creation
//                 </div>

//                 <p className="menu-new-text">
//                   Define ingredients, calculate margins, and publish
//                   to floor terminals.
//                 </p>

//               </article>

//             </div>

//           </section>

//         </div>
//       </div>
//     </>
//   );
// }

// export default MenuView;


import React, { useState } from 'react'
import {
  Search,
  Filter,
  ArrowUpDown,
  Minus,
  Plus,
  Eye,
  AlertTriangle,
  Megaphone,
  PackageX,
} from 'lucide-react'



interface DishItem {
  id: string
  name: string
  description: string
  price: number
  margin: number
  prepTime: number
  category: string
  image: string
  badge?: string
  warning?: string
  is86d?: boolean
  available: boolean
}

const INITIAL_DISHES: DishItem[] = [
  {
    id: 'dish-1',
    name: 'Pan-Seared Hokkaido Scallops',
    description: 'English pea purée, pancetta crisp, yuzu beurre',
    price: 42,
    margin: 68,
    prepTime: 14,
    category: 'Mains',
    image:
      'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&auto=format&fit=crop&q=80',
    badge: 'Main',
    available: true,
  },
  {
    id: 'dish-2',
    name: 'Wild Mushroom Risotto',
    description: '',
    price: 38,
    margin: 55,
    prepTime: 22,
    category: 'Mains',
    image:
      'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=500&auto=format&fit=crop&q=80',
    badge: 'Low Stock',
    warning: 'Warning: Truffle inventory critical (approx. 4 portions left).',
    available: true,
  },
  {
    id: 'dish-3',
    name: 'Dry-Aged Bone-In Ribeye',
    description: 'Out of stock: Premium Ribeye Cut.',
    price: 85,
    margin: 0,
    prepTime: 35,
    category: 'Mains',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
    is86d: true,
    available: false,
  },
]

export function MenuView() {
  const [dishes, setDishes] = useState<DishItem[]>(INITIAL_DISHES)
  const [selectedCategory, setSelectedCategory] = useState<string>('Mains')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const categories = [
    { name: 'Drinks', count: 12 },
    { name: 'Appetizers', count: 8 },
    { name: 'Mains', count: 14 },
    { name: 'Desserts', count: 5 },
  ]

  const handleToggleAvailable = (id: string) => {
    setDishes((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, available: !item.available, is86d: item.available }
          : item
      )
    )
  }

  const handlePrepTimeChange = (id: string, delta: number) => {
    setDishes((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, prepTime: Math.max(1, item.prepTime + delta) }
          : item
      )
    )
  }

  return (
    <div className="bg-[#f8f8f6] min-h-screen text-slate-800 p-6 select-none">
      {/* Khung cố định đúng tỉ lệ ảnh 1 */}
      <div className="max-w-[1100px] mx-auto space-y-4">
        
        {/* ── Top Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Service Menu
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage tonight's offerings, adjust prep times, and update ingredient availability in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#f0ece1] border-l-[3px] border-l-orange-500 px-4 py-2 rounded-2xl min-w-[170px]">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                ITEMS 86'D TONIGHT
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold text-red-600">3</span>
                <span className="text-xs font-semibold text-slate-400">/ 42 total</span>
              </div>
            </div>

            <div className="bg-[#ebe8e1] px-4 py-2 rounded-2xl min-w-[150px]">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                AVG TICKET TIME
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-bold text-slate-900">18m</span>
                <span className="text-[10px] font-bold text-red-500">+2m vs avg</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-12 gap-5 items-start pt-1">
          
          {/* LEFT SIDEBAR (3 cols) */}
          <div className="col-span-3 space-y-4">
            <div className="bg-white rounded-3xl p-3.5 shadow-sm border border-slate-100/80 space-y-1">
              <h3 className="font-serif text-base font-bold text-slate-900 px-3 py-1">
                Categories
              </h3>
              <nav className="space-y-0.5">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.name
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-orange-500 text-white font-semibold shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-orange-600/50 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  )
                })}
              </nav>

              <div className="pt-2">
                <button className="w-full flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold text-red-500 uppercase tracking-wider rounded-2xl hover:bg-red-50 transition">
                  <AlertTriangle size={13} />
                  <span>CURRENTLY 86'D</span>
                </button>
              </div>
            </div>

            {/* Chef's Note */}
            <div className="bg-[#f2efe9] rounded-3xl p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[10px] uppercase tracking-wider">
                <Megaphone size={13} />
                <span>CHEF'S NOTE</span>
              </div>
              <p className="text-xs italic text-slate-600 leading-relaxed font-serif">
                "Truffle supplier delayed. Conserve shavings on the risotto. Recommend pushing the Sea Bass tonight."
              </p>
            </div>
          </div>

          {/* RIGHT CONTENT (9 cols) */}
          <div className="col-span-9 space-y-3.5">
            
            {/* Filter Bar */}
            <div className="flex items-center gap-2.5">
              <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#eae8e1] hover:bg-[#e2dfd7] text-slate-700 rounded-2xl text-xs font-medium transition">
                <Filter size={14} />
                <span>Filter</span>
              </button>

              <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#eae8e1] hover:bg-[#e2dfd7] text-slate-700 rounded-2xl text-xs font-medium transition">
                <ArrowUpDown size={14} />
                <span>Sort: Popularity</span>
              </button>

              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find dish..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800 placeholder-slate-400 shadow-sm"
                />
              </div>
            </div>

            {/* Dishes List */}
            <div className="space-y-3.5">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className={`bg-white rounded-3xl border border-slate-100/90 shadow-sm overflow-hidden p-2.5 transition flex items-center gap-4 ${
                    dish.is86d ? 'opacity-60 bg-slate-50/50' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="relative w-44 h-32 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className={`w-full h-full object-cover ${
                        dish.is86d ? 'grayscale' : ''
                      }`}
                    />
                    {/* {dish.badge && !dish.is86d && (
                      <span
                        className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold text-white uppercase tracking-wider ${
                          dish.badge === 'Low Stock'
                            ? 'bg-slate-900/80 backdrop-blur'
                            : 'bg-orange-700/90'
                        }`}
                      >
                        {dish.badge}
                      </span>
                    )} */}
                    {/* Badge Low Stock / Signature */}
                    {dish.badge && !dish.is86d && (
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold shadow-md">
                        {dish.badge === 'Low Stock' && (
                          <PackageX size={13} className="text-amber-400" />
                        )}
                        <span>{dish.badge}</span>
                      </div>
                    )}
                    {dish.is86d && (
                      <span className="absolute inset-0 m-auto w-max h-max px-2.5 py-0.5 bg-red-500 text-white font-bold text-[10px] rounded uppercase tracking-wider">
                        86'D
                      </span>
                    )}
                  </div>

                  {/* Details Right Block */}
                  <div className="flex-1 min-w-0 pr-2 py-1 space-y-2">
                    
                    {/* Header: Name + Price */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          className={`font-serif font-bold text-base text-slate-900 leading-tight ${
                            dish.is86d ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {dish.name}
                          {dish.warning && (
                            <AlertTriangle
                              size={14}
                              className="inline-block ml-1.5 text-amber-500"
                            />
                          )}
                        </h3>
                        {dish.description && (
                          <p
                            className={`text-xs mt-0.5 ${
                              dish.is86d ? 'text-red-500 font-medium' : 'text-slate-400'
                            }`}
                          >
                            {dish.description}
                          </p>
                        )}
                        {dish.warning && (
                          <p className="text-[11px] text-amber-700 font-medium leading-tight mt-0.5">
                            {dish.warning}
                          </p>
                        )}
                      </div>

                      {/* Price Tag */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`font-serif font-bold text-base ${
                            dish.is86d ? 'text-slate-300' : 'text-slate-900'
                          }`}
                        >
                          ${dish.price}
                        </span>
                        {dish.margin > 0 && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Margin: {dish.margin}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bố cục 2 HÀNG chuẩn giống hệt ảnh 1 */}
                    <div className="pt-1 space-y-2">
                      {/* Hàng 1: Prep time & Components */}
                      <div className="flex items-center gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <span>EST. PREP TIME</span>
                          <div className="flex items-center bg-slate-100 rounded-lg px-1 py-0.5">
                            <button
                              disabled={dish.is86d}
                              onClick={() => handlePrepTimeChange(dish.id, -1)}
                              className="p-0.5 hover:bg-slate-200 rounded text-slate-500 transition disabled:opacity-30"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="text-xs font-bold text-slate-800 px-1.5">
                              {dish.prepTime}m
                            </span>
                            <button
                              disabled={dish.is86d}
                              onClick={() => handlePrepTimeChange(dish.id, 1)}
                              className="p-0.5 hover:bg-slate-200 rounded text-slate-500 transition disabled:opacity-30"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span>COMPONENTS</span>
                          <button className="flex items-center gap-1 text-xs font-serif font-medium text-slate-700 hover:text-slate-900 transition capitalize">
                            <span>View Recipe</span>
                            <Eye size={12} className="text-slate-400" />
                          </button>
                        </div>
                      </div>

                      {/* Hàng 2: Available Toggle (Căn phải hoặc dưới cùng) */}
                      <div className="flex items-center justify-end gap-2 pt-0.5">
                        <span
                          className={`text-xs font-semibold ${
                            dish.available ? 'text-slate-700' : 'text-red-500'
                          }`}
                        >
                          {dish.available ? 'Available' : 'Unavailable'}
                        </span>
                        <button
                          onClick={() => handleToggleAvailable(dish.id)}
                          className={`relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                            dish.available ? 'bg-orange-500' : 'bg-slate-200'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                              dish.available ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="pt-2 text-center">
              <button className="px-6 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs rounded-2xl shadow-sm transition">
                Load More Items
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default MenuView