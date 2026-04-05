import type { Transaction } from '../lib/database.types';
import type { TimeRange } from '../store/useStore';

export const calculateTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
};

export const calculateTotalExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
};

export const calculateBalance = (transactions: Transaction[]): number => {
  return calculateTotalIncome(transactions) - calculateTotalExpenses(transactions);
};

export const calculateSavingsRate = (transactions: Transaction[]): number => {
  const income = calculateTotalIncome(transactions);
  if (income === 0) return 0;
  const expenses = calculateTotalExpenses(transactions);
  return ((income - expenses) / income) * 100;
};

export const getExpensesByCategory = (transactions: Transaction[]) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const categoryMap = new Map<string, number>();

  expenses.forEach(t => {
    const current = categoryMap.get(t.category) || 0;
    categoryMap.set(t.category, current + Number(t.amount));
  });

  return Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const getBalanceOverTime = (transactions: Transaction[], range: TimeRange) => {
  const sorted = [...transactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const now = new Date();
  const startDate = new Date();

  if (range === 'week') {
    startDate.setDate(now.getDate() - 7);
  } else if (range === 'month') {
    startDate.setMonth(now.getMonth() - 1);
  } else {
    startDate.setFullYear(now.getFullYear() - 1);
  }

  const filtered = sorted.filter(t => new Date(t.date) >= startDate);

  const balanceMap = new Map<string, number>();
  let runningBalance = 0;

  filtered.forEach(t => {
    const dateKey = t.date;
    const amount = t.type === 'income' ? Number(t.amount) : -Number(t.amount);
    runningBalance += amount;
    balanceMap.set(dateKey, runningBalance);
  });

  return Array.from(balanceMap.entries())
    .map(([date, balance]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: Math.round(balance * 100) / 100
    }));
};

export const getHighestSpendingCategory = (transactions: Transaction[]): string => {
  const categories = getExpensesByCategory(transactions);
  return categories.length > 0 ? categories[0].name : 'N/A';
};

export const getAverageDailySpending = (transactions: Transaction[]): number => {
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) return 0;

  const dates = [...new Set(expenses.map(t => t.date))];
  const totalExpenses = calculateTotalExpenses(transactions);

  return dates.length > 0 ? totalExpenses / dates.length : 0;
};

export const getMonthlyComparison = (transactions: Transaction[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonth = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const lastMonth = transactions.filter(t => {
    const date = new Date(t.date);
    const lastMonthDate = new Date(currentYear, currentMonth - 1);
    return date.getMonth() === lastMonthDate.getMonth() &&
           date.getFullYear() === lastMonthDate.getFullYear();
  });

  const thisMonthExpenses = calculateTotalExpenses(thisMonth);
  const lastMonthExpenses = calculateTotalExpenses(lastMonth);

  if (lastMonthExpenses === 0) return { change: 0, increased: false };

  const change = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
  return {
    change: Math.abs(change),
    increased: change > 0
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const exportToCSV = (transactions: Transaction[]): void => {
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Type'];
  const rows = transactions.map(t => [
    t.date,
    t.description,
    t.category,
    t.amount.toString(),
    t.type
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportToJSON = (transactions: Transaction[]): void => {
  const json = JSON.stringify(transactions, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
};
