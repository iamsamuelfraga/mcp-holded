import { HoldedClient } from '../holded-client.js';

export function getWarehouseTools(client: HoldedClient) {
  return {
    // List Warehouses
    list_warehouses: {
      description: 'List all warehouses',
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        return client.get('/warehouses');
      },
    },

    // Create Warehouse
    create_warehouse: {
      description: 'Create a new warehouse',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Warehouse name',
          },
          address: {
            type: 'string',
            description: 'Warehouse address',
          },
          city: {
            type: 'string',
            description: 'City',
          },
          postalCode: {
            type: 'string',
            description: 'Postal code',
          },
          province: {
            type: 'string',
            description: 'Province',
          },
          country: {
            type: 'string',
            description: 'Country',
          },
        },
        required: ['name'],
      },
      handler: async (args: Record<string, unknown>) => {
        return client.post('/warehouses', args);
      },
    },

    // List Products Stock in Warehouse
    list_warehouse_stock: {
      description: 'List all products stock in a specific warehouse',
      inputSchema: {
        type: 'object' as const,
        properties: {
          warehouseId: {
            type: 'string',
            description: 'Warehouse ID',
          },
          page: {
            type: 'number',
            description: 'Page number for pagination (optional)',
          },
        },
        required: ['warehouseId'],
      },
      handler: async (args: { warehouseId: string; page?: number }) => {
        const queryParams: Record<string, string | number> = {};
        if (args.page) queryParams.page = args.page;
        return client.get(`/warehouses/${args.warehouseId}/stock`, queryParams);
      },
    },

    // Get Warehouse
    get_warehouse: {
      description: 'Get a specific warehouse by ID',
      inputSchema: {
        type: 'object' as const,
        properties: {
          warehouseId: {
            type: 'string',
            description: 'Warehouse ID',
          },
        },
        required: ['warehouseId'],
      },
      handler: async (args: { warehouseId: string }) => {
        return client.get(`/warehouses/${args.warehouseId}`);
      },
    },

    // Update Warehouse
    update_warehouse: {
      description: 'Update an existing warehouse',
      inputSchema: {
        type: 'object' as const,
        properties: {
          warehouseId: {
            type: 'string',
            description: 'Warehouse ID to update',
          },
          name: {
            type: 'string',
            description: 'Warehouse name',
          },
          address: {
            type: 'string',
            description: 'Warehouse address',
          },
          city: {
            type: 'string',
            description: 'City',
          },
          postalCode: {
            type: 'string',
            description: 'Postal code',
          },
          province: {
            type: 'string',
            description: 'Province',
          },
          country: {
            type: 'string',
            description: 'Country',
          },
        },
        required: ['warehouseId'],
      },
      handler: async (args: { warehouseId: string; [key: string]: unknown }) => {
        const { warehouseId, ...body } = args;
        return client.put(`/warehouses/${warehouseId}`, body);
      },
    },

    // Delete Warehouse
    delete_warehouse: {
      description: 'Delete a warehouse',
      inputSchema: {
        type: 'object' as const,
        properties: {
          warehouseId: {
            type: 'string',
            description: 'Warehouse ID to delete',
          },
        },
        required: ['warehouseId'],
      },
      handler: async (args: { warehouseId: string }) => {
        return client.delete(`/warehouses/${args.warehouseId}`);
      },
    },
  };
}
