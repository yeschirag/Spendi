import { supabase } from '../lib/supabase';

// Helper to get friend's display name from profile
const getProfileName = (profile) => {
  if (!profile) return 'Unknown User';
  return profile.display_name || profile.full_name || profile.email.split('@')[0];
};

/**
 * Fetch all expenses for the current user and adapt to legacy format
 */
export const getExpenses = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      category:categories(name),
      expense_participants (
        user_id,
        amount_paid,
        amount_owed,
        profiles (id, full_name, display_name, email)
      )
    `)
    .eq('is_deleted', false)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
  
  // Transform relational data back to flat format for legacy AppContext
  return data.map(exp => {
    let paidBy = 'You';
    const splitWith = [];
    
    if (exp.expense_participants) {
      exp.expense_participants.forEach(p => {
        const isMe = p.user_id === user.id;
        const name = isMe ? 'You' : getProfileName(p.profiles);
        
        // If they are part of the split
        if (p.amount_owed > 0 || p.amount_paid > 0) {
          splitWith.push(name);
        }
        
        // Who paid?
        if (p.amount_paid > 0) {
          paidBy = name;
        }
      });
    }

    return {
      ...exp,
      category: exp.category?.name || 'Other',
      paidBy,
      splitWith
    };
  });
};

export const addExpense = async (expenseData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { title, amount, date, category, paidBy, splitWith } = expenseData;

  // 1. Find category ID (or default to Other)
  let categoryId = null;
  const { data: catData } = await supabase.from('categories').select('id').ilike('name', category).limit(1).maybeSingle();
  if (catData) {
    categoryId = catData.id;
  } else {
    // Fallback to 'other'
    const { data: otherCat } = await supabase.from('categories').select('id').eq('slug', 'other').maybeSingle();
    categoryId = otherCat?.id;
  }

  // 2. Insert core expense
  const { data: expense, error: expError } = await supabase
    .from('expenses')
    .insert([{ 
      title, 
      amount, 
      date, 
      category_id: categoryId, 
      created_by: user.id,
      split_type: 'equal' 
    }])
    .select()
    .single();

  if (expError) {
    console.error('Error adding expense:', expError);
    throw expError;
  }

  // 3. Insert participants
  // Note: To map string names back to user_ids, we need to lookup profiles.
  // For this adapter, if we can't find the friend, we skip them (legacy limitation).
  if (splitWith && splitWith.length > 0) {
    const splitAmount = amount / splitWith.length;
    
    // Get all profiles of friends
    const { data: friendsData } = await supabase
      .from('friendships')
      .select('requester:profiles!requester_id(id, full_name, display_name, email), addressee:profiles!addressee_id(id, full_name, display_name, email)')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    const knownFriends = {};
    friendsData?.forEach(f => {
      const friendProfile = f.requester.id === user.id ? f.addressee : f.requester;
      knownFriends[getProfileName(friendProfile).toLowerCase()] = friendProfile.id;
    });

    const splits = splitWith.map(friendName => {
      const isMe = friendName === 'You';
      const friendId = isMe ? user.id : knownFriends[friendName.toLowerCase()];
      
      if (!friendId) return null; // Can't add non-existent user in new strict schema

      return {
        expense_id: expense.id,
        user_id: friendId,
        amount_owed: splitAmount,
        amount_paid: friendName === paidBy ? amount : 0
      };
    }).filter(Boolean);

    if (splits.length > 0) {
      const { error: splitError } = await supabase.from('expense_participants').insert(splits);
      if (splitError) {
        console.error('Error adding splits:', splitError);
        throw splitError;
      }
    }
  }

  return { ...expense, category, paidBy, splitWith };
};

export const updateExpense = async (id, updates) => {
  // Limited adapter: only updates title/amount/date
  const { data, error } = await supabase
    .from('expenses')
    .update({ title: updates.title, amount: updates.amount, date: updates.date })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
  return data;
};

export const deleteExpense = async (id) => {
  // Soft delete in new schema
  const { error } = await supabase
    .from('expenses')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
  return true;
};

export const getFriendsAndBalances = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id,
      status,
      requester:profiles!requester_id(id, full_name, display_name, email),
      addressee:profiles!addressee_id(id, full_name, display_name, email)
    `)
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  if (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
  
  return data.map(f => {
    const friendProfile = f.requester.id === user.id ? f.addressee : f.requester;
    return { name: getProfileName(friendProfile), id: friendProfile.id };
  });
};

export const addFriend = async (name) => {
  // The new schema requires finding a user by email, not arbitrarily creating a string-based friend.
  // So adding a friend by name alone won't work in the new strict architecture.
  // We throw a clear error to migrate the UI later.
  throw new Error("Legacy addFriend not supported. Please use email-based friend search.");
};

export const removeFriend = async (name) => {
  throw new Error("Legacy removeFriend not supported. Requires ID.");
};
