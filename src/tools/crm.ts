import { CrmClient } from '../crm-client.js';

export function getCrmTools(client: CrmClient) {
  return {
    // ==================== FUNNELS ====================
    list_crm_funnels: {
      description:
        'List all CRM sales funnels (embudos de venta). Supports field filtering to reduce response size.',
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
              'Select specific fields to return (e.g., ["id", "name", "stages"]). Reduces response size.',
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

        const result = await client.get<Record<string, unknown>[]>('/funnels', queryParams);

        if (Array.isArray(result)) {
          const defaultFields = ['id', 'name', 'stages'];
          const fieldsToInclude =
            args.fields && args.fields.length > 0 ? args.fields : defaultFields;

          const filtered = result.map((item: Record<string, unknown>) => {
            const resultItem: Record<string, unknown> = {};
            for (const field of fieldsToInclude) {
              if (field in item) {
                resultItem[field] = item[field];
              }
            }
            return resultItem;
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

    get_crm_funnel: {
      description: 'Get a specific CRM funnel by ID.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          funnelId: {
            type: 'string',
            description: 'Funnel ID',
          },
        },
        required: ['funnelId'],
      },
      readOnlyHint: true,
      handler: async (args: { funnelId: string }) => {
        return client.get(`/funnels/${args.funnelId}`);
      },
    },

    // ==================== LEADS ====================
    list_crm_leads: {
      description:
        'List all CRM leads with optional filters. Supports field filtering to reduce response size.',
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
              'Select specific fields to return (e.g., ["id", "name", "email", "status"]). Reduces response size.',
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

        const result = await client.get<Record<string, unknown>[]>('/leads', queryParams);

        if (Array.isArray(result)) {
          const defaultFields = ['id', 'name', 'email', 'status', 'value'];
          const fieldsToInclude =
            args.fields && args.fields.length > 0 ? args.fields : defaultFields;

          const filtered = result.map((item: Record<string, unknown>) => {
            const resultItem: Record<string, unknown> = {};
            for (const field of fieldsToInclude) {
              if (field in item) {
                resultItem[field] = item[field];
              }
            }
            return resultItem;
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

    get_crm_lead: {
      description: 'Get a specific CRM lead by ID.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          leadId: {
            type: 'string',
            description: 'Lead ID',
          },
        },
        required: ['leadId'],
      },
      readOnlyHint: true,
      handler: async (args: { leadId: string }) => {
        return client.get(`/leads/${args.leadId}`);
      },
    },

    create_crm_lead: {
      description: 'Create a new CRM lead.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Lead name',
          },
          email: {
            type: 'string',
            description: 'Lead email',
          },
          phone: {
            type: 'string',
            description: 'Lead phone number',
          },
          company: {
            type: 'string',
            description: 'Company name',
          },
          value: {
            type: 'number',
            description: 'Lead value',
          },
          funnelId: {
            type: 'string',
            description: 'Funnel ID to assign lead to',
          },
          stageId: {
            type: 'string',
            description: 'Stage ID within the funnel',
          },
          contactId: {
            type: 'string',
            description: 'Related contact ID',
          },
          notes: {
            type: 'string',
            description: 'Additional notes',
          },
        },
        required: ['name'],
      },
      handler: async (args: {
        name: string;
        email?: string;
        phone?: string;
        company?: string;
        value?: number;
        funnelId?: string;
        stageId?: string;
        contactId?: string;
        notes?: string;
      }) => {
        return client.post('/leads', args);
      },
    },

    update_crm_lead: {
      description: 'Update an existing CRM lead.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          leadId: {
            type: 'string',
            description: 'Lead ID to update',
          },
          name: {
            type: 'string',
            description: 'Lead name',
          },
          email: {
            type: 'string',
            description: 'Lead email',
          },
          phone: {
            type: 'string',
            description: 'Lead phone number',
          },
          company: {
            type: 'string',
            description: 'Company name',
          },
          value: {
            type: 'number',
            description: 'Lead value',
          },
          funnelId: {
            type: 'string',
            description: 'Funnel ID to assign lead to',
          },
          stageId: {
            type: 'string',
            description: 'Stage ID within the funnel',
          },
          contactId: {
            type: 'string',
            description: 'Related contact ID',
          },
          notes: {
            type: 'string',
            description: 'Additional notes',
          },
        },
        required: ['leadId'],
      },
      handler: async (args: {
        leadId: string;
        name?: string;
        email?: string;
        phone?: string;
        company?: string;
        value?: number;
        funnelId?: string;
        stageId?: string;
        contactId?: string;
        notes?: string;
      }) => {
        const { leadId, ...data } = args;
        return client.put(`/leads/${leadId}`, data);
      },
    },

    delete_crm_lead: {
      description: 'Delete a CRM lead.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          leadId: {
            type: 'string',
            description: 'Lead ID to delete',
          },
        },
        required: ['leadId'],
      },
      handler: async (args: { leadId: string }) => {
        return client.delete(`/leads/${args.leadId}`);
      },
    },

    // ==================== EVENTS ====================
    list_crm_events: {
      description:
        'List all CRM events with optional filters. Supports field filtering to reduce response size.',
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
              'Select specific fields to return (e.g., ["id", "title", "date", "type"]). Reduces response size.',
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

        const result = await client.get<Record<string, unknown>[]>('/events', queryParams);

        if (Array.isArray(result)) {
          const defaultFields = ['id', 'title', 'date', 'type', 'contactId'];
          const fieldsToInclude =
            args.fields && args.fields.length > 0 ? args.fields : defaultFields;

          const filtered = result.map((item: Record<string, unknown>) => {
            const resultItem: Record<string, unknown> = {};
            for (const field of fieldsToInclude) {
              if (field in item) {
                resultItem[field] = item[field];
              }
            }
            return resultItem;
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

    get_crm_event: {
      description: 'Get a specific CRM event by ID.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          eventId: {
            type: 'string',
            description: 'Event ID',
          },
        },
        required: ['eventId'],
      },
      readOnlyHint: true,
      handler: async (args: { eventId: string }) => {
        return client.get(`/events/${args.eventId}`);
      },
    },

    create_crm_event: {
      description: 'Create a new CRM event.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          title: {
            type: 'string',
            description: 'Event title',
          },
          date: {
            type: 'number',
            description: 'Event date as Unix timestamp',
          },
          endDate: {
            type: 'number',
            description: 'Event end date as Unix timestamp',
          },
          type: {
            type: 'string',
            description: 'Event type (e.g., call, meeting, email)',
          },
          description: {
            type: 'string',
            description: 'Event description',
          },
          contactId: {
            type: 'string',
            description: 'Related contact ID',
          },
          leadId: {
            type: 'string',
            description: 'Related lead ID',
          },
        },
        required: ['title', 'date'],
      },
      handler: async (args: {
        title: string;
        date: number;
        endDate?: number;
        type?: string;
        description?: string;
        contactId?: string;
        leadId?: string;
      }) => {
        return client.post('/events', args);
      },
    },

    update_crm_event: {
      description: 'Update an existing CRM event.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          eventId: {
            type: 'string',
            description: 'Event ID to update',
          },
          title: {
            type: 'string',
            description: 'Event title',
          },
          date: {
            type: 'number',
            description: 'Event date as Unix timestamp',
          },
          endDate: {
            type: 'number',
            description: 'Event end date as Unix timestamp',
          },
          type: {
            type: 'string',
            description: 'Event type (e.g., call, meeting, email)',
          },
          description: {
            type: 'string',
            description: 'Event description',
          },
          contactId: {
            type: 'string',
            description: 'Related contact ID',
          },
          leadId: {
            type: 'string',
            description: 'Related lead ID',
          },
        },
        required: ['eventId'],
      },
      handler: async (args: {
        eventId: string;
        title?: string;
        date?: number;
        endDate?: number;
        type?: string;
        description?: string;
        contactId?: string;
        leadId?: string;
      }) => {
        const { eventId, ...data } = args;
        return client.put(`/events/${eventId}`, data);
      },
    },

    delete_crm_event: {
      description: 'Delete a CRM event.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          eventId: {
            type: 'string',
            description: 'Event ID to delete',
          },
        },
        required: ['eventId'],
      },
      handler: async (args: { eventId: string }) => {
        return client.delete(`/events/${args.eventId}`);
      },
    },
  };
}
