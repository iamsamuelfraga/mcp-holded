import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from './mock-client.js';
import { getExpensesAccountTools } from '../tools/expenses-accounts.js';

describe('Expenses Account Tools', () => {
  let client: ReturnType<typeof createMockClient>;
  let tools: ReturnType<typeof getExpensesAccountTools>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    tools = getExpensesAccountTools(client);
  });

  describe('list_expenses_accounts', () => {
    it('should list all expenses accounts', async () => {
      await tools.list_expenses_accounts.handler();
      expect(client.get).toHaveBeenCalledWith('/expensesaccounts');
    });
  });

  describe('create_expenses_account', () => {
    it('should create an expenses account', async () => {
      await tools.create_expenses_account.handler({ name: 'Office Supplies' });
      expect(client.post).toHaveBeenCalledWith('/expensesaccounts', { name: 'Office Supplies' });
    });

    it('should include code if provided', async () => {
      const args = { name: 'Travel', code: '6290' };
      await tools.create_expenses_account.handler(args);
      expect(client.post).toHaveBeenCalledWith('/expensesaccounts', args);
    });
  });

  describe('get_expenses_account', () => {
    it('should get an expenses account by ID', async () => {
      await tools.get_expenses_account.handler({ accountId: 'account-123' });
      expect(client.get).toHaveBeenCalledWith('/expensesaccounts/account-123');
    });
  });

  describe('update_expenses_account', () => {
    it('should update an expenses account', async () => {
      const args = {
        accountId: 'account-123',
        name: 'Updated Name',
        code: '6300',
      };
      await tools.update_expenses_account.handler(args);
      expect(client.put).toHaveBeenCalledWith('/expensesaccounts/account-123', {
        name: 'Updated Name',
        code: '6300',
      });
    });
  });

  describe('delete_expenses_account', () => {
    it('should delete an expenses account', async () => {
      await tools.delete_expenses_account.handler({ accountId: 'account-123' });
      expect(client.delete).toHaveBeenCalledWith('/expensesaccounts/account-123');
    });
  });
});
