import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Insights from './components/Insights';

function App() {
  const { fetchTransactions, darkMode, sidebarOpen } = useStore();
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'insights':
        return <Insights />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="flex">
        {sidebarOpen && (
          <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        )}

        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar />

          <main className="flex-1 p-4 lg:p-6">
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
