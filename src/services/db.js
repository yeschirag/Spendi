import { supabase } from '../lib/supabase';

// Supabase Database Skeleton for Expenses and Friends

/**
 * Fetch all expenses for the current user
 */
export const getExpenses = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      expense_splits (*)
    `)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
  
  // Transform the relational data back to the flat format the frontend expects
  return data.map(exp => {
    let paidBy = 'You';
    const splitWith = [];
    
    if (exp.expense_splits) {
      exp.expense_splits.forEach(split => {
        splitWith.push(split.friend_name);
        if (split.amount_paid > 0) {
          paidBy = split.friend_name;
        }
      });
    }

    return {
      ...exp,
      paidBy,
      splitWith
    };
  });
};

export const addExpense = async (expenseData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { title, amount, date, category, paidBy, splitWith } = expenseData;

  // 1. Insert core expense
  const { data: expense, error: expError } = await supabase
    .from('expenses')
    .insert([{ title, amount, date, category, user_id: user.id }])
    .select()
    .single();

  if (expError) {
    console.error('Error adding expense:', expError);
    throw expError;
  }

  // 2. Insert splits
  if (splitWith && splitWith.length > 0) {
    const splitAmount = amount / splitWith.length;
    const splits = splitWith.map(friend => ({
      expense_id: expense.id,
      user_id: user.id,
      friend_name: friend,
      amount_owed: splitAmount,
      amount_paid: friend === paidBy ? amount : 0
    }));

    const { error: splitError } = await supabase
      .from('expense_splits')
      .insert(splits);

    if (splitError) {
      console.error('Error adding splits:', splitError);
      throw splitError;
    }
  }

  return { ...expense, paidBy, splitWith };
};

/**
 * Update an existing expense
 * @param {string} id 
 * @param {Object} updates 
 */
export const updateExpense = async (id, updates) => {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
  return data;
};

/**
 * Delete an expense
 * @param {string} id 
 */
export const deleteExpense = async (id) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
  return true;
};

/**
 * Fetch all friends / balances
 */
export const getFriendsAndBalances = async () => {
  const { data, error } = await supabase
    .from('friends')
    .select('*');

  if (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
  return data;
};

export const addFriend = async (name) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('friends')
    .insert([{ name, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error('Error adding friend:', error);
    throw error;
  }
  return data;
};

export const removeFriend = async (name) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from('friends')
    .delete()
    .match({ name: name, user_id: user.id });

  if (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
  return true;
};
