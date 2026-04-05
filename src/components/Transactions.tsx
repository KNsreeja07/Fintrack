import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus, Search, Filter, Download, Edit2, Trash2, X,
  ArrowUpDown, Flag, CheckCircle, Clock, AlertTriangle,
  ChevronDown, CheckSquare, Square, ShieldCheck, Ban,
  TrendingUp, TrendingDown, MoreHorizontal, RefreshCw
} from 'lucide-react';
import { useStore } from '../store/useStore';

// ─── Types ──────────────────────────────────────────────────────────────────

type TxStatus = 'pending' | 'approved' | 'flagged';

interface MockTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  status: TxStatus;
  flagged: boolean;
  reviewed: boolean;
  account: string;
  note?: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_TRANSACTIONS: MockTransaction[] = [
  { id: '1',  date: '2025-03-28', description: 'Client Invoice – Acme Corp',      category: 'Revenue',      amount: 12500.00, type: 'income',  status: 'approved', flagged: false, reviewed: true,  account: 'Main Account' },
  { id: '2',  date: '2025-03-27', description: 'AWS Cloud Services',              category: 'Software',     amount: 843.20,   type: 'expense', status: 'approved', flagged: false, reviewed: true,  account: 'Ops Account'  },
  { id: '3',  date: '2025-03-25', description: 'Office Rent – Q1',                category: 'Rent',         amount: 3200.00,  type: 'expense', status: 'approved', flagged: false, reviewed: true,  account: 'Main Account' },
  { id: '4',  date: '2025-03-22', description: 'Freelancer Payment – UI Design',  category: 'Payroll',      amount: 2400.00,  type: 'expense', status: 'pending',  flagged: false, reviewed: false, account: 'Payroll'      },
  { id: '5',  date: '2025-03-20', description: 'Google Ads Campaign',             category: 'Marketing',    amount: 1750.00,  type: 'expense', status: 'approved', flagged: false, reviewed: true,  account: 'Marketing'    },
  { id: '6',  date: '2025-03-18', description: 'Subscription Revenue – March',    category: 'Revenue',      amount: 8900.00,  type: 'income',  status: 'approved', flagged: false, reviewed: true,  account: 'Main Account' },
  { id: '7',  date: '2025-03-15', description: 'Team Lunch – Client Meeting',     category: 'Meals',        amount: 284.50,   type: 'expense', status: 'approved', flagged: false, reviewed: true,  account: 'Ops Account'  },
  { id: '8',  date: '2025-03-14', description: 'Unusual Wire Transfer',           category: 'Transfer',     amount: 15000.00, type: 'expense', status: 'flagged',  flagged: true,  reviewed: false, account: 'Main Account', note: 'Unrecognised beneficiary – needs review' },
  { id: '9',  date: '2025-03-12', description: 'SaaS Tooling – Figma, Notion',   category: 'Software',     amount: 156.00,   type: 'expense', status: 'approved', flagged: false, reviewed: true,  account: 'Ops Account'  },
  { id: '10', date: '2025-03-10', description: 'Consulting Fee – DataSync Ltd',   category: 'Revenue',      amount: 5500.00,  type: 'income',  status: 'approved', flagged: false, reviewed: true,  account: 'Main Account' },
  { id: '11', date: '2025-03-08', description: 'Electricity & Utilities',         category: 'Utilities',    amount: 610.00,   type: 'expense', status: 'approved', flagged: false, reviewed: true,  account: 'Ops Account'  },
  { id: '12', date: '2025-03-05', description: 'Domain & Hosting Renewals',       category: 'Software',     amount: 320.00,   type: 'expense', status: 'pending',  flagged: false, reviewed: false, account: 'Ops Account'  },
  { id: '13', date: '2025-03-03', description: 'Employee Salaries – March',       category: 'Payroll',      amount: 28400.00, type: 'expense', status: 'approved', flagged: false, reviewed: true,  account: 'Payroll'      },
  { id: '14', date: '2025-03-01', description: 'Grant Income – State Scheme',     category: 'Revenue',      amount: 7500.00,  type: 'income',  status: 'approved', flagged: false, reviewed: true,  account: 'Main Account' },
  { id: '15', date: '2025-02-27', description: 'Conference Travel – NYC',         category: 'Travel',       amount: 2180.00,  type: 'expense', status: 'approved', flagged: false, reviewed: true,  account: 'Ops Account'  },
  { id: '16', date: '2025-02-24', description: 'Insurance Premium – Q1',          category: 'Insurance',    amount: 1400.00,  type: 'expense', status: 'approved', flagged: false, reviewed: true,  account: 'Main Account' },
  { id: '17', date: '2025-02-20', description: 'Refund – Cancelled Subscription', category: 'Refunds',      amount: 99.00,    type: 'income',  status: 'approved', flagged: false, reviewed: true,  account: 'Main Account' },
  { id: '18', date: '2025-02-18', description: 'Cash Withdrawal – no receipt',    category: 'Miscellaneous',amount: 500.00,   type: 'expense', status: 'flagged',  flagged: true,  reviewed: false, account: 'Main Account', note: 'Missing receipt' },
  { id: '19', date: '2025-02-15', description: 'Client Invoice – Beta Studios',   category: 'Revenue',      amount: 9200.00,  type: 'income',  status: 'approved', flagged: false, reviewed: true,  account: 'Main Account' },
  { id: '20', date: '2025-02-10', description: 'Office Supplies',                 category: 'Operations',   amount: 375.80,   type: 'expense', status: 'pending',  flagged: false, reviewed: false, account: 'Ops Account'  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const STATUS_CONFIG: Record<TxStatus, { label: string; icon: React.ComponentType<{ className?: string }>; lightClass: string; darkClass: string }> = {
  approved: { label: 'Approved', icon: CheckCircle,    lightClass: 'bg-green-100 text-green-700',  darkClass: 'bg-green-900/40 text-green-300'  },
  pending:  { label: 'Pending',  icon: Clock,          lightClass: 'bg-amber-100 text-amber-700',  darkClass: 'bg-amber-900/40 text-amber-300'  },
  flagged:  { label: 'Flagged',  icon: AlertTriangle,  lightClass: 'bg-red-100 text-red-700',      darkClass: 'bg-red-900/40 text-red-300'      },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status, darkMode }: { status: TxStatus; darkMode: boolean }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${darkMode ? cfg.darkClass : cfg.lightClass}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type, darkMode }: { type: 'income' | 'expense'; darkMode: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      type === 'income'
        ? darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'
        : darkMode ? 'bg-red-900/40 text-red-300'  : 'bg-red-100 text-red-700'
    }`}>
      {type === 'income' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Transactions() {
  const { darkMode, userRole } = useStore();
  const isAdmin = userRole === 'admin';

  // ── local transaction state (mock) ──
  const [transactions, setTransactions] = useState<MockTransaction[]>(MOCK_TRANSACTIONS);

  // ── filter/search state ──
  const [searchQuery, setSearchQuery]       = useState('');
  const [filterType, setFilterType]         = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus]     = useState<'all' | TxStatus>('all');
  const [filterAccount, setFilterAccount]   = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo]     = useState('');
  const [filterAmtMin, setFilterAmtMin]     = useState('');
  const [filterAmtMax, setFilterAmtMax]     = useState('');
  const [sortBy, setSortBy]                 = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder]           = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters]       = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // ── modal state ──
  const [showAddModal, setShowAddModal]           = useState(false);
  const [showEditModal, setShowEditModal]         = useState(false);
  const [editingTx, setEditingTx]                 = useState<MockTransaction | null>(null);
  const [showNoteModal, setShowNoteModal]         = useState(false);
  const [noteTargetId, setNoteTargetId]           = useState<string | null>(null);
  const [noteText, setNoteText]                   = useState('');

  // ── bulk select (admin only) ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  // ── action menus per row ──
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
      setShowExportMenu(false);
      setShowBulkMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── derived lists ──
  const categories = useMemo(() => [...new Set(transactions.map(t => t.category))].sort(), [transactions]);
  const accounts   = useMemo(() => [...new Set(transactions.map(t => t.account))].sort(), [transactions]);

  const filteredTransactions = useMemo(() => {
    let list = transactions.filter(t => {
      const q = searchQuery.toLowerCase();
      const matchSearch   = !q || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.account.toLowerCase().includes(q);
      const matchType     = filterType === 'all' || t.type === filterType;
      const matchCat      = filterCategory === 'all' || t.category === filterCategory;
      const matchStatus   = filterStatus === 'all' || t.status === filterStatus;
      const matchAccount  = filterAccount === 'all' || t.account === filterAccount;
      const matchDateFrom = !filterDateFrom || t.date >= filterDateFrom;
      const matchDateTo   = !filterDateTo   || t.date <= filterDateTo;
      const matchAmtMin   = !filterAmtMin   || t.amount >= parseFloat(filterAmtMin);
      const matchAmtMax   = !filterAmtMax   || t.amount <= parseFloat(filterAmtMax);
      return matchSearch && matchType && matchCat && matchStatus && matchAccount && matchDateFrom && matchDateTo && matchAmtMin && matchAmtMax;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date')   cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount') cmp = a.amount - b.amount;
      if (sortBy === 'status') cmp = a.status.localeCompare(b.status);
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [transactions, searchQuery, filterType, filterCategory, filterStatus, filterAccount, filterDateFrom, filterDateTo, filterAmtMin, filterAmtMax, sortBy, sortOrder]);

  const activeFilterCount = [
    filterType !== 'all', filterCategory !== 'all', filterStatus !== 'all',
    filterAccount !== 'all', !!filterDateFrom, !!filterDateTo, !!filterAmtMin, !!filterAmtMax,
  ].filter(Boolean).length;

  // ── summary stats ──
  const totalIncome  = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const pendingCount = filteredTransactions.filter(t => t.status === 'pending').length;
  const flaggedCount = filteredTransactions.filter(t => t.flagged).length;

  // ── CRUD helpers ──
  const addTx = (data: Omit<MockTransaction, 'id' | 'status' | 'flagged' | 'reviewed'>) => {
    const newTx: MockTransaction = { ...data, id: String(Date.now()), status: 'pending', flagged: false, reviewed: false };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateTx = (id: string, patch: Partial<MockTransaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const deleteTx = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const toggleFlag = (id: string) => {
    setTransactions(prev => prev.map(t =>
      t.id === id ? { ...t, flagged: !t.flagged, status: !t.flagged ? 'flagged' : 'pending' } : t
    ));
  };

  const toggleReviewed = (id: string) => {
    setTransactions(prev => prev.map(t =>
      t.id === id ? { ...t, reviewed: !t.reviewed, status: !t.reviewed ? 'approved' : 'pending' } : t
    ));
  };

  const approveSelected = () => {
    setTransactions(prev => prev.map(t =>
      selectedIds.has(t.id) ? { ...t, status: 'approved', reviewed: true } : t
    ));
    setSelectedIds(new Set());
  };

  const deleteSelected = () => {
    if (!window.confirm(`Delete ${selectedIds.size} transaction(s)?`)) return;
    setTransactions(prev => prev.filter(t => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
  };

  const clearFilters = () => {
    setSearchQuery(''); setFilterType('all'); setFilterCategory('all');
    setFilterStatus('all'); setFilterAccount('all');
    setFilterDateFrom(''); setFilterDateTo('');
    setFilterAmtMin(''); setFilterAmtMax('');
  };

  const exportCSV = () => {
    const header = 'Date,Description,Category,Amount,Type,Status,Account';
    const rows = filteredTransactions.map(t =>
      `${t.date},"${t.description}",${t.category},${t.amount},${t.type},${t.status},${t.account}`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'transactions.csv'; a.click();
  };

  // ── select helpers ──
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredTransactions.map(t => t.id)));
  };

  // ── shared input class ──
  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const selectCls = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
  }`;

  const labelCls = `block text-xs font-semibold uppercase tracking-wide mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`;

  const card  = `rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const text  = darkMode ? 'text-white' : 'text-gray-900';
  const muted = darkMode ? 'text-gray-400' : 'text-gray-500';

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${text}`}>Transactions</h2>
          <p className={`text-sm mt-0.5 ${muted}`}>
            {isAdmin ? 'Review, manage and act on all financial records' : 'View your financial transaction history'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showExportMenu && (
              <div className={`absolute right-0 mt-1.5 w-40 rounded-lg border shadow-xl z-20 overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <button onClick={() => { exportCSV(); setShowExportMenu(false); }} className={`w-full text-left px-4 py-2.5 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  Export as CSV
                </button>
                <button onClick={() => { const blob = new Blob([JSON.stringify(filteredTransactions, null, 2)], {type:'application/json'}); const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='transactions.json';a.click(); setShowExportMenu(false); }} className={`w-full text-left px-4 py-2.5 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  Export as JSON
                </button>
              </div>
            )}
          </div>

          {/* Bulk actions – admin only */}
          {isAdmin && selectedIds.size > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowBulkMenu(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                <CheckSquare className="w-4 h-4" />
                {selectedIds.size} selected
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showBulkMenu && (
                <div className={`absolute right-0 mt-1.5 w-44 rounded-lg border shadow-xl z-20 overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <button onClick={() => { approveSelected(); setShowBulkMenu(false); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Approve All
                  </button>
                  <button onClick={() => { deleteSelected(); setShowBulkMenu(false); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-50'}`}>
                    <Trash2 className="w-4 h-4" /> Delete All
                  </button>
                  <button onClick={() => { setSelectedIds(new Set()); setShowBulkMenu(false); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <X className="w-4 h-4" /> Clear Selection
                  </button>
                </div>
              )}
            </div>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          )}
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Income',  value: formatCurrency(totalIncome),   color: 'text-green-500', icon: TrendingUp },
          { label: 'Total Expense', value: formatCurrency(totalExpense),   color: 'text-red-500',   icon: TrendingDown },
          { label: 'Net Balance',   value: formatCurrency(totalIncome - totalExpense), color: totalIncome >= totalExpense ? 'text-blue-500' : 'text-red-500', icon: RefreshCw },
          { label: isAdmin ? 'Needs Review' : 'Pending', value: isAdmin ? `${pendingCount + flaggedCount} items` : `${pendingCount} pending`, color: 'text-amber-500', icon: Clock },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`${card} p-4`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Search + Filter ── */}
      <div className={`${card} p-5 space-y-4`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
            <input
              type="text"
              placeholder="Search description, category, account…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`${inputCls} pl-9`}
            />
          </div>

          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-blue-600 border-blue-600 text-white'
                : darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 bg-white text-blue-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'} space-y-4`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Type */}
              <div>
                <label className={labelCls}>Type</label>
                <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className={selectCls}>
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className={labelCls}>Category</label>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={selectCls}>
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Status – admin only */}
              {isAdmin && (
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className={selectCls}>
                    <option value="all">All Statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </div>
              )}

              {/* Account */}
              <div>
                <label className={labelCls}>Account</label>
                <select value={filterAccount} onChange={e => setFilterAccount(e.target.value)} className={selectCls}>
                  <option value="all">All Accounts</option>
                  {accounts.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className={labelCls}>Date From</label>
                <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className={inputCls} />
              </div>

              {/* Date To */}
              <div>
                <label className={labelCls}>Date To</label>
                <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className={inputCls} />
              </div>

              {/* Amount Min */}
              <div>
                <label className={labelCls}>Min Amount ($)</label>
                <input type="number" placeholder="0" value={filterAmtMin} onChange={e => setFilterAmtMin(e.target.value)} className={inputCls} min="0" />
              </div>

              {/* Amount Max */}
              <div>
                <label className={labelCls}>Max Amount ($)</label>
                <input type="number" placeholder="Any" value={filterAmtMax} onChange={e => setFilterAmtMax(e.target.value)} className={inputCls} min="0" />
              </div>

              {/* Sort */}
              <div>
                <label className={labelCls}>Sort By</label>
                <div className="flex gap-2">
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className={selectCls}>
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    {isAdmin && <option value="status">Status</option>}
                  </select>
                  <button
                    onClick={() => setSortOrder(v => v === 'asc' ? 'desc' : 'asc')}
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    className={`shrink-0 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                  >
                    <ArrowUpDown className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''} transition-transform`} />
                  </button>
                </div>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex justify-end">
                <button onClick={clearFilters} className="text-sm font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Table ── */}
        <div className="overflow-x-auto mt-2" ref={menuRef}>
          {filteredTransactions.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {isAdmin && (
                    <th className="py-3 px-3 text-left w-8">
                      <button onClick={toggleSelectAll}>
                        {selectedIds.size === filteredTransactions.length && filteredTransactions.length > 0
                          ? <CheckSquare className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                          : <Square className={`w-4 h-4 ${muted}`} />
                        }
                      </button>
                    </th>
                  )}
                  {['Date', 'Description', 'Category', 'Account', 'Amount', 'Type', ...(isAdmin ? ['Status', 'Actions'] : ['Status'])].map(h => (
                    <th key={h} className={`py-3 px-4 font-semibold text-xs uppercase tracking-wide ${muted} ${h === 'Amount' || h === 'Actions' ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => (
                  <tr
                    key={tx.id}
                    className={`border-b transition-colors ${
                      tx.flagged
                        ? darkMode ? 'border-red-900/30 bg-red-900/10 hover:bg-red-900/20' : 'border-red-100 bg-red-50/50 hover:bg-red-50'
                        : darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'
                    } ${selectedIds.has(tx.id) ? darkMode ? 'bg-blue-900/20' : 'bg-blue-50/50' : ''}`}
                  >
                    {/* Checkbox */}
                    {isAdmin && (
                      <td className="py-3 px-3">
                        <button onClick={() => toggleSelect(tx.id)}>
                          {selectedIds.has(tx.id)
                            ? <CheckSquare className="w-4 h-4 text-blue-500" />
                            : <Square className={`w-4 h-4 ${muted}`} />
                          }
                        </button>
                      </td>
                    )}

                    {/* Date */}
                    <td className={`py-3 px-4 ${muted} whitespace-nowrap`}>
                      {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    {/* Description */}
                    <td className={`py-3 px-4 font-medium ${text} max-w-[180px]`}>
                      <div className="truncate">{tx.description}</div>
                      {tx.note && (
                        <div className="text-xs text-amber-500 flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{tx.note}</span>
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        {tx.category}
                      </span>
                    </td>

                    {/* Account */}
                    <td className={`py-3 px-4 text-xs ${muted} whitespace-nowrap`}>{tx.account}</td>

                    {/* Amount */}
                    <td className={`py-3 px-4 text-right font-semibold whitespace-nowrap ${tx.type === 'income' ? 'text-green-500' : darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <TypeBadge type={tx.type} darkMode={darkMode} />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={tx.status} darkMode={darkMode} />
                    </td>

                    {/* Actions – admin only */}
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)}
                            className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                          >
                            <MoreHorizontal className={`w-4 h-4 ${muted}`} />
                          </button>

                          {openMenuId === tx.id && (
                            <div className={`absolute right-0 mt-1 w-48 rounded-xl border shadow-2xl z-30 overflow-hidden py-1 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                              <button onClick={() => { setEditingTx(tx); setShowEditModal(true); setOpenMenuId(null); }}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                                <Edit2 className="w-4 h-4" /> Edit transaction
                              </button>

                              <button onClick={() => { toggleReviewed(tx.id); setOpenMenuId(null); }}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                                {tx.reviewed
                                  ? <><Ban className="w-4 h-4 text-amber-500" /> Mark unreviewed</>
                                  : <><CheckCircle className="w-4 h-4 text-green-500" /> Mark as reviewed</>
                                }
                              </button>

                              <button onClick={() => { toggleFlag(tx.id); setOpenMenuId(null); }}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                                {tx.flagged
                                  ? <><Flag className="w-4 h-4 text-gray-400" /> Unflag</>
                                  : <><Flag className="w-4 h-4 text-red-500" /> Flag as suspicious</>
                                }
                              </button>

                              <button onClick={() => { setNoteTargetId(tx.id); setNoteText(tx.note ?? ''); setShowNoteModal(true); setOpenMenuId(null); }}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                                <Edit2 className="w-4 h-4 text-blue-500" /> {tx.note ? 'Edit note' : 'Add note'}
                              </button>

                              <div className={`my-1 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`} />

                              <button onClick={() => { if (window.confirm('Delete this transaction?')) { deleteTx(tx.id); setOpenMenuId(null); } }}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-50'}`}>
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <Search className={`w-10 h-10 mx-auto mb-3 ${muted}`} />
              <p className={`font-medium ${text}`}>No transactions found</p>
              <p className={`text-sm mt-1 ${muted}`}>
                {activeFilterCount > 0 ? 'Try adjusting your filters.' : isAdmin ? 'Add your first transaction to get started.' : 'No records match your search.'}
              </p>
            </div>
          )}
        </div>

        {/* Row count */}
        {filteredTransactions.length > 0 && (
          <p className={`text-xs pt-2 border-t ${darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400'}`}>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
        )}
      </div>

      {/* ══════════════════════ ADD MODAL ══════════════════════ */}
      {showAddModal && (
        <Modal title="Add Transaction" darkMode={darkMode} onClose={() => setShowAddModal(false)}>
          <TransactionForm
            darkMode={darkMode}
            inputCls={inputCls}
            selectCls={selectCls}
            labelCls={labelCls}
            accounts={accounts}
            onSubmit={(data) => { addTx(data); setShowAddModal(false); }}
            onCancel={() => setShowAddModal(false)}
            submitLabel="Add Transaction"
          />
        </Modal>
      )}

      {/* ══════════════════════ EDIT MODAL ══════════════════════ */}
      {showEditModal && editingTx && (
        <Modal title="Edit Transaction" darkMode={darkMode} onClose={() => { setShowEditModal(false); setEditingTx(null); }}>
          <TransactionForm
            darkMode={darkMode}
            inputCls={inputCls}
            selectCls={selectCls}
            labelCls={labelCls}
            accounts={accounts}
            defaultValues={editingTx}
            onSubmit={(data) => { updateTx(editingTx.id, data); setShowEditModal(false); setEditingTx(null); }}
            onCancel={() => { setShowEditModal(false); setEditingTx(null); }}
            submitLabel="Save Changes"
          />
        </Modal>
      )}

      {/* ══════════════════════ NOTE MODAL ══════════════════════ */}
      {showNoteModal && noteTargetId && (
        <Modal title="Internal Note" darkMode={darkMode} onClose={() => setShowNoteModal(false)}>
          <div className="space-y-4">
            <p className={`text-sm ${muted}`}>Leave an internal note visible to admins only.</p>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              rows={4}
              placeholder="e.g. Needs receipt, awaiting vendor confirmation…"
              className={`${inputCls} resize-none`}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowNoteModal(false)} className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium ${darkMode ? 'border-gray-700 text-white hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-50'}`}>
                Cancel
              </button>
              <button onClick={() => { updateTx(noteTargetId, { note: noteText || undefined }); setShowNoteModal(false); }} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                Save Note
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Shared Modal Wrapper ─────────────────────────────────────────────────────

function Modal({ title, darkMode, onClose, children }: { title: string; darkMode: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Reusable Transaction Form ────────────────────────────────────────────────

interface FormData {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  account: string;
}

function TransactionForm({
  darkMode, inputCls, selectCls, labelCls, accounts,
  defaultValues, onSubmit, onCancel, submitLabel,
}: {
  darkMode: boolean;
  inputCls: string;
  selectCls: string;
  labelCls: string;
  accounts: string[];
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<FormData>({
    date: defaultValues?.date ?? new Date().toISOString().split('T')[0],
    description: defaultValues?.description ?? '',
    category: defaultValues?.category ?? '',
    amount: defaultValues?.amount ?? 0,
    type: defaultValues?.type ?? 'expense',
    account: defaultValues?.account ?? 'Main Account',
  });

  const set = (k: keyof FormData, v: string | number) => setForm(prev => ({ ...prev, [k]: v }));

  const PRESET_CATEGORIES = ['Revenue', 'Payroll', 'Software', 'Marketing', 'Rent', 'Utilities', 'Travel', 'Meals', 'Insurance', 'Operations', 'Refunds', 'Transfer', 'Miscellaneous'];
  const ACCOUNTS = accounts.length ? accounts : ['Main Account', 'Ops Account', 'Payroll', 'Marketing'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value as any)} className={selectCls}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Client Invoice – Acme Corp" className={inputCls} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} className={selectCls}>
            <option value="">Select…</option>
            {PRESET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Account</label>
          <select value={form.account} onChange={e => set('account', e.target.value)} className={selectCls}>
            {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Amount ($)</label>
        <input type="number" value={form.amount || ''} onChange={e => set('amount', parseFloat(e.target.value) || 0)} placeholder="0.00" step="0.01" min="0" className={inputCls} required />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium ${darkMode ? 'border-gray-700 text-white hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-50'}`}>
          Cancel
        </button>
        <button
          type="button"
          onClick={() => { if (form.description && form.category && form.amount > 0) onSubmit(form); }}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
