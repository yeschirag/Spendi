import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import * as db from '../services/db';

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [friends, setFriends] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [theme, setTheme] = useState('dark');
  const [loadingData, setLoadingData] = useState(true);

  // Fetch data when user logs in
  useEffect(() => {
    if (user) {
      setLoadingData(true);
      Promise.all([
        db.getExpenses(),
        db.getFriendsAndBalances()
      ]).then(([expensesData, friendsData]) => {
        setExpenses(expensesData || []);
        
        const friendsList = (friendsData || []).map(f => f.name);
        setFriends(friendsList);
        
        // Recalculate balances based on fetched expenses
        let initialBalances = {};
        friendsList.forEach(f => initialBalances[f] = 0);
        
        if (expensesData) {
          expensesData.forEach(exp => {
            initialBalances = calculateBalances(exp, initialBalances);
          });
        }
        setBalances(initialBalances);
      }).catch(err => {
        console.error("Error fetching data:", err);
      }).finally(() => {
        setLoadingData(false);
      });
    } else {
      setFriends([]);
      setExpenses([]);
      setBalances({});
      setLoadingData(false);
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addFriend = async (name) => {
    if (friends.includes(name) || name.toLowerCase() === 'you') return false;
    
    if (user) {
      try {
        const { error } = await supabase.from('friends').insert([{ name, user_id: user.id }]);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to add friend to db", err);
        return false;
      }
    }
    
    setFriends([...friends, name]);
    setBalances({ ...balances, [name]: 0 });
    return true;
  };

  const calculateBalances = (expense, currentBalances) => {
    const newBalances = { ...currentBalances };
    const splitAmount = expense.amount / expense.splitWith.length;

    expense.splitWith.forEach((person) => {
      if (person !== expense.paidBy) {
        if (expense.paidBy === "You") {
          newBalances[person] = (newBalances[person] || 0) + splitAmount;
        } else if (person === "You") {
          newBalances[expense.paidBy] = (newBalances[expense.paidBy] || 0) - splitAmount;
        }
      }
    });

    if (expense.paidBy !== "You" && expense.splitWith.includes("You")) {
      newBalances[expense.paidBy] = (newBalances[expense.paidBy] || 0) - splitAmount;
    }
    
    return newBalances;
  };

  const addExpense = async (expenseData) => {
    const newExpense = {
      user_id: user ? user.id : null,
      ...expenseData,
    };
    
    if (user) {
      try {
        const data = await db.addExpense(newExpense);
        newExpense.id = data.id;
      } catch (err) {
        console.error("Failed to save expense", err);
        return;
      }
    } else {
      newExpense.id = Date.now().toString();
    }
    
    setBalances(prev => calculateBalances(newExpense, prev));
    setExpenses(prev => [newExpense, ...prev]);
  };

  const value = {
    user,
    friends,
    expenses,
    balances,
    theme,
    toggleTheme,
    addFriend,
    addExpense,
    loadingData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
