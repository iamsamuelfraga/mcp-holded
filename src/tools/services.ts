import { HoldedClient } from '../holded-client.js';

export function getServiceTools(client: HoldedClient) {
  return {
    // List Services
    list_services: {
      description: 'List all services with optional pagination',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page: {
            type: 'number',
            description: 'Page number for pagination (optional)',
          },
        },
        required: [],
      },
      readOnlyHint: true,
      handler: async (args: { page?: number }) => {
        const queryParams: Record<string, string | number> = {};
        if (args.page) queryParams.page = args.page;
        const services = (await client.get('/services', queryParams)) as Array<
          Record<string, unknown>
        >;
        return services.map((service) => ({
          id: service.id,
          name: service.name,
          price: service.price,
          tax: service.tax,
        }));
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
      handler: async (args: Record<string, unknown>) => {
        return client.post('/services', args);
      },
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
      handler: async (args: { serviceId: string }) => {
        return client.get(`/services/${args.serviceId}`);
      },
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
      handler: async (args: { serviceId: string; [key: string]: unknown }) => {
        const { serviceId, ...body } = args;
        return client.put(`/services/${serviceId}`, body);
      },
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
      handler: async (args: { serviceId: string }) => {
        return client.delete(`/services/${args.serviceId}`);
      },
    },
  };
}
