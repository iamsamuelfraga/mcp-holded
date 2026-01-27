import { HoldedClient } from '../holded-client.js';
import {
  serviceIdSchema,
  createServiceSchema,
  updateServiceSchema,
  withValidation,
} from '../validation.js';

export function getServiceTools(client: HoldedClient) {
  return {
    // List Services
    list_services: {
      description:
        'List all services with optional pagination. Supports field filtering to reduce response size.',
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
              'Select specific fields to return (e.g., ["id", "name", "price", "tax"]). Reduces response size by 70-90%. If not provided, returns default fields: id, name, price, tax',
          },
        },
        required: [],
      },
      readOnlyHint: true,
      handler: async (
        args: { page?: number; limit?: number; summary?: boolean; fields?: string[] } = {}
      ) => {
        const queryParams: Record<string, string | number> = {};
        if (args.page) queryParams.page = args.page;
        if (args.limit) queryParams.limit = Math.min(args.limit, 500);
        const services = (await client.get('/services', queryParams)) as Array<
          Record<string, unknown>
        >;

        // Field filtering: if fields specified, return only those fields
        // Otherwise, return default minimal set
        const defaultFields = ['id', 'name', 'price', 'tax'];
        const fieldsToInclude = args.fields && args.fields.length > 0 ? args.fields : defaultFields;

        const filtered = services.map((service) => {
          const result: Record<string, unknown> = {};
          for (const field of fieldsToInclude) {
            if (field in service) {
              result[field] = service[field];
            }
          }
          return result;
        });

        const limit = Math.min(args.limit ?? 50, 500);
        const items = filtered.slice(0, limit);

        // Summary mode: return only count and metadata
        if (args.summary) {
          return {
            count: items.length,
            hasMore: items.length === limit && filtered.length > limit,
          };
        }

        return {
          items,
          page: args.page,
          pageSize: items.length,
          hasMore: items.length === limit && filtered.length > limit,
        };
      },
    },

    // Create Service
    create_service: {
      description: 'Create a new service',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Service name',
          },
          sku: {
            type: 'string',
            description: 'Service SKU',
          },
          price: {
            type: 'number',
            description: 'Service price',
          },
          tax: {
            type: 'number',
            description: 'Tax percentage',
          },
          description: {
            type: 'string',
            description: 'Service description',
          },
        },
        required: ['name'],
      },
      destructiveHint: true,
      handler: withValidation(createServiceSchema, async (args) => {
        return client.post('/services', args);
      }),
    },

    // Get Service
    get_service: {
      description: 'Get a specific service by ID',
      inputSchema: {
        type: 'object' as const,
        properties: {
          serviceId: {
            type: 'string',
            description: 'Service ID',
          },
        },
        required: ['serviceId'],
      },
      readOnlyHint: true,
      handler: withValidation(serviceIdSchema, async (args) => {
        return client.get(`/services/${args.serviceId}`);
      }),
    },

    // Update Service
    update_service: {
      description: 'Update an existing service',
      inputSchema: {
        type: 'object' as const,
        properties: {
          serviceId: {
            type: 'string',
            description: 'Service ID to update',
          },
          name: {
            type: 'string',
            description: 'Service name',
          },
          sku: {
            type: 'string',
            description: 'Service SKU',
          },
          price: {
            type: 'number',
            description: 'Service price',
          },
          tax: {
            type: 'number',
            description: 'Tax percentage',
          },
          description: {
            type: 'string',
            description: 'Service description',
          },
        },
        required: ['serviceId'],
      },
      destructiveHint: true,
      handler: withValidation(updateServiceSchema, async (args) => {
        const { serviceId, ...body } = args;
        return client.put(`/services/${serviceId}`, body);
      }),
    },

    // Delete Service
    delete_service: {
      description: 'Delete a service',
      inputSchema: {
        type: 'object' as const,
        properties: {
          serviceId: {
            type: 'string',
            description: 'Service ID to delete',
          },
        },
        required: ['serviceId'],
      },
      destructiveHint: true,
      handler: withValidation(serviceIdSchema, async (args) => {
        return client.delete(`/services/${args.serviceId}`);
      }),
    },
  };
}
