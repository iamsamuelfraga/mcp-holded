import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from './mock-client.js';
import { getTreasuryTools } from '../tools/treasuries.js';

describe('Treasury Tools', () => {
  let client: ReturnType<typeof createMockClient>;
  let tools: ReturnType<typeof getTreasuryTools>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    tools = getTreasuryTools(client);
  });

  describe('list_treasuries', () => {
    it('should list all treasuries', async () => {
      await tools.list_treasuries.handler();
      expect(client.get).toHaveBeenCalledWith('/treasury');
    });
  });

  describe('create_treasury', () => {
    it('should create a treasury with required fields', async () => {
      await tools.create_treasury.handler({ name: 'Main Account' });
      expect(client.post).toHaveBeenCalledWith('/treasury', { name: 'Main Account' });
    });

    it('should include optional fields', async () => {
      const args = {
        name: 'Bank Account',
        iban: 'ES1234567890123456789012',
        bic: 'ABCDESXX',
        balance: 10000,
      };
      await tools.create_treasury.handler(args);
      expect(client.post).toHaveBeenCalledWith('/treasury', args);
    });
  });

  describe('get_treasury', () => {
    it('should get a treasury by ID', async () => {
      await tools.get_treasury.handler({ treasuryId: 'treasury-123' });
      expect(client.get).toHaveBeenCalledWith('/treasury/treasury-123');
    });
  });
});
