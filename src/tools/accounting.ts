import { AccountingClient } from '../accounting-client.js';

export function getAccountingTools(client: AccountingClient) {
  return {
    // List Journal Entries (Asientos) - Daily Ledger
    list_journal_entries: {
      description:
        'List all journal entries (daily ledger / libro diario) with date range filters. Date range is REQUIRED by the API. Supports field filtering to reduce response size.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page: {
            type: 'number',
            description: 'Page number for pagination (optional)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of items to return (default: 50, max: 500)',
          },
          summary: {
            type: 'boolean',
            description: 'Return only count and pagination metadata without items (default: false)',
          },
          starttmp: {
            type: 'string',
            description:
              'REQUIRED: Starting timestamp (Unix timestamp) for filtering entries by date',
          },
          endtmp: {
            type: 'string',
            description:
              'REQUIRED: Ending timestamp (Unix timestamp) for filtering entries by date',
          },
          fields: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Select specific fields to return (e.g., ["id", "date", "concept", "amount"]). Reduces response size.',
          },
        },
        required: ['starttmp', 'endtmp'],
      },
      readOnlyHint: true,
      handler: async (args: {
        page?: number;
        limit?: number;
        summary?: boolean;
        starttmp: string;
        endtmp: string;
        fields?: string[];
      }) => {
        const queryParams: Record<string, string | number> = {
          starttmp: args.starttmp,
          endtmp: args.endtmp,
        };
        if (args.page) queryParams.page = args.page;
        if (args.limit) queryParams.limit = Math.min(args.limit, 500);

        const result = await client.get('/dailyledger', queryParams);

        if (Array.isArray(result)) {
          // Default fields that match Holded API response
          const defaultFields = [
            'entryNumber',
            'line',
            'timestamp',
            'type',
            'description',
            'account',
            'debit',
            'credit',
            'docDescription',
            'tags',
            'checked',
          ];
          const fieldsToInclude =
            args.fields && args.fields.length > 0 ? args.fields : defaultFields;

          const filtered = result.map((entry: Record<string, unknown>) => {
            const resultEntry: Record<string, unknown> = {};
            for (const field of fieldsToInclude) {
              if (field in entry) {
                resultEntry[field] = entry[field];
              }
            }
            return resultEntry;
          });

          const page = args.page ?? 1;
          const limit = Math.min(args.limit ?? 50, 500);
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const items = filtered.slice(startIndex, endIndex);

          if (args.summary) {
            return {
              count: filtered.length,
              totalPages: Math.ceil(filtered.length / limit),
              currentPage: page,
              hasMore: endIndex < filtered.length,
            };
          }

          return {
            items,
            page,
            pageSize: items.length,
            totalItems: filtered.length,
            totalPages: Math.ceil(filtered.length / limit),
            hasMore: endIndex < filtered.length,
          };
        }
        return result;
      },
    },

    // Note: Holded Accounting API does not provide a single entry endpoint
    // Use list_journal_entries with a narrow date range to find specific entries

    // List Chart of Accounts (Plan de Cuentas)
    list_accounts: {
      description:
        'List all accounts from the chart of accounts (plan de cuentas). Supports field filtering to reduce response size.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page: {
            type: 'number',
            description: 'Page number for pagination (optional)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of items to return (default: 50, max: 500)',
          },
          summary: {
            type: 'boolean',
            description: 'Return only count and pagination metadata without items (default: false)',
          },
          fields: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Select specific fields to return (e.g., ["id", "name", "code", "category"]). Reduces response size.',
          },
        },
        required: [],
      },
      readOnlyHint: true,
      handler: async (args: {
        page?: number;
        limit?: number;
        summary?: boolean;
        fields?: string[];
      }) => {
        const queryParams: Record<string, string | number> = {};
        if (args.page) queryParams.page = args.page;
        if (args.limit) queryParams.limit = Math.min(args.limit, 500);

        const result = await client.get('/chartofaccounts', queryParams);

        if (Array.isArray(result)) {
          const defaultFields = ['id', 'name', 'code', 'category', 'balance'];
          const fieldsToInclude =
            args.fields && args.fields.length > 0 ? args.fields : defaultFields;

          const filtered = result.map((account: Record<string, unknown>) => {
            const resultAccount: Record<string, unknown> = {};
            for (const field of fieldsToInclude) {
              if (field in account) {
                resultAccount[field] = account[field];
              }
            }
            return resultAccount;
          });

          const page = args.page ?? 1;
          const limit = Math.min(args.limit ?? 50, 500);
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const items = filtered.slice(startIndex, endIndex);

          if (args.summary) {
            return {
              count: filtered.length,
              totalPages: Math.ceil(filtered.length / limit),
              currentPage: page,
              hasMore: endIndex < filtered.length,
            };
          }

          return {
            items,
            page,
            pageSize: items.length,
            totalItems: filtered.length,
            totalPages: Math.ceil(filtered.length / limit),
            hasMore: endIndex < filtered.length,
          };
        }
        return result;
      },
    },

    // Note: Holded Accounting API does not provide individual account retrieval
    // Use list_accounts to get all accounts and filter client-side

    // Note: Create operations for journal entries and accounts are available
    // via the Invoice API's automatic accounting generation, not direct Accounting API calls
  };
}
