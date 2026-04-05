import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  X,
  DollarSign
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { sidebarOpen, toggleSidebar, darkMode } = useStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
  ];

  if (!sidebarOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
        onClick={toggleSidebar}
      />

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-30 transition-transform duration-300 ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        } border-r flex flex-col`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              FinTrack
            </h1>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700'
                    : darkMode
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        
      </aside>
    </>
  );
}
