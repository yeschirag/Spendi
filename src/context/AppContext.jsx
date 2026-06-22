import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [loadingData, setLoadingData] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [expensesData, friendsData, aggregatedBalances, categoriesData, groupsData] = await Promise.all([
        db.getExpenses(),
        db.getFriendsAndBalances(),
        db.getAggregatedBalances(),
        db.getCategories(),
        db.getGroups()
      ]);
      setExpenses(expensesData || []);
      
      const friendsList = (friendsData || []).map(f => f.name);
      setFriends(friendsList);
      
      setBalances(aggregatedBalances || { youOwe: [], owesYou: [] });
      setCategories(categoriesData || []);
      setGroups(groupsData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoadingData(true);
      loadData().finally(() => setLoadingData(false));
    } else {
      setFriends([]);
      setExpenses([]);
      setBalances({});
      setCategories([]);
      setGroups([]);
      setLoadingData(false);
    }
  }, [user, loadData]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addFriend = async (name) => {
    // Deprecated for Phase 1/2. Handled by FriendContext.
    console.warn("Legacy addFriend called");
    return false;
  };

  const addExpense = async (expenseData) => {
    if (!user) return;
    try {
      await db.addExpense(expenseData);
      await loadData();
    } catch (err) {
      console.error("Failed to save expense", err);
    }
  };

  const editExpense = async (id, updates) => {
    if (!user) return;
    try {
      await db.updateExpense(id, updates);
      await loadData();
    } catch (err) {
      console.error("Failed to update expense", err);
    }
  };

  const removeExpense = async (id) => {
    if (!user) return;
    try {
      await db.deleteExpense(id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete expense", err);
    }
  };

  const value = {
    user,
    friends,
    expenses,
    balances,
    categories,
    groups,
    theme,
    toggleTheme,
    addFriend,
    addExpense,
    editExpense,
    removeExpense,
    refreshData: loadData,
    loadingData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
