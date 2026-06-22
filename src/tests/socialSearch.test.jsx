import { describe, it, expect } from 'vitest';

// Simulating search query execution logic
function executeSearch({ query, currentUser, allUsers }) {
  const trimmed = query ? query.trim() : '';
  if (trimmed.length < 2) {
    return [];
  }

  // Filter users matching query and excluding current user
  return allUsers.filter(user => {
    const matchesQuery = 
      user.email.toLowerCase().includes(trimmed.toLowerCase()) || 
      user.display_name.toLowerCase().includes(trimmed.toLowerCase());
    
    const isCurrentUser = currentUser && user.id === currentUser.id;

    return matchesQuery && !isCurrentUser;
  });
}

describe('Social Search Logic', () => {
  const mockAllUsers = [
    { id: '1', email: 'john@example.com', display_name: 'John Doe' },
    { id: '2', email: 'alice@example.com', display_name: 'Alice Smith' },
    { id: '3', email: 'bob@example.com', display_name: 'Bob Jones' },
    { id: '4', email: 'me@example.com', display_name: 'Current User' },
  ];
  const currentUser = { id: '4', email: 'me@example.com', display_name: 'Current User' };

  it('filters and returns users matching the query', () => {
    const results = executeSearch({
      query: 'alice',
      currentUser,
      allUsers: mockAllUsers
    });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('2');
  });

  it('excludes the current user from search results', () => {
    const results = executeSearch({
      query: 'Current',
      currentUser,
      allUsers: mockAllUsers
    });

    // Even though it matches 'Current User', it should exclude it because id === currentUser.id
    expect(results).toHaveLength(0);
  });

  it('returns empty array if search query is shorter than 2 characters', () => {
    const results = executeSearch({
      query: 'a',
      currentUser,
      allUsers: mockAllUsers
    });

    expect(results).toEqual([]);
  });

  it('handles spaces and trims queries correctly', () => {
    const results = executeSearch({
      query: '  john   ',
      currentUser,
      allUsers: mockAllUsers
    });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });
});
