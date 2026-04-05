
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ShoppingBag,
  AlertCircle,
  Wallet,
  PiggyBank,
} from 'lucide-react';
import { useStore } from '../store/useStore';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockInsights = [
  {
    icon: ShoppingBag,
    title: 'Highest Spending Category',
    value: 'Housing',
    description: 'Your top expense category',
    color: 'red',
  },
  {
    icon: Calendar,
    title: 'Average Daily Spending',
    value: '₹3,240',
    description: 'Average amount spent per day',
    color: 'blue',
  },
  {
    icon: TrendingDown,
    title: 'Monthly Expense Change',
    value: '−6.4%',
    description: 'Decrease from last month',
    color: 'green',
  },
  {
    icon: DollarSign,
    title: 'Savings Rate',
    value: '24.5%',
    description: 'Percentage of income saved',
    color: 'green',
  },
  {
    icon: Wallet,
    title: 'Total Income (Apr)',
    value: '₹1,20,000',
    description: 'Gross monthly income',
    color: 'purple',
  },
  {
    icon: PiggyBank,
    title: 'Net Savings (Apr)',
    value: '₹29,400',
    description: 'Income minus all expenses',
    color: 'purple',
  },
];

const mockRecommendations = [
  {
    type: 'success',
    title: 'Great Savings Rate',
    message:
      "You're saving over 24% of your income this month. Excellent discipline — keep it up!",
  },
  {
    type: 'info',
    title: 'Category Concentration',
    message:
      '38.2% of your expenses are in Housing. This is within a healthy range, but worth monitoring.',
  },
  {
    type: 'warning',
    title: 'Dining Out Spike',
    message:
      'Dining expenses rose 18% vs last month. Consider meal-prepping to bring this down.',
  },
  {
    type: 'success',
    title: 'Debt Repayment On Track',
    message:
      'Your EMI-to-income ratio is 22%, well below the 40% danger zone. Great financial health!',
  },
];

const mockExpensesByCategory = [
  { name: 'Housing', value: 35000 },
  { name: 'Food & Groceries', value: 14500 },
  { name: 'Transportation', value: 9800 },
  { name: 'Utilities', value: 7200 },
  { name: 'Dining Out', value: 6400 },
  { name: 'Healthcare', value: 5100 },
  { name: 'Entertainment', value: 4300 },
  { name: 'Education', value: 3800 },
  { name: 'Clothing', value: 2600 },
  { name: 'Miscellaneous', value: 1900 },
];

const totalExpenses = mockExpensesByCategory.reduce((s, c) => s + c.value, 0);

// ─── Component ────────────────────────────────────────────────────────────────
export default function Insights() {
  const { darkMode } = useStore();

  const cardBase = darkMode
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200';

  const labelColor = darkMode ? 'text-gray-400' : 'text-gray-600';
  const titleColor = darkMode ? 'text-white' : 'text-gray-900';
  const subColor = darkMode ? 'text-gray-500' : 'text-gray-500';

  const colorMap: Record<string, { bg: string; icon: string }> = {
    blue:   { bg: darkMode ? 'bg-blue-900'   : 'bg-blue-100',   icon: darkMode ? 'text-blue-400'   : 'text-blue-600' },
    green:  { bg: darkMode ? 'bg-green-900'  : 'bg-green-100',  icon: darkMode ? 'text-green-400'  : 'text-green-600' },
    red:    { bg: darkMode ? 'bg-red-900'    : 'bg-red-100',    icon: darkMode ? 'text-red-400'    : 'text-red-600' },
    purple: { bg: darkMode ? 'bg-purple-900' : 'bg-purple-100', icon: darkMode ? 'text-purple-400' : 'text-purple-600' },
  };

  const recStyle = (type: string) => {
    if (type === 'warning')
      return darkMode
        ? 'bg-red-900/20 border-red-800'
        : 'bg-red-50 border-red-200';
    if (type === 'success')
      return darkMode
        ? 'bg-green-900/20 border-green-800'
        : 'bg-green-50 border-green-200';
    return darkMode
      ? 'bg-blue-900/20 border-blue-800'
      : 'bg-blue-50 border-blue-200';
  };

  const recTitleColor = (type: string) => {
    if (type === 'warning') return darkMode ? 'text-red-400'   : 'text-red-900';
    if (type === 'success') return darkMode ? 'text-green-400' : 'text-green-900';
    return darkMode ? 'text-blue-400' : 'text-blue-900';
  };

  const recTextColor = (type: string) => {
    if (type === 'warning') return darkMode ? 'text-red-300'   : 'text-red-800';
    if (type === 'success') return darkMode ? 'text-green-300' : 'text-green-800';
    return darkMode ? 'text-blue-300' : 'text-blue-800';
  };

  const recDotColor = (type: string) => {
    if (type === 'warning') return 'bg-red-600';
    if (type === 'success') return 'bg-green-600';
    return 'bg-blue-600';
  };

  // Progress bar colours cycle for variety
  const barColors = [
    'bg-blue-600', 'bg-indigo-500', 'bg-violet-500', 'bg-pink-500',
    'bg-orange-500', 'bg-teal-500', 'bg-cyan-500', 'bg-rose-500',
    'bg-lime-500', 'bg-amber-500',
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${titleColor}`}>Financial Insights</h2>
        <p className={`text-sm ${labelColor}`}>
          Automated analysis of your financial activity &mdash; April 2025
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {mockInsights.map((insight) => {
          const Icon = insight.icon;
          const colors = colorMap[insight.color] ?? colorMap.blue;
          return (
            <div
              key={insight.title}
              className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${cardBase}`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colors.bg}`}>
                <Icon className={`w-6 h-6 ${colors.icon}`} />
              </div>
              <p className={`text-sm font-medium mb-1 ${labelColor}`}>{insight.title}</p>
              <p className={`text-2xl font-bold mb-2 ${titleColor}`}>{insight.value}</p>
              <p className={`text-xs ${subColor}`}>{insight.description}</p>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className={`p-6 rounded-xl border ${cardBase}`}>
        <h3 className={`text-lg font-semibold mb-4 ${titleColor}`}>Recommendations</h3>
        <div className="space-y-4">
          {mockRecommendations.map((rec, i) => (
            <div key={i} className={`p-4 rounded-lg border ${recStyle(rec.type)}`}>
              <div className="flex items-start space-x-3">
                <div className={`mt-0.5 p-1 rounded ${recDotColor(rec.type)}`}>
                  {rec.type === 'success' ? (
                    <TrendingUp className="w-4 h-4 text-white" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${recTitleColor(rec.type)}`}>{rec.title}</h4>
                  <p className={`text-sm ${recTextColor(rec.type)}`}>{rec.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spending Breakdown */}
      <div className={`p-6 rounded-xl border ${cardBase}`}>
        <h3 className={`text-lg font-semibold mb-4 ${titleColor}`}>Spending Breakdown</h3>
        <div className="space-y-3">
          {mockExpensesByCategory.map((category, index) => {
            const pct = ((category.value / totalExpenses) * 100).toFixed(1);
            const bar = barColors[index % barColors.length];
            return (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {category.name}
                  </span>
                  <span className={`text-sm ${labelColor}`}>
                    ₹{category.value.toLocaleString('en-IN')} ({pct}%)
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full transition-all duration-500 ${bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary row */}
        <div className={`mt-5 pt-4 border-t flex justify-between text-sm font-medium ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'}`}>
          <span>Total Expenses (Apr)</span>
          <span>₹{totalExpenses.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
    </div>
  );
}
