import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowUpRight, ArrowDownRight, DollarSign,
  TrendingUp, TrendingDown, Wallet,
  BarChart3, PieChartIcon, Activity, RefreshCw, Layers,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart,
} from 'recharts';
import { useStore } from '../store/useStore';

// ─── Colors ───────────────────────────────────────────────────────────────────
const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316'];

// ─── Mock Data ────────────────────────────────────────────────────────────────
const WEEKLY_DATA = [
  { date:'Mon', income:4200,  expenses:2800,  balance:1400,  savings:1400  },
  { date:'Tue', income:3800,  expenses:3100,  balance:700,   savings:700   },
  { date:'Wed', income:5100,  expenses:2400,  balance:2700,  savings:2700  },
  { date:'Thu', income:4600,  expenses:3600,  balance:1000,  savings:1000  },
  { date:'Fri', income:6200,  expenses:4100,  balance:2100,  savings:2100  },
  { date:'Sat', income:3100,  expenses:1900,  balance:1200,  savings:1200  },
  { date:'Sun', income:2800,  expenses:1600,  balance:1200,  savings:1200  },
];
const MONTHLY_DATA = [
  { date:'Jan', income:120000, expenses:88000,  balance:32000, savings:26667 },
  { date:'Feb', income:115000, expenses:79000,  balance:36000, savings:31304 },
  { date:'Mar', income:132000, expenses:95000,  balance:37000, savings:28030 },
  { date:'Apr', income:128000, expenses:91400,  balance:36600, savings:28594 },
  { date:'May', income:141000, expenses:98000,  balance:43000, savings:30496 },
  { date:'Jun', income:138000, expenses:102000, balance:36000, savings:26087 },
  { date:'Jul', income:145000, expenses:99000,  balance:46000, savings:31724 },
  { date:'Aug', income:152000, expenses:107000, balance:45000, savings:29605 },
  { date:'Sep', income:148000, expenses:104000, balance:44000, savings:29730 },
  { date:'Oct', income:161000, expenses:112000, balance:49000, savings:30435 },
  { date:'Nov', income:155000, expenses:108000, balance:47000, savings:30323 },
  { date:'Dec', income:173000, expenses:131000, balance:42000, savings:24277 },
];
const YEARLY_DATA = [
  { date:'2020', income:980000,  expenses:720000,  balance:260000, savings:26531 },
  { date:'2021', income:1120000, expenses:810000,  balance:310000, savings:27679 },
  { date:'2022', income:1340000, expenses:960000,  balance:380000, savings:28358 },
  { date:'2023', income:1580000, expenses:1100000, balance:480000, savings:30380 },
  { date:'2024', income:1820000, expenses:1240000, balance:580000, savings:31868 },
  { date:'2025', income:1950000, expenses:1310000, balance:640000, savings:32821 },
];
const EXPENSES_BY_CATEGORY = [
  { name:'Housing',       value:35000 },
  { name:'Food',          value:14500 },
  { name:'Transport',     value:9800  },
  { name:'Utilities',     value:7200  },
  { name:'Dining Out',    value:6400  },
  { name:'Healthcare',    value:5100  },
  { name:'Entertainment', value:4300  },
  { name:'Others',        value:8100  },
];
const RADAR_DATA = [
  { subject:'Savings',    A:85 },
  { subject:'Investment', A:62 },
  { subject:'Debt Mgmt',  A:78 },
  { subject:'Budgeting',  A:91 },
  { subject:'Emergency',  A:55 },
  { subject:'Retirement', A:47 },
];
const INVESTMENT_DATA = [
  { month:'Jan', stocks:45000, mutual_funds:32000, fd:20000, gold:8000  },
  { month:'Feb', stocks:48000, mutual_funds:34000, fd:20000, gold:9000  },
  { month:'Mar', stocks:43000, mutual_funds:36000, fd:21000, gold:8500  },
  { month:'Apr', stocks:52000, mutual_funds:38000, fd:21000, gold:9200  },
  { month:'May', stocks:58000, mutual_funds:40000, fd:22000, gold:10000 },
  { month:'Jun', stocks:54000, mutual_funds:42000, fd:22000, gold:9800  },
];
const RECENT_TRANSACTIONS = [
  { id:'1', description:'Salary Credit',    category:'Income',     type:'income',  amount:120000, date:'2025-04-05' },
  { id:'2', description:'Rent Payment',      category:'Housing',    type:'expense', amount:22000,  date:'2025-04-04' },
  { id:'3', description:'Swiggy Order',      category:'Dining Out', type:'expense', amount:840,    date:'2025-04-04' },
  { id:'4', description:'Zerodha Dividend',  category:'Investment', type:'income',  amount:3200,   date:'2025-04-03' },
  { id:'5', description:'Electricity Bill',  category:'Utilities',  type:'expense', amount:2100,   date:'2025-04-03' },
  { id:'6', description:'Apollo Pharmacy',   category:'Healthcare', type:'expense', amount:1540,   date:'2025-04-02' },
  { id:'7', description:'Freelance Project', category:'Income',     type:'income',  amount:28000,  date:'2025-04-01' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);
const fmtK = (n: number) =>
  n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}k` : `₹${n}`;
const totalExpenses = EXPENSES_BY_CATEGORY.reduce((s,c) => s+c.value, 0);

// ─── Types ────────────────────────────────────────────────────────────────────
type TimeRange       = 'week' | 'month' | 'year';
type LineParam       = 'balance' | 'income' | 'expenses' | 'savings';
type ZParam          = 'expenses' | 'balance';
type InvParam        = 'stocks' | 'mutual_funds' | 'fd' | 'gold';
type ThreeDChartType = 'bar' | 'scatter' | 'surface';

const ISO = {
  ux: [1, 0],          // X → right
  uy: [0, -1],         // Y → up
  uz: [-0.75, -0.35],   
};

function project(wx: number, wy: number, wz: number, scale: {x:number; y:number; z:number}, origin: {x:number; y:number}) {
  // wx, wy, wz in [0,1] normalised world coords
  const sx = wx * scale.x;
  const sy = wy * scale.y;
  const sz = wz * scale.z;
  return {
    x: origin.x + sx * ISO.ux[0] + sy * ISO.uy[0] + sz * ISO.uz[0],
    y: origin.y + sx * ISO.ux[1] + sy * ISO.uy[1] + sz * ISO.uz[1],
  };
}

// Heat-map colour: blue → green → yellow → red
function heatColor(t: number) {
  // t in [0,1]
  const stops = [
    [59, 130, 246],  // blue
    [16, 185, 129],  // green
    [245, 158, 11],  // amber
    [239, 68,  68],  // red
  ];
  const seg   = t * (stops.length - 1);
  const lo    = Math.floor(seg);
  const hi    = Math.min(lo + 1, stops.length - 1);
  const frac  = seg - lo;
  const r = Math.round(stops[lo][0] + frac * (stops[hi][0] - stops[lo][0]));
  const g = Math.round(stops[lo][1] + frac * (stops[hi][1] - stops[lo][1]));
  const b = Math.round(stops[lo][2] + frac * (stops[hi][2] - stops[lo][2]));
  return `rgb(${r},${g},${b})`;
}

function darken(col: string, amt: number) {
  // col is rgb(r,g,b)
  const m = col.match(/\d+/g)!;
  return `rgb(${m.map(c => Math.max(0, Math.round(Number(c) * (1-amt)))).join(',')})`;
}

interface ThreeDProps {
  type: ThreeDChartType;
  data: typeof MONTHLY_DATA;
  zParam: ZParam;
  darkMode: boolean;
}

function ThreeDChart({ type, data, zParam, darkMode }: ThreeDProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 620, H = 360;
  const ox = 120, oy = 320;  // bottom-left origin
  const sx = 470;            // X (time) scale
  const sy = 220;            // Y (income) scale  
  const sz = 150;            // Z (depth) scale

  // Cabinet unit vectors
  const UX = [1,     0    ];
  const UY = [0,    -1    ];
  const UZ = [-0.5, -0.5 ];

  const proj2 = (wx: number, wy: number, wz: number) => ({
    x: ox + wx*sx*UX[0] + wy*sy*UY[0] + wz*sz*UZ[0],
    y: oy + wx*sx*UX[1] + wy*sy*UY[1] + wz*sz*UZ[1],
  });

  const n = data.length;
  const incomeArr = data.map(d => d.income);
  const zArr      = data.map(d => d[zParam]);
  const maxIncome = Math.max(...incomeArr);
  const maxZ      = Math.max(...zArr);

  // Normalise
  const padding = 0.04; // try 0.08–0.15 based on spacing

const pts = data.map((d, i) => ({
  wx: padding + (i / (n - 1)) * (1 - 2 * padding),
  wy: d.income / maxIncome,
  wz: d[zParam] / maxZ,
  label: d.date,
  income: d.income,
  zVal: d[zParam],
}));

  const poly = (corners: {x:number; y:number}[]) =>
    corners.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  const gc       = darkMode ? '#374151' : '#D1D5DB';
  const axisClr  = darkMode ? '#6B7280' : '#9CA3AF';
  const textClr  = darkMode ? '#D1D5DB' : '#374151';
  const subClr   = darkMode ? '#9CA3AF' : '#6B7280';
  const tipBg    = darkMode ? '#1F2937' : '#fff';
  const tipBdr   = darkMode ? '#374151' : '#E5E7EB';

  // ── Floor grid (XZ plane, y=0) ────────────────────────────────────────────
  const GRID = 5;
  const gridEls: JSX.Element[] = [];
  for (let i = 0; i <= GRID; i++) {
    const t = i / GRID;
    const a = proj2(0, 0, t), b = proj2(1, 0, t);   // Z-parallel lines
    const c = proj2(t, 0, 0), d = proj2(t, 0, 1);   // X-parallel lines
    gridEls.push(
      <line key={`gz${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={gc} strokeWidth={0.7} opacity={0.6}/>,
      <line key={`gx${i}`} x1={c.x} y1={c.y} x2={d.x} y2={d.y} stroke={gc} strokeWidth={0.7} opacity={0.6}/>,
    );
  }

  // ── Axes ──────────────────────────────────────────────────────────────────
  // Income (Y) rises from the far-right end of time (wx=1),
  // so it appears on the opposite side from the Z-axis.
  const O    = proj2(0,0,0);
  const xEnd = proj2(1,0,0);
  const yBase= proj2(0,0,1);   // Y axis base = far end of X
  const yEnd = proj2(0,1,1);   // Y axis tip
  const zEnd = proj2(0,0,1);

  // ══════════════════════════════════════════════════════════════════════════
  //  BAR — each bar at its X position, fixed Z=0.5 center, depth = barDepth
  //  Height = income (Y), bar width in X = barW, depth in Z = barDepth
  // ══════════════════════════════════════════════════════════════════════════
  const renderBars = () => {
    const step     = 1 / (n - 1);
    const barW     = step * 0.3;   // 55% of slot width
    const barDepth = 0.55;          // how far into Z the bar extends (0→1)
    const zFront   = 0.0;           // front face Z position
    const zBack    = barDepth;      // back face Z position

    // Paint order: back bars first (higher wx index = further right = paint first for this camera)
    const order = [...pts].map((p,i)=>i).sort((a,b) => pts[a].wx - pts[b].wx);

    return order.map(i => {
      const p   = pts[i];
      const isH = hovered === i;
      const col  = heatColor(p.wy);
      const side = darken(col, 0.32);
      const top  = darken(col, 0.15);

      const x0 = p.wx - barW/2;
      const x1 = p.wx + barW/2;

      // 8 corners: [front-bottom-left, front-bottom-right, front-top-right, front-top-left,
      //             back-bottom-left,  back-bottom-right,  back-top-right,  back-top-left]
      const fbl = proj2(x0, 0,    zFront);
      const fbr = proj2(x1, 0,    zFront);
      const ftl = proj2(x0, p.wy, zFront);
      const ftr = proj2(x1, p.wy, zFront);
      const bbl = proj2(x0, 0,    zBack);
      const bbr = proj2(x1, 0,    zBack);
      const btl = proj2(x0, p.wy, zBack);
      const btr = proj2(x1, p.wy, zBack);

      return (
        <g key={i} style={{cursor:'pointer'}}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}>
          {/* Back face (darker, partially hidden) */}
          <polygon points={poly([bbl,bbr,btr,btl])} fill={side} opacity={0.5}/>
          {/* Left face */}
          <polygon points={poly([fbl,bbl,btl,ftl])} fill={side} opacity={isH?0.95:0.85}/>
          {/* Right face */}
          <polygon points={poly([fbr,bbr,btr,ftr])} fill={darken(col,0.48)} opacity={isH?0.95:0.85}/>
          {/* Top face */}
          <polygon points={poly([ftl,ftr,btr,btl])} fill={top} opacity={isH?1:0.88}/>
          {/* Front face — brightest, user-facing */}
          <polygon points={poly([fbl,fbr,ftr,ftl])} fill={col} opacity={isH?1:0.95}/>
          {/* Specular shine strip on front */}
          <polygon points={poly([fbl, proj2(x0+barW*0.15,0,zFront), proj2(x0+barW*0.15,p.wy,zFront), ftl])}
            fill="white" opacity={0.09}/>
          {/* Value label on hover */}
          {isH && (
            <text x={ftr.x+4} y={ftr.y-4} fontSize={9} fill={textClr} fontWeight="700">
              {fmtK(p.income)}
            </text>
          )}
        </g>
      );
    });
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  SCATTER — spheres placed at (wx, wy, wz) in 3D space
  // ══════════════════════════════════════════════════════════════════════════
  const renderScatter = () => {
    // painter's order: far-back-high first
    const order = [...pts].map((p,i)=>i)
      .sort((a,b) => (pts[b].wx*0.4 + pts[b].wz*0.6) - (pts[a].wx*0.4 + pts[a].wz*0.6));

    return order.map(i => {
      const p   = pts[i];
      const isH = hovered === i;
      const col = heatColor(p.wy);
      const r   = isH ? 14 : 10;
      const sp  = proj2(p.wx, p.wy, p.wz);
      const fp  = proj2(p.wx, 0,    p.wz);

      return (
        <g key={i} style={{cursor:'pointer'}}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}>
          <line x1={fp.x} y1={fp.y} x2={sp.x} y2={sp.y}
            stroke={col} strokeWidth={1.5} strokeDasharray="3 2" opacity={0.4}/>
          <ellipse cx={fp.x+2} cy={fp.y+1} rx={r*1.1} ry={r*0.28}
            fill={col} opacity={0.18}/>
          <circle cx={sp.x+5} cy={sp.y+5} r={r} fill={col} opacity={0.18}/>
          <circle cx={sp.x}   cy={sp.y}   r={r} fill={col} opacity={0.9}/>
          <circle cx={sp.x-r*0.28} cy={sp.y-r*0.32} r={r*0.3} fill="white" opacity={0.55}/>
          <circle cx={sp.x} cy={sp.y} r={r} fill="none" stroke="white" strokeWidth={0.7} opacity={0.25}/>
        </g>
      );
    });
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  SURFACE — proper ribbon mesh across X and Z
  // ══════════════════════════════════════════════════════════════════════════
  const renderSurface = () => {
    const ROWS = 6;  // slices along Z
    const els: JSX.Element[] = [];

    // Grid cell: row=Z slice (0=front, ROWS=back), col=time index
    const cell = (row: number, col: number) => {
      const wx = col / (n - 1);
      const wz = row / ROWS;
      // Y interpolates: full height at front (wz=0), tapers slightly at back
      const wy = pts[col].wy * (1 - wz * 0.25);
      return { wx, wy, wz };
    };

    // Draw back rows first (high Z = back in this projection)
    for (let row = ROWS - 1; row >= 0; row--) {
      for (let col = 0; col < n - 1; col++) {
        const a  = cell(row,   col);
        const b  = cell(row,   col+1);
        const c  = cell(row+1, col+1);
        const d  = cell(row+1, col);
        const pa = proj2(a.wx, a.wy, a.wz);
        const pb = proj2(b.wx, b.wy, b.wz);
        const pc = proj2(c.wx, c.wy, c.wz);
        const pd = proj2(d.wx, d.wy, d.wz);
        const avgWy = (a.wy+b.wy+c.wy+d.wy)/4;
        const fade  = 0.6 + (1 - row/ROWS) * 0.35;
        els.push(
          <polygon key={`s${row}-${col}`}
            points={poly([pa,pb,pc,pd])}
            fill={heatColor(avgWy)}
            opacity={fade}
            stroke={darkMode?'rgba(0,0,0,0.25)':'rgba(255,255,255,0.35)'}
            strokeWidth={0.6}/>
        );
      }
    }

    // Front edge ridge line + dots
    const frontPts = pts.map(p => proj2(p.wx, p.wy, 0));
    const ridge = frontPts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    els.push(
      <path key="ridge" d={ridge} fill="none" stroke={heatColor(0.9)} strokeWidth={2.5} opacity={0.95}/>,
      ...pts.map((p, i) => {
        const pt = proj2(p.wx, p.wy, 0);
        return (
          <circle key={`rd${i}`} cx={pt.x} cy={pt.y}
            r={hovered===i?9:5} fill={heatColor(p.wy)} stroke="white" strokeWidth={1.5}
            style={{cursor:'pointer'}}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}/>
        );
      })
    );
    return els;
  };

  // ── Tick labels ───────────────────────────────────────────────────────────
  const xTicks = pts.map((p, i) => {
    const pt = proj2(p.wx, 0, 0);
    return (
      <text key={i} x={pt.x} y={pt.y+17} textAnchor="middle" fill={subClr} fontSize={9}>
        {p.label}
      </text>
    );
  });

  // Y ticks run along the right wall (wx=1) to match the moved Income axis
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => {
  const pt = proj2(0, f, 1); // ⬅️ move to LEFT side (wx=0)

  return (
    <text
      key={f}
      x={pt.x - 10}           // ⬅️ shift left
      y={pt.y + 4}
      textAnchor="end"        // ⬅️ align right (clean look)
      fill={subClr}
      fontSize={9}
    >
      {fmtK(f * maxIncome)}
    </text>
  );
});
  const zTicks = [0, 0.5, 1].map(f => {
    const pt = proj2(0, 0, f);
    return (
      <text key={f} x={pt.x-6} y={pt.y-3} textAnchor="end" fill={subClr} fontSize={8}>
        {fmtK(f * maxZ)}
      </text>
    );
  });

  // ── Tooltip ───────────────────────────────────────────────────────────────
  const hovPt = hovered !== null ? (() => {
    const p = pts[hovered];
    const sp = proj2(p.wx, p.wy, type === 'bar' ? 0 : p.wz);
    return { p, left: `${(sp.x/W*100).toFixed(1)}%`, top: `${(sp.y/H*100).toFixed(1)}%` };
  })() : null;

  return (
    <div style={{ position:'relative', width:'100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow:'visible' }}>

        {/* Floor grid */}
        {gridEls}

        {/* Axes */}
        <line x1={O.x}     y1={O.y}     x2={xEnd.x} y2={xEnd.y} stroke={axisClr} strokeWidth={1.8}/>
        <line x1={yBase.x} y1={yBase.y} x2={yEnd.x} y2={yEnd.y} stroke={axisClr} strokeWidth={1.8}/>
        <line x1={O.x}     y1={O.y}     x2={zEnd.x} y2={zEnd.y} stroke={axisClr} strokeWidth={1.8}/>
        {/* Axis labels */}
        <text x={xEnd.x+14} y={xEnd.y+5}  fill={textClr} fontSize={11} fontWeight="700">Time</text>
        <text x={yEnd.x+10} y={yEnd.y-6}  fill={textClr} fontSize={11} fontWeight="700">Income</text>
        <text x={zEnd.x-10} y={zEnd.y-8}  fill={textClr} fontSize={11} fontWeight="700" textAnchor="end">
          {zParam === 'expenses' ? 'Expenses' : 'Balance'}
        </text>

        {/* Right wall guide lines (at wx=1) */}
        
        {/* Tick labels */}
        {xTicks}
        {yTicks}
        {zTicks}

        {/* Chart */}
        {type === 'bar'     && renderBars()}
        {type === 'scatter' && renderScatter()}
        {type === 'surface' && renderSurface()}

        {/* Colour gradient legend */}
        <defs>
          <linearGradient id="cleg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={heatColor(0)}/>
            <stop offset="50%"  stopColor={heatColor(0.5)}/>
            <stop offset="100%" stopColor={heatColor(1)}/>
          </linearGradient>
        </defs>
        <text x={W-168} y={18} fill={subClr} fontSize={8}>Low</text>
        <rect x={W-148} y={8} width={90} height={8} rx={4} fill="url(#cleg)" opacity={0.9}/>
        <text x={W-52}  y={18} fill={subClr} fontSize={8}>High income</text>

      </svg>

      {/* Tooltip */}
      {hovPt && (
        <div style={{
          position:'absolute', left: hovPt.left, top: hovPt.top,
          transform:'translate(14px,-52px)',
          background: tipBg, border:`1px solid ${tipBdr}`,
          borderRadius:10, padding:'8px 13px', fontSize:11,
          pointerEvents:'none', zIndex:999,
          color: darkMode?'#F3F4F6':'#111827',
          boxShadow:'0 6px 24px rgba(0,0,0,0.2)',
          whiteSpace:'nowrap', minWidth:150,
        }}>
          <div style={{fontWeight:700, marginBottom:4, fontSize:13}}>{hovPt.p.label}</div>
          <div>Income: <b style={{color:'#10B981'}}>{fmt(hovPt.p.income)}</b></div>
          <div>{zParam==='expenses'?'Expenses':'Balance'}: <b style={{color:heatColor(hovPt.p.wz)}}>{fmt(hovPt.p.zVal)}</b></div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { darkMode } = useStore();

  const [timeRange,  setTimeRange]  = useState<TimeRange>('month');
  const [lineParam,  setLineParam]  = useState<LineParam>('balance');
  const [invParam,   setInvParam]   = useState<InvParam>('stocks');
  const [chartType,  setChartType]  = useState<'line'|'area'>('area');
  const [threeDType, setThreeDType] = useState<ThreeDChartType>('surface');
  const [zParam,     setZParam]     = useState<ZParam>('expenses');
  const [threeDRange, setThreeDRange] = useState<'week'|'month'>('week');

  const trendData = useMemo(() => {
    if (timeRange === 'week') return WEEKLY_DATA;
    if (timeRange === 'year') return YEARLY_DATA;
    return MONTHLY_DATA;
  }, [timeRange]);

  const threeDData = threeDRange === 'week' ? WEEKLY_DATA : MONTHLY_DATA;

  const latest = MONTHLY_DATA[MONTHLY_DATA.length - 1];

  const kpis = [
    { label:'Total Balance',    value:fmt(latest.balance),  icon:Wallet,      color:'blue',   trend:'up',   change:'+3.2%'  },
    { label:'Monthly Income',   value:fmt(latest.income),   icon:TrendingUp,  color:'green',  trend:'up',   change:'+11.6%' },
    { label:'Monthly Expenses', value:fmt(latest.expenses), icon:TrendingDown,color:'red',    trend:'down', change:'+2.7%'  },
    { label:'Savings Rate',     value:'24.5%',              icon:DollarSign,  color:'purple', trend:'up',   change:'+1.8%'  },
  ];

  const card   = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const title  = darkMode ? 'text-white'    : 'text-gray-900';
  const sub    = darkMode ? 'text-gray-400' : 'text-gray-600';
  const grid   = darkMode ? '#374151'       : '#E5E7EB';
  const axis   = darkMode ? '#9CA3AF'       : '#6B7280';
  const tip    = { backgroundColor:darkMode?'#1F2937':'#fff', border:`1px solid ${darkMode?'#374151':'#E5E7EB'}`, borderRadius:8 };
  const tipLbl = { color:darkMode?'#F3F4F6':'#111827' };

  const btnBase = (active: boolean) =>
    `px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
      active ? 'bg-blue-600 text-white shadow-sm'
             : darkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
    }`;
  const grpWrap = `flex gap-1 rounded-lg p-1 ${darkMode?'bg-gray-700':'bg-gray-100'}`;

  const colorMap: Record<string,{bg:string;icon:string}> = {
    blue:   {bg:darkMode?'bg-blue-900/50'  :'bg-blue-50',  icon:darkMode?'text-blue-400'  :'text-blue-600'  },
    green:  {bg:darkMode?'bg-green-900/50' :'bg-green-50', icon:darkMode?'text-green-400' :'text-green-600' },
    red:    {bg:darkMode?'bg-red-900/50'   :'bg-red-50',   icon:darkMode?'text-red-400'   :'text-red-600'   },
    purple: {bg:darkMode?'bg-purple-900/50':'bg-purple-50',icon:darkMode?'text-purple-400':'text-purple-600'},
  };

  const threeDMeta: Record<ThreeDChartType, string> = {
    bar:     '3D columns — income vs selected metric',
scatter: '3D points — full 3D data distribution',
surface: '3D surface — trend intensity map',
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode?'bg-gray-900':'bg-gray-50'}`}>
      <div className="space-y-6 p-6">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className={`text-3xl font-bold tracking-tight ${title}`}>Dashboard</h2>
            <p className={`text-sm mt-1 ${sub}`}>April 2025 · Financial Overview</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            darkMode?'bg-green-900/30 border-green-700 text-green-400':'bg-green-50 border-green-200 text-green-700'
          }`}>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            Live · Updated just now
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(k => {
            const Icon = k.icon;
            const TI   = k.trend==='up'?ArrowUpRight:ArrowDownRight;
            const c    = colorMap[k.color];
            return (
              <div key={k.label} className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${card}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${c.bg}`}><Icon className={`w-5 h-5 ${c.icon}`}/></div>
                  <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    k.trend==='up'?darkMode?'bg-green-900/40 text-green-400':'bg-green-50 text-green-600'
                                  :darkMode?'bg-red-900/40 text-red-400':'bg-red-50 text-red-600'
                  }`}><TI className="w-3 h-3"/>{k.change}</span>
                </div>
                <p className={`text-sm font-medium ${sub}`}>{k.label}</p>
                <p className={`text-2xl font-bold mt-1 tracking-tight ${title}`}>{k.value}</p>
              </div>
            );
          })}
        </div>

        {/* Trend + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-6 rounded-2xl border ${card}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Activity className={`w-5 h-5 ${darkMode?'text-blue-400':'text-blue-600'}`}/>
                <h3 className={`text-lg font-semibold ${title}`}>Trend Analysis</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className={grpWrap}>
                  {(['week','month','year'] as TimeRange[]).map(r => (
                    <button key={r} onClick={()=>setTimeRange(r)} className={btnBase(timeRange===r)}>
                      {r.charAt(0).toUpperCase()+r.slice(1)}
                    </button>
                  ))}
                </div>
                <div className={grpWrap}>
                  {(['balance','income','expenses','savings'] as LineParam[]).map(p => (
                    <button key={p} onClick={()=>setLineParam(p)} className={btnBase(lineParam===p)}>
                      {p.charAt(0).toUpperCase()+p.slice(1)}
                    </button>
                  ))}
                </div>
                <div className={grpWrap}>
                  <button onClick={()=>setChartType('area')} className={btnBase(chartType==='area')}>Area</button>
                  <button onClick={()=>setChartType('line')} className={btnBase(chartType==='line')}>Line</button>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              {chartType==='area' ? (
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="gradParam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid}/>
                  <XAxis dataKey="date" stroke={axis} style={{fontSize:11}}/>
                  <YAxis stroke={axis} style={{fontSize:11}} tickFormatter={v=>fmtK(Number(v))}/>
                  <Tooltip contentStyle={tip} labelStyle={tipLbl} formatter={(v)=>[fmt(Number(v??0)),lineParam]}/>
                  <Area type="monotone" dataKey={lineParam} stroke="#3B82F6" strokeWidth={2.5} fill="url(#gradParam)" dot={{fill:'#3B82F6',r:3}} activeDot={{r:6}}/>
                </AreaChart>
              ) : (
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid}/>
                  <XAxis dataKey="date" stroke={axis} style={{fontSize:11}}/>
                  <YAxis stroke={axis} style={{fontSize:11}} tickFormatter={v=>fmtK(Number(v))}/>
                  <Tooltip contentStyle={tip} labelStyle={tipLbl} formatter={(v)=>[fmt(Number(v??0)),lineParam]}/>
                  <Line type="monotone" dataKey={lineParam} stroke="#3B82F6" strokeWidth={2.5} dot={{fill:'#3B82F6',r:3}} activeDot={{r:6}}/>
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className={`p-6 rounded-2xl border ${card}`}>
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className={`w-5 h-5 ${darkMode?'text-pink-400':'text-pink-500'}`}/>
              <h3 className={`text-lg font-semibold ${title}`}>Expense Breakdown</h3>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={EXPENSES_BY_CATEGORY} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                  {EXPENSES_BY_CATEGORY.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={tip} formatter={(v)=>[fmt(Number(v??0))]}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {EXPENSES_BY_CATEGORY.slice(0,6).map((cat,i)=>(
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor:COLORS[i%COLORS.length]}}/>
                    <span className={`text-xs ${sub}`}>{cat.name}</span>
                  </div>
                  <span className={`text-xs font-semibold ${title}`}>{((cat.value/totalExpenses)*100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3D Chart ──────────────────────────────────────────────────────── */}
        <div className={`p-6 rounded-2xl border ${card}`}>
          {/* Header row */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className={`w-5 h-2 ${darkMode?'text-amber-400':'text-amber-500'}`}/>
              <h3 className={`text-lg font-semibold ${title}`}>3D Financial Chart</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Time dataset toggle */}
              <div className={grpWrap}>
                <button onClick={()=>setThreeDRange('week')}  className={btnBase(threeDRange==='week')}>Weekly</button>
                <button onClick={()=>setThreeDRange('month')} className={btnBase(threeDRange==='month')}>Monthly</button>
              </div>
              {/* Z axis param */}
              <div className={grpWrap}>
                <button onClick={()=>setZParam('expenses')} className={btnBase(zParam==='expenses')}>Expenses</button>
                <button onClick={()=>setZParam('balance')}  className={btnBase(zParam==='balance')}>Balance</button>
              </div>
              {/* Chart type */}
              <div className={grpWrap}>
                {(['bar','scatter','surface'] as ThreeDChartType[]).map(t=>(
                  <button key={t} onClick={()=>setThreeDType(t)} className={btnBase(threeDType===t)}>
                    {t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Axis legend + description */}
          <div className="flex flex-wrap gap-3 mb-4">
            <span className={`text-xs px-2.5 py-1 rounded-full ${darkMode?'bg-gray-700/70 text-gray-300':'bg-gray-100 text-gray-600'}`}>
              X-axis · <b>Time</b>
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full ${darkMode?'bg-green-900/40 text-green-300':'bg-green-50 text-green-700'}`}>
              Y-axis · <b>Income</b>
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full ${darkMode?'bg-blue-900/40 text-blue-300':'bg-blue-50 text-blue-700'}`}>
              Z-axis · <b>{zParam === 'expenses' ? 'Expenses' : 'Balance'}</b>
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full ${darkMode?'bg-gray-700/50 text-gray-400':'bg-gray-50 text-gray-500'} border ${darkMode?'border-gray-600':'border-gray-200'}`}>
              {threeDMeta[threeDType]}
            </span>
          </div>

          {/* Chart */}
          <div className="w-full" style={{minHeight: 200}}>
            <ThreeDChart
              type={threeDType}
              data={threeDData}
              zParam={zParam}
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* Radar */}
        <div className={`p-6 rounded-2xl border ${card}`}>
          <div className="flex items-center gap-2 mb-4">
            <Layers className={`w-5 h-5 ${darkMode?'text-violet-400':'text-violet-600'}`}/>
            <h3 className={`text-lg font-semibold ${title}`}>Financial Health Radar</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke={grid}/>
              <PolarAngleAxis dataKey="subject" stroke={axis} style={{fontSize:11}}/>
              <PolarRadiusAxis angle={30} domain={[0,100]} stroke={axis} style={{fontSize:9}}/>
              <Radar name="Score" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.35} strokeWidth={2}/>
              <Tooltip contentStyle={tip} formatter={(v: any) => [`${Number(v)}/100`, 'Score']}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Investment Portfolio */}
        <div className={`p-6 rounded-2xl border ${card}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h3 className={`text-lg font-semibold ${title}`}>Investment Portfolio Breakdown</h3>
              <p className={`text-xs mt-0.5 ${sub}`}>6-month view across asset classes</p>
            </div>
            <div className={grpWrap}>
              {(['stocks','mutual_funds','fd','gold'] as InvParam[]).map(p=>(
                <button key={p} onClick={()=>setInvParam(p)} className={btnBase(invParam===p)}>
                  {p==='mutual_funds'?'MFs':p==='fd'?'FD':p.charAt(0).toUpperCase()+p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={INVESTMENT_DATA}>
              <defs>
                {[['gS','#3B82F6'],['gM','#10B981'],['gF','#F59E0B'],['gG','#EC4899']].map(([id,c])=>(
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={grid}/>
              <XAxis dataKey="month" stroke={axis} style={{fontSize:11}}/>
              <YAxis stroke={axis} style={{fontSize:11}} tickFormatter={v=>fmtK(Number(v))}/>
              <Tooltip contentStyle={tip} labelStyle={tipLbl} formatter={(v)=>[fmt(Number(v??0))]}/>
              <Legend wrapperStyle={{fontSize:12,color:axis}}/>
              <Area type="monotone" dataKey="stocks"       stroke="#3B82F6" fill="url(#gS)" strokeWidth={invParam==='stocks'      ?3:1} opacity={invParam==='stocks'      ?1:0.3}/>
              <Area type="monotone" dataKey="mutual_funds" stroke="#10B981" fill="url(#gM)" strokeWidth={invParam==='mutual_funds' ?3:1} opacity={invParam==='mutual_funds' ?1:0.3} name="Mutual Funds"/>
              <Area type="monotone" dataKey="fd"           stroke="#F59E0B" fill="url(#gF)" strokeWidth={invParam==='fd'           ?3:1} opacity={invParam==='fd'           ?1:0.3} name="Fixed Deposit"/>
              <Area type="monotone" dataKey="gold"         stroke="#EC4899" fill="url(#gG)" strokeWidth={invParam==='gold'         ?3:1} opacity={invParam==='gold'         ?1:0.3}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Income vs Expenses */}
        <div className={`p-6 rounded-2xl border ${card}`}>
          <div className="mb-6">
            <h3 className={`text-lg font-semibold ${title}`}>Income vs Expenses — Full Year</h3>
            <p className={`text-xs mt-0.5 ${sub}`}>Monthly comparison · 2025</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MONTHLY_DATA} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false}/>
              <XAxis dataKey="date" stroke={axis} style={{fontSize:11}}/>
              <YAxis stroke={axis} style={{fontSize:11}} tickFormatter={v=>fmtK(Number(v))}/>
              <Tooltip contentStyle={tip} labelStyle={tipLbl} formatter={(v)=>[fmt(Number(v??0))]}/>
              <Legend wrapperStyle={{fontSize:12,color:axis}}/>
              <Bar dataKey="income"   name="Income"   fill="#10B981" radius={[4,4,0,0]} opacity={0.9}/>
              <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4,4,0,0]} opacity={0.9}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className={`p-6 rounded-2xl border ${card}`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className={`text-lg font-semibold ${title}`}>Recent Transactions</h3>
            <button className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              darkMode?'bg-gray-700 text-gray-300 hover:bg-gray-600':'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
              <RefreshCw className="w-3.5 h-3.5"/>Refresh
            </button>
          </div>
          <div className="space-y-2">
            {RECENT_TRANSACTIONS.map(tx => (
              <div key={tx.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-default ${
                darkMode?'border-gray-700 hover:bg-gray-700/50':'border-gray-100 hover:bg-gray-50'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type==='income'?darkMode?'bg-green-900/50':'bg-green-50':darkMode?'bg-red-900/50':'bg-red-50'
                  }`}>
                    {tx.type==='income'
                      ?<ArrowUpRight   className={`w-5 h-5 ${darkMode?'text-green-400':'text-green-600'}`}/>
                      :<ArrowDownRight className={`w-5 h-5 ${darkMode?'text-red-400'  :'text-red-600'  }`}/>
                    }
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${title}`}>{tx.description}</p>
                    <p className={`text-xs ${sub}`}>{tx.category} · {new Date(tx.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${
                  tx.type==='income'?darkMode?'text-green-400':'text-green-600':darkMode?'text-red-400':'text-red-600'
                }`}>
                  {tx.type==='income'?'+':'−'}{fmt(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
