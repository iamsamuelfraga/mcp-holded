import { HoldedClient } from '../holded-client.js';

export function getExpensesAccountTools(client: HoldedClient) {
  return {
    // List Expenses Accounts
    list_expenses_accounts: {
      description: 'List all expenses accounts',
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      readOnlyHint: true,
      handler: async () => {
        const accounts = (await client.get('/expensesaccounts')) as Array<Record<string, unknown>>;
        return accounts.map((account) => ({
          id: account.id,
          name: account.name,
          code: account.code,
        }));
      },
    },

    // Create Expenses Account
    create_expenses_account: {
      description: 'Create a new expenses account',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Expenses account name',
          },
          code: {
            type: 'string',
            description: 'Account code',
          },
        },
        required: ['name'],
      },
      destructiveHint: true,
      handler: async (args: Record<string, unknown>) => {
        return client.post('/expensesaccounts', args);
      },
    },

    // Get Expenses Account
    get_expenses_account: {
      description: 'Get a specific expenses account by ID',
      inputSchema: {
        type: 'object' as const,
        properties: {
          accountId: {
            type: 'string',
            description: 'Expenses account ID',
          },
        },
        required: ['accountId'],
      },
      readOnlyHint: true,
      handler: async (args: { accountId: string }) => {
        return client.get(`/expensesaccounts/${args.accountId}`);
      },
    },

    // Update Expenses Account
    update_expenses_account: {
      description: 'Update an existing expenses account',
      inputSchema: {
        type: 'object' as const,
        properties: {
          accountId: {
            type: 'string',
            description: 'Expenses account ID to update',
          },
          name: {
            type: 'string',
            description: 'Expenses account name',
          },
          code: {
            type: 'string',
            description: 'Account code',
          },
        },
        required: ['accountId'],
      },
      destructiveHint: true,
      handler: async (args: { accountId: string; [key: string]: unknown }) => {
        const { accountId, ...body } = args;
        return client.put(`/expensesaccounts/${accountId}`, body);
      },
    },

    // Delete Expenses Account
    delete_expenses_account: {
      description: 'Delete an expenses account',
      inputSchema: {
        type: 'object' as const,
        properties: {
          accountId: {
            type: 'string',
            description: 'Expenses account ID to delete',
          },
        },
        required: ['accountId'],
      },
      destructiveHint: true,
      handler: async (args: { accountId: string }) => {
        return client.delete(`/expensesaccounts/${args.accountId}`);
      },
    },
  };
}
