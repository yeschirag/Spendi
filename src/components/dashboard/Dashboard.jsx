import React from 'react';
import { StatCard } from './StatCard';
import { useAppContext } from '../../context/AppContext';
import { Wallet, TrendingDown, TrendingUp, Users, User, ArrowRight, Plus, Receipt } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export const Dashboard = () => {
  const { expenses, balances, friends, user } = useAppContext();
  const navigate = useNavigate();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const personalExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expense.paidBy === "You" &&
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    })
    .reduce((total, expense) => total + expense.amount, 0);

  let youOwe = 0;
  let othersOwe = 0;

  Object.values(balances).forEach((balance) => {
    if (balance > 0) {
      othersOwe += balance;
    } else if (balance < 0) {
      youOwe += Math.abs(balance);
    }
  });

  // Chart Data Preparation
  const expensesByCategory = expenses.reduce((acc, exp) => {
    if (exp.paidBy === "You") {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    }
    return acc;
  }, {});

  const categoryLabels = Object.keys(expensesByCategory);
  const categoryData = Object.values(expensesByCategory);

  const doughnutData = {
    labels: categoryLabels.length ? categoryLabels : ['No Data'],
    datasets: [
      {
        data: categoryData.length ? categoryData : [1],
        backgroundColor: categoryData.length ? [
          '#ffffff', '#cccccc', '#999999', '#666666', '#333333', '#111111'
        ] : ['#111111'],
        borderWidth: 0,
      },
    ],
  };

  // Weekly Spending Data
  const weeklyData = [0, 0, 0, 0, 0, 0, 0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  expenses.forEach(exp => {
    if (exp.paidBy === "You") {
      const expDate = new Date(exp.date);
      expDate.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(today - expDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) {
        // Today is index 6, yesterday is 5, etc.
        const index = 6 - diffDays;
        weeklyData[index] += exp.amount;
      }
    }
  });

  const weekLabels = [...Array(7)].map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });

  const barData = {
    labels: weekLabels,
    datasets: [
      {
        label: 'Spending',
        data: weeklyData,
        backgroundColor: '#ffffff',
        borderRadius: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false }, ticks: { display: false } }
    }
  };

  // Extract first name from Google metadata or email
  const fullName = user?.user_metadata?.full_name || '';
  const firstName = fullName ? fullName.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'User');

  return (
    <div className="flex-1 p-8 md:p-16 flex flex-col gap-8 max-w-7xl mx-auto w-full bg-transparent">
      {/* Header Area */}
      <div className="mb-8">
        <h1 className="text-6xl md:text-8xl text-white font-normal tracking-tight drop-shadow-2xl" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Welcome back, {firstName}.
        </h1>
        <p className="text-white/50 mt-4 text-lg font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>Here is your financial state.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          color="blue"
          title="Personal Expenses"
          value={`₹${personalExpenses.toFixed(0)}`}
          change="this month"
          isPositive={false}
          icon={<Wallet size={24} />}
        />
        <StatCard
          color="red"
          title="You Owe"
          value={`₹${youOwe.toFixed(0)}`}
          icon={<TrendingDown size={24} />}
        />
        <StatCard
          color="green"
          title="Others Owe You"
          value={`₹${othersOwe.toFixed(0)}`}
          icon={<TrendingUp size={24} />}
        />
        <StatCard
          color="purple"
          title="Friends"
          value={friends.length}
          icon={<Users size={24} />}
        />
      </div>

      {/* Dashboard Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
        <div className="border-t border-white/5 pt-8 group">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Spending Overview.</h3>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 text-white/50 rounded-full text-xs font-medium tracking-wide uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>This Month</span>
          </div>
          <div className="relative h-[240px] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-500">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 group">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>By Category.</h3>
          </div>
          <div className="relative h-[240px] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-500">
            {categoryData.length > 0 ? (
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.5)', font: { family: "'Inter', sans-serif" } } } }, cutout: '80%' }} />
            ) : (
              <div className="py-12 text-center w-full">
                <p className="text-sm text-white/40 tracking-wide uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>No expenses to chart</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
        <div className="border-t border-white/10 pt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Friend Balances.</h2>
            <button className="text-xs uppercase tracking-wider font-medium text-white/40 hover:text-white transition-colors" style={{ fontFamily: "'Inter', sans-serif" }} onClick={() => navigate('/friends')}>Manage</button>
          </div>
          <div>
            <div className="flex flex-col gap-2">
              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/40 mb-6 text-sm font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>No friends added yet. Track your shared expenses.</p>
                  <button className="border-b border-white/30 hover:border-white text-white/80 hover:text-white pb-1 text-sm transition-colors" onClick={() => navigate('/friends')}>Add a friend</button>
                </div>
              ) : (
                Object.entries(balances)
                  .filter(([_, balance]) => balance !== 0)
                  .map(([friend, balance]) => (
                    <div key={friend} className="flex items-center justify-between py-4 border-b border-white/10 group cursor-pointer" onClick={() => navigate('/friends')}>
                      <span className="font-light text-white/80 group-hover:text-white transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {balance > 0 ? `${friend} owes you` : `You owe ${friend}`}
                      </span>
                      <span className="text-2xl text-white font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>₹{Math.abs(balance).toFixed(2)}</span>
                    </div>
                  ))
              )}
              {friends.length > 0 && Object.values(balances).every(b => b === 0) && (
                <p className="text-left py-6 text-white/40 text-sm font-light italic" style={{ fontFamily: "'Inter', sans-serif" }}>All settled up.</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Recent Expenses.</h2>
            <button className="text-xs uppercase tracking-wider font-medium text-white/40 hover:text-white transition-colors" style={{ fontFamily: "'Inter', sans-serif" }} onClick={() => navigate('/add-expense')}>View All</button>
          </div>
          <div>
            <div className="flex flex-col gap-2">
              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/40 mb-6 text-sm font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>No expenses recorded yet. Start tracking.</p>
                  <button className="border-b border-white/30 hover:border-white text-white/80 hover:text-white pb-1 text-sm transition-colors" onClick={() => navigate('/add-expense')}>Log an expense</button>
                </div>
              ) : (
                expenses.slice(0, 10).map((expense) => {
                  return (
                    <div key={expense.id} className="flex flex-col sm:flex-row sm:items-end justify-between py-4 border-b border-white/5 group cursor-pointer" onClick={() => onOpenModal('editExpense', expense.id)}>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg text-white/80 group-hover:text-white transition-colors truncate font-light" style={{ fontFamily: "'Inter', sans-serif" }}>{expense.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/40 font-light tracking-wide uppercase">
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                          <span className="text-white/20">|</span>
                          <span>{expense.category}</span>
                          <span className="text-white/20">|</span>
                          <span>Paid by {expense.paidBy}</span>
                        </div>
                      </div>
                      <div className="text-3xl text-white font-normal mt-2 sm:mt-0" style={{ fontFamily: "'Instrument Serif', serif" }}>₹{expense.amount.toFixed(2)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
