import { Menu, Moon, Sun, User } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const { darkMode, toggleDarkMode, userRole, setUserRole, toggleSidebar } = useStore();

  return (
    <header
      className={`sticky top-0 z-10 border-b ${
        darkMode
          ? 'bg-gray-900 border-gray-800'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <User className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as 'admin' | 'viewer')}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
