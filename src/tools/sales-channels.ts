import { HoldedClient } from '../holded-client.js';

export function getSalesChannelTools(client: HoldedClient) {
  return {
    // List Sales Channels
    list_sales_channels: {
      description: 'List all sales channels',
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      readOnlyHint: true,
      handler: async () => {
        const channels = (await client.get('/saleschannels')) as Array<Record<string, unknown>>;
        return channels.map((channel) => ({
          id: channel.id,
          name: channel.name,
        }));
      },
    },

    // Create Sales Channel
    create_sales_channel: {
      description: 'Create a new sales channel',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Sales channel name',
          },
        },
        required: ['name'],
      },
      destructiveHint: true,
      handler: async (args: Record<string, unknown>) => {
        return client.post('/saleschannels', args);
      },
    },

    // Get Sales Channel
    get_sales_channel: {
      description: 'Get a specific sales channel by ID',
      inputSchema: {
        type: 'object' as const,
        properties: {
          channelId: {
            type: 'string',
            description: 'Sales channel ID',
          },
        },
        required: ['channelId'],
      },
      readOnlyHint: true,
      handler: async (args: { channelId: string }) => {
        return client.get(`/saleschannels/${args.channelId}`);
      },
    },

    // Update Sales Channel
    update_sales_channel: {
      description: 'Update an existing sales channel',
      inputSchema: {
        type: 'object' as const,
        properties: {
          channelId: {
            type: 'string',
            description: 'Sales channel ID to update',
          },
          name: {
            type: 'string',
            description: 'Sales channel name',
          },
        },
        required: ['channelId'],
      },
      destructiveHint: true,
      handler: async (args: { channelId: string; [key: string]: unknown }) => {
        const { channelId, ...body } = args;
        return client.put(`/saleschannels/${channelId}`, body);
      },
    },

    // Delete Sales Channel
    delete_sales_channel: {
      description: 'Delete a sales channel',
      inputSchema: {
        type: 'object' as const,
        properties: {
          channelId: {
            type: 'string',
            description: 'Sales channel ID to delete',
          },
        },
        required: ['channelId'],
      },
      destructiveHint: true,
      handler: async (args: { channelId: string }) => {
        return client.delete(`/saleschannels/${args.channelId}`);
      },
    },
  };
}
