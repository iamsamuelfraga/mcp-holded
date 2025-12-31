import { HoldedClient } from '../holded-client.js';

export function getPaymentTools(client: HoldedClient) {
  return {
    // List Payments
    list_payments: {
      description: 'List all payments with optional filters for date range',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page: {
            type: 'number',
            description: 'Page number for pagination (optional)',
          },
          starttmp: {
            type: 'string',
            description: 'Starting timestamp (Unix timestamp) for filtering payments by date',
          },
          endtmp: {
            type: 'string',
            description: 'Ending timestamp (Unix timestamp) for filtering payments by date',
          },
        },
        required: [],
      },
      readOnlyHint: true,
      handler: async (args: { page?: number; starttmp?: string; endtmp?: string }) => {
        const queryParams: Record<string, string | number> = {};
        if (args.page) queryParams.page = args.page;
        if (args.starttmp) {
          queryParams.starttmp = args.starttmp;
          // If starttmp is provided but endtmp is not, default to current timestamp
          if (!args.endtmp) {
            queryParams.endtmp = Math.floor(Date.now() / 1000).toString();
          }
        }
        if (args.endtmp) queryParams.endtmp = args.endtmp;
        const payments = (await client.get('/payments', queryParams)) as Array<
          Record<string, unknown>
        >;
        return payments.map((payment) => ({
          id: payment.id,
          name: payment.name,
          days: payment.days,
          discount: payment.discount,
        }));
      },
    },

    // Create Payment
    create_payment: {
      description: 'Create a new payment',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Payment method name',
          },
          days: {
            type: 'number',
            description: 'Days until due',
          },
        },
        required: ['name'],
      },
      destructiveHint: true,
      handler: async (args: Record<string, unknown>) => {
        return client.post('/payments', args);
      },
    },

    // Get Payment
    get_payment: {
      description: 'Get a specific payment by ID',
      inputSchema: {
        type: 'object' as const,
        properties: {
          paymentId: {
            type: 'string',
            description: 'Payment ID',
          },
        },
        required: ['paymentId'],
      },
      readOnlyHint: true,
      handler: async (args: { paymentId: string }) => {
        return client.get(`/payments/${args.paymentId}`);
      },
    },

    // Update Payment
    update_payment: {
      description: 'Update an existing payment',
      inputSchema: {
        type: 'object' as const,
        properties: {
          paymentId: {
            type: 'string',
            description: 'Payment ID to update',
          },
          name: {
            type: 'string',
            description: 'Payment method name',
          },
          days: {
            type: 'number',
            description: 'Days until due',
          },
        },
        required: ['paymentId'],
      },
      destructiveHint: true,
      handler: async (args: { paymentId: string; [key: string]: unknown }) => {
        const { paymentId, ...body } = args;
        return client.put(`/payments/${paymentId}`, body);
      },
    },

    // Delete Payment
    delete_payment: {
      description: 'Delete a payment',
      inputSchema: {
        type: 'object' as const,
        properties: {
          paymentId: {
            type: 'string',
            description: 'Payment ID to delete',
          },
        },
        required: ['paymentId'],
      },
      destructiveHint: true,
      handler: async (args: { paymentId: string }) => {
        return client.delete(`/payments/${args.paymentId}`);
      },
    },
  };
}
