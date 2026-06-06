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
      category:categories(name, slug),
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
    const splitsData = {};
    
    if (exp.expense_participants) {
      exp.expense_participants.forEach(p => {
        const isMe = p.user_id === user.id;
        const name = isMe ? 'You' : getProfileName(p.profiles);
        
        if (p.amount_owed > 0 || p.amount_paid > 0) {
          splitWith.push(name);
          splitsData[name] = p.amount_owed;
        }
        
        if (p.amount_paid > 0) {
          paidBy = name;
        }
      });
    }

    return {
      ...exp,
      category: exp.category?.slug || 'other',
      categoryName: exp.category?.name || 'Other',
      paidBy,
      splitType: exp.split_type || 'equal',
      splitWith,
      splitsData
    };
  });
};

export const addExpense = async (expenseData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { title, amount, date, category, paidBy, splitWith, splitType = 'equal', splitsData = {} } = expenseData;

  let categoryId = null;
  const { data: catData } = await supabase.from('categories').select('id').eq('slug', category).limit(1).maybeSingle();
  if (catData) {
    categoryId = catData.id;
  } else {
    const { data: otherCat } = await supabase.from('categories').select('id').eq('slug', 'other').maybeSingle();
    categoryId = otherCat?.id;
  }

  const { data: expense, error: expError } = await supabase
    .from('expenses')
    .insert([{ 
      title, 
      amount, 
      date, 
      category_id: categoryId, 
      created_by: user.id,
      split_type: splitType 
    }])
    .select()
    .single();

  if (expError) throw expError;

  if (splitWith && splitWith.length > 0) {
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
      
      if (!friendId) return null;

      let amount_owed = 0;
      if (splitType === 'equal') {
         amount_owed = amount / splitWith.length;
      } else if (splitsData[friendName] !== undefined) {
         amount_owed = splitsData[friendName];
      }

      return {
        expense_id: expense.id,
        user_id: friendId,
        amount_owed,
        amount_paid: friendName === paidBy ? amount : 0
      };
    }).filter(Boolean);

    if (splits.length > 0) {
      const { error: splitError } = await supabase.from('expense_participants').insert(splits);
      if (splitError) throw splitError;
    }
  }

  return { ...expense, category, paidBy, splitWith };
};

export const updateExpense = async (id, updates) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { title, amount, date, category, paidBy, splitWith, splitType = 'equal', splitsData = {} } = updates;

  let categoryId = null;
  const { data: catData } = await supabase.from('categories').select('id').eq('slug', category).limit(1).maybeSingle();
  if (catData) {
    categoryId = catData.id;
  } else {
    const { data: otherCat } = await supabase.from('categories').select('id').eq('slug', 'other').maybeSingle();
    categoryId = otherCat?.id;
  }

  const { data: expense, error: expError } = await supabase
    .from('expenses')
    .update({ 
      title, 
      amount, 
      date, 
      category_id: categoryId,
      split_type: splitType
    })
    .eq('id', id)
    .select()
    .single();

  if (expError) throw expError;

  if (splitWith && splitWith.length > 0) {
    await supabase.from('expense_participants').delete().eq('expense_id', id);

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
      
      if (!friendId) return null;

      let amount_owed = 0;
      if (splitType === 'equal') {
         amount_owed = amount / splitWith.length;
      } else if (splitsData[friendName] !== undefined) {
         amount_owed = splitsData[friendName];
      }

      return {
        expense_id: id,
        user_id: friendId,
        amount_owed,
        amount_paid: friendName === paidBy ? amount : 0
      };
    }).filter(Boolean);

    if (splits.length > 0) {
      const { error: splitError } = await supabase.from('expense_participants').insert(splits);
      if (splitError) throw splitError;
    }
  }

  return { ...expense, category, paidBy, splitWith };
};

export const getAggregatedBalances = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { youOwe: [], owesYou: [] };

  const [balances, friendships] = await Promise.all([
    supabase.from('user_balances').select('*').or(`debtor_id.eq.${user.id},creditor_id.eq.${user.id}`),
    getFriendships()
  ]);

  if (balances.error) throw balances.error;

  const friendsMap = {};
  friendships.forEach(f => {
    if (f.status === 'accepted') {
       const p = f.requester_id === user.id ? f.addressee : f.requester;
       friendsMap[p.id] = getProfileName(p);
    }
  });

  const youOwe = [];
  const owesYou = [];

  balances.data.forEach(b => {
    if (b.debtor_id === user.id) {
       youOwe.push({ name: friendsMap[b.creditor_id] || 'Unknown', amount: b.net_balance });
    } else if (b.creditor_id === user.id) {
       owesYou.push({ name: friendsMap[b.debtor_id] || 'Unknown', amount: b.net_balance });
    }
  });

  return { youOwe, owesYou };
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

export const searchUsers = async (query) => {
  if (!query || query.trim().length < 2) return [];
  const { data, error } = await supabase.rpc('search_users', { search_term: query.trim() });
  if (error) {
    console.error('Error searching users:', error);
    throw error;
  }
  return data || [];
};

export const getFriendships = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id,
      status,
      requester_id,
      addressee_id,
      requester:profiles!requester_id(id, full_name, display_name, email, avatar_url),
      addressee:profiles!addressee_id(id, full_name, display_name, email, avatar_url)
    `)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  if (error) {
    console.error('Error fetching friendships:', error);
    throw error;
  }
  return data || [];
};

export const sendFriendRequest = async (addresseeId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from('friendships')
    .insert({
      requester_id: user.id,
      addressee_id: addresseeId,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateFriendRequestStatus = async (friendshipId, status) => {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status })
    .eq('id', friendshipId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteFriendship = async (friendshipId) => {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  if (error) throw error;
  return true;
};

export const getFriendsAndBalances = async () => {
  // Legacy method used by AppContext (temporarily kept)
  const friendships = await getFriendships();
  const { data: { user } } = await supabase.auth.getUser();
  
  const accepted = friendships.filter(f => f.status === 'accepted');
  return accepted.map(f => {
    const friendProfile = f.requester_id === user?.id ? f.addressee : f.requester;
    return { 
      name: getProfileName(friendProfile), 
      id: friendProfile.id 
    };
  });
};
