import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getExpenses, getGroups } from '../services/db';
import { supabase } from '../lib/supabase';

describe('Database Services', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getExpenses', () => {
    it('fetches expenses and adapts to legacy format', async () => {
      // Mock user return
      supabase.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: 'user@example.com' } }
      });

      // Mock database response
      const mockExpenseData = [
        {
          id: 'exp-1',
          title: 'Lunch',
          amount: 60,
          date: '2026-06-22',
          category: { name: 'Food & Drinks', slug: 'food' },
          split_type: 'equal',
          expense_participants: [
            {
              user_id: 'user-123',
              amount_paid: 60,
              amount_owed: 20,
              profiles: { id: 'user-123', email: 'user@example.com', full_name: 'Me' }
            },
            {
              user_id: 'user-456',
              amount_paid: 0,
              amount_owed: 20,
              profiles: { id: 'user-456', email: 'friend1@example.com', full_name: 'Friend One' }
            },
            {
              user_id: 'user-789',
              amount_paid: 0,
              amount_owed: 20,
              profiles: { id: 'user-789', email: 'friend2@example.com', full_name: 'Friend Two' }
            }
          ]
        }
      ];

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockExpenseData, error: null })
          })
        })
      });

      const result = await getExpenses();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Lunch');
      expect(result[0].paidBy).toBe('You');
      expect(result[0].splitWith).toContain('You');
      expect(result[0].splitWith).toContain('Friend One');
      expect(result[0].splitsData['You']).toBe(20);
    });

    it('returns empty array if user is not logged in', async () => {
      supabase.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: null }
      });

      const result = await getExpenses();
      expect(result).toEqual([]);
    });
  });

  describe('getGroups', () => {
    it('fetches groups list', async () => {
      supabase.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } }
      });

      const mockGroups = [
        { id: 'group-1', name: 'Trip to Paris' }
      ];

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockGroups, error: null })
        })
      });

      const result = await getGroups();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Trip to Paris');
    });
  });
});
