// import {
//   LayoutDashboard,
//   Receipt,
//   TrendingUp,
//   X,
//   DollarSign
// } from 'lucide-react';
// import { useStore } from '../store/useStore';

// interface SidebarProps {
//   currentPage: string;
//   onNavigate: (page: string) => void;
// }

// export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
//   const { sidebarOpen, toggleSidebar, darkMode } = useStore();

//   const navItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//     { id: 'transactions', label: 'Transactions', icon: Receipt },
//     { id: 'insights', label: 'Insights', icon: TrendingUp },
//   ];

//   if (!sidebarOpen) return null;

//   return (
//     <>
//       <div
//         className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
//         onClick={toggleSidebar}
//       />

//       <aside
//         className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-30 transition-transform duration-300 ${
//           darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
//         } border-r flex flex-col`}
//       >
//         <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
//           <div className="flex items-center space-x-2">
//             <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
//               <DollarSign className="w-5 h-5 text-white" />
//             </div>
//             <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
//               FinTrack
//             </h1>
//           </div>
//           <button
//             onClick={toggleSidebar}
//             className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//           >
//             <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
//           </button>
//         </div>

//         <nav className="flex-1 p-4 space-y-1">
//           {navItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = currentPage === item.id;

//             return (
//               <button
//                 key={item.id}
//                 onClick={() => {
//                   onNavigate(item.id);
//                   if (window.innerWidth < 1024) {
//                     toggleSidebar();
//                   }
//                 }}
//                 className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
//                   isActive
//                     ? darkMode
//                       ? 'bg-blue-600 text-white'
//                       : 'bg-blue-50 text-blue-700'
//                     : darkMode
//                     ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
//                     : 'text-gray-700 hover:bg-gray-50'
//                 }`}
//               >
//                 <Icon className="w-5 h-5" />
//                 <span className="font-medium">{item.label}</span>
//               </button>
//             );
//           })}
//         </nav>

        
//       </aside>
//     </>
//   );
// }

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
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-30 transition-all duration-300 ease-in-out ${
          darkMode
            ? 'bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800'
            : 'bg-gradient-to-b from-white to-gray-50 border-gray-200'
        } border-r flex flex-col`}
      >
        {/* Header */}
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

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {/* Section Title */}
          <p className={`text-xs font-semibold uppercase px-4 mb-2 ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Main Menu
          </p>

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
                className={`relative w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                  isActive
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700'
                    : darkMode
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r-md" />
                )}

                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-2 border-t border-gray-200 dark:border-gray-800" />

        {/* User Profile Section */}
        <div className={`p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              N
            </div>
            <div>
              <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Naga Sreeja
              </p>
              
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
