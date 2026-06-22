import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => {
  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id', email: 'test@example.com' } }, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  };

  const mockClient = {
    auth: mockAuth,
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: {}, error: null }),
    limit: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  };

  return {
    createClient: () => mockClient,
  };
});
