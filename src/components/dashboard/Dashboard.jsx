import React, { useState, useEffect } from 'react';
import { StatCard } from './StatCard';
import { useAppContext } from '../../context/AppContext';
import { Wallet, TrendingDown, TrendingUp, Users, User, ArrowRight, Plus, Receipt } from 'lucide-react';
import { CategoryIcon } from '../../utils/icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export const Dashboard = () => {
  const { expenses, balances, friends, user } = useAppContext();
  const navigate = useNavigate();

  const [greetingIndex, setGreetingIndex] = useState(0);
  const greetings = [
    "Welcome",
    "नमस्ते",
    "வணக்கம்",
    "Hola",
    "Bonjour"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  const youOweList = balances?.youOwe || [];
  const owesYouList = balances?.owesYou || [];

  const youOwe = youOweList.reduce((sum, item) => sum + item.amount, 0);
  const othersOwe = owesYouList.reduce((sum, item) => sum + item.amount, 0);

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
          '#FFFFFA', '#FF312E', '#515052', '#333138', '#000103'
        ] : ['#333138'],
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
        backgroundColor: '#FFFFFA',
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
      y: { grid: { color: 'rgba(255,255,250,0.04)' }, border: { display: false }, ticks: { display: false } }
    }
  };

  // Extract first name from Google metadata or email
  const fullName = user?.user_metadata?.full_name || '';
  const firstName = fullName ? fullName.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'User');

  return (
    <div className="flex-1 p-5 pt-6 md:p-16 flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full bg-transparent">
      {/* Header Area */}
      <div className="mb-4 md:mb-8">
        <div className="grid w-full" style={{ gridTemplateAreas: "'greeting'" }}>
          <AnimatePresence>
            <motion.h1
              key={greetingIndex}
              initial={{ y: 30, opacity: 0, filter: 'blur(8px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: -30, opacity: 0, filter: 'blur(8px)' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-normal tracking-tight drop-shadow-2xl pb-2 leading-[1.05] w-full break-words whitespace-normal"
              style={{ fontFamily: "'Instrument Serif', serif", gridArea: 'greeting' }}
            >
              {greetings[greetingIndex]}, {firstName}.
            </motion.h1>
          </AnimatePresence>
        </div>
        <p className="text-white/50 mt-[3rem] sm:mt-[4.5rem] md:mt-[6rem] text-sm md:text-lg font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>Here is your financial state.</p>
      </div>

      {/* Stats */}
      <div className="tour-balances grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 mt-4 md:mt-8">
        <div className="glass-card p-5 md:p-8 group">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Spending Overview.</h3>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-graphite/40 text-white/70 rounded-full text-xs font-medium tracking-wide uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>This Month</span>
          </div>
          <div className="relative h-[240px] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-500">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
        
        <div className="glass-card p-5 md:p-8 group">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>By Category.</h3>
          </div>
          <div className="relative h-[240px] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-500">
            {categoryData.length > 0 ? (
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'rgba(255,255,250,0.7)', font: { family: "'Inter', sans-serif" } } } }, cutout: '80%' }} />
            ) : (
              <div className="py-12 text-center w-full">
                <p className="text-sm text-white/45 tracking-wide uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>No expenses to chart</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 mt-6 md:mt-12">
        <div className="glass-card p-5 md:p-8">
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
              ) : youOweList.length === 0 && owesYouList.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/40 mb-6 text-sm font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>All settled up with your friends.</p>
                  <button className="border-b border-white/30 hover:border-white text-white/80 hover:text-white pb-1 text-sm transition-colors" onClick={() => navigate('/add-expense')}>Log an expense</button>
                </div>
              ) : (
                <>
                  {owesYouList.map((item) => (
                    <div key={`owes-${item.name}`} className="flex items-center justify-between py-4 border-b border-border/40 group cursor-pointer" onClick={() => navigate('/friends')}>
                      <span className="font-medium text-brand-porcelain group-hover:text-white transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {item.name} owes you
                      </span>
                      <span className="text-2xl text-white font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>₹{item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  {youOweList.map((item) => (
                    <div key={`owe-${item.name}`} className="flex items-center justify-between py-4 border-b border-border/40 group cursor-pointer" onClick={() => navigate('/friends')}>
                      <span className="font-medium text-brand-cinnabar group-hover:text-[#ff4e4c] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                        You owe {item.name}
                      </span>
                      <span className="text-2xl text-white font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>₹{item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card p-5 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Recent Expenses.</h2>
            <button className="text-xs uppercase tracking-wider font-medium text-white/40 hover:text-white transition-colors" style={{ fontFamily: "'Inter', sans-serif" }} onClick={() => navigate('/history')}>View All</button>
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
                    <div key={expense.id} onClick={() => navigate(`/edit-expense/${expense.id}`)} className="relative group flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 mb-3 glass-card hover:border-brand-porcelain/20 transition-all duration-300 cursor-pointer shadow-lg w-full max-w-full overflow-hidden">
                      <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0 md:pr-8 w-full">
                        <div className="hidden sm:flex w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-gradient-to-br from-brand-graphite/40 to-brand-graphite/10 items-center justify-center border border-border shadow-inner">
                          <CategoryIcon slug={expense.category} className="text-white/80 w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                          <h4 className="text-lg md:text-xl text-white font-medium mb-1 tracking-tight truncate w-full" style={{ fontFamily: "'Inter', sans-serif" }}>{expense.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-xs text-white/50 font-light tracking-wide uppercase">
                            <span className="whitespace-nowrap">{new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20 shrink-0"></span>
                            <span className="capitalize whitespace-nowrap">{expense.category}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20 shrink-0"></span>
                            <span className="text-white/70 truncate max-w-[80px] sm:max-w-none">By {expense.paidBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 mt-3 md:mt-0 w-full md:w-auto">
                        <div className="text-2xl md:text-3xl text-white font-normal truncate" style={{ fontFamily: "'Instrument Serif', serif" }}>₹{expense.amount.toFixed(0)}</div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/edit-expense/${expense.id}`); }} 
                          className="md:opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 md:p-2.5 bg-brand-graphite/30 hover:bg-brand-graphite/60 border border-border shrink-0"
                          title="Edit Expense"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                      </div>
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
