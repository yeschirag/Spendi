import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getFriendships, sendFriendRequest, updateFriendRequestStatus, deleteFriendship } from '../services/db';

const FriendContext = createContext({});

export const FriendProvider = ({ children }) => {
  const { user } = useAuth();
  const [friendships, setFriendships] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFriendships = useCallback(async () => {
    if (!user) {
      setFriendships([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getFriendships();
      setFriendships(data);
    } catch (err) {
      console.error('Failed to load friendships:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFriendships();
  }, [loadFriendships]);

  const friends = friendships.filter(f => f.status === 'accepted').map(f => {
    const profile = f.requester_id === user?.id ? f.addressee : f.requester;
    return { ...profile, friendshipId: f.id };
  });

  const incomingRequests = friendships.filter(f => f.status === 'pending' && f.addressee_id === user?.id);
  const outgoingRequests = friendships.filter(f => f.status === 'pending' && f.requester_id === user?.id);

  const sendRequest = async (targetUserId) => {
    try {
      const newRequest = await sendFriendRequest(targetUserId);
      await loadFriendships();
      return newRequest;
    } catch (err) {
      console.error("Failed to send request:", err);
      throw err;
    }
  };

  const acceptRequest = async (friendshipId) => {
    try {
      await updateFriendRequestStatus(friendshipId, 'accepted');
      await loadFriendships();
    } catch (err) {
      console.error("Failed to accept request:", err);
      throw err;
    }
  };

  const rejectRequest = async (friendshipId) => {
    try {
      await updateFriendRequestStatus(friendshipId, 'rejected');
      await loadFriendships();
    } catch (err) {
      console.error("Failed to reject request:", err);
      throw err;
    }
  };

  const removeFriend = async (friendshipId) => {
    try {
      await deleteFriendship(friendshipId);
      await loadFriendships();
    } catch (err) {
      console.error("Failed to remove friend:", err);
      throw err;
    }
  };

  return (
    <FriendContext.Provider value={{
      friendships,
      friends,
      incomingRequests,
      outgoingRequests,
      loading,
      sendRequest,
      acceptRequest,
      rejectRequest,
      removeFriend,
      refresh: loadFriendships
    }}>
      {children}
    </FriendContext.Provider>
  );
};

export const useFriends = () => useContext(FriendContext);
