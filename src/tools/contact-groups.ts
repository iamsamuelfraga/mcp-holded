import { HoldedClient } from '../holded-client.js';

export function getContactGroupTools(client: HoldedClient) {
  return {
    // List Contact Groups
    list_contact_groups: {
      description:
        'List all contact groups with pagination support. Supports field filtering to reduce response size.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page: {
            type: 'number',
            description: 'Page number (starting from 1, default: 1)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of items per page (default: 50, max: 500)',
          },
          summary: {
            type: 'boolean',
            description: 'Return only total count and page count without items (default: false)',
          },
          fields: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Select specific fields to return (e.g., ["id", "name"]). Reduces response size by 70-90%. If not provided, returns default fields: id, name',
          },
        },
        required: [],
      },
      readOnlyHint: true,
      handler: async (
        args: { page?: number; pageSize?: number; summary?: boolean; fields?: string[] } = {}
      ) => {
        const groups = (await client.get('/contactgroups')) as Array<Record<string, unknown>>;

        // Field filtering: if fields specified, return only those fields
        // Otherwise, return default minimal set
        const defaultFields = ['id', 'name'];
        const fieldsToInclude = args.fields && args.fields.length > 0 ? args.fields : defaultFields;

        const filtered = groups.map((group) => {
          const result: Record<string, unknown> = {};
          for (const field of fieldsToInclude) {
            if (field in group) {
              result[field] = group[field];
            }
          }
          return result;
        });

        // Pagination
        const page = Math.max(args.page ?? 1, 1);
        const pageSize = Math.min(args.pageSize ?? 50, 500);
        const total = filtered.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const items = filtered.slice(startIndex, endIndex);

        // Summary mode: return only metadata
        if (args.summary) {
          return {
            total,
            totalPages,
          };
        }

        return {
          items,
          page,
          pageSize,
          total,
          totalPages,
        };
      },
    },

    // Create Contact Group
    create_contact_group: {
      description: 'Create a new contact group',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Contact group name',
          },
        },
        required: ['name'],
      },
      destructiveHint: true,
      handler: async (args: Record<string, unknown>) => {
        return client.post('/contactgroups', args);
      },
    },

    // Get Contact Group
    get_contact_group: {
      description: 'Get a specific contact group by ID',
      inputSchema: {
        type: 'object' as const,
        properties: {
          groupId: {
            type: 'string',
            description: 'Contact group ID',
          },
        },
        required: ['groupId'],
      },
      readOnlyHint: true,
      handler: async (args: { groupId: string }) => {
        return client.get(`/contactgroups/${args.groupId}`);
      },
    },

    // Update Contact Group
    update_contact_group: {
      description: 'Update an existing contact group',
      inputSchema: {
        type: 'object' as const,
        properties: {
          groupId: {
            type: 'string',
            description: 'Contact group ID to update',
          },
          name: {
            type: 'string',
            description: 'Contact group name',
          },
        },
        required: ['groupId'],
      },
      destructiveHint: true,
      handler: async (args: { groupId: string; [key: string]: unknown }) => {
        const { groupId, ...body } = args;
        return client.put(`/contactgroups/${groupId}`, body);
      },
    },

    // Delete Contact Group
    delete_contact_group: {
      description: 'Delete a contact group',
      inputSchema: {
        type: 'object' as const,
        properties: {
          groupId: {
            type: 'string',
            description: 'Contact group ID to delete',
          },
        },
        required: ['groupId'],
      },
      destructiveHint: true,
      handler: async (args: { groupId: string }) => {
        return client.delete(`/contactgroups/${args.groupId}`);
      },
    },
  };
}
