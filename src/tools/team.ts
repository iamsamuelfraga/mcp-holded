import { TeamClient } from '../team-client.js';

export function getTeamTools(client: TeamClient) {
  return {
    // ==================== EMPLOYEES ====================
    list_employees: {
      description: 'List all employees. Supports field filtering to reduce response size.',
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
              'Select specific fields to return (e.g., ["id", "name", "email", "department"]). Reduces response size.',
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

        const result = await client.get<Record<string, unknown>[]>('/employees', queryParams);

        if (Array.isArray(result)) {
          const defaultFields = ['id', 'name', 'email', 'department', 'role'];
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

    get_employee: {
      description: 'Get a specific employee by ID.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          employeeId: {
            type: 'string',
            description: 'Employee ID',
          },
        },
        required: ['employeeId'],
      },
      readOnlyHint: true,
      handler: async (args: { employeeId: string }) => {
        return client.get(`/employees/${args.employeeId}`);
      },
    },

    create_employee: {
      description: 'Create a new employee.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Employee name',
          },
          email: {
            type: 'string',
            description: 'Employee email',
          },
          phone: {
            type: 'string',
            description: 'Employee phone number',
          },
          department: {
            type: 'string',
            description: 'Department name',
          },
          role: {
            type: 'string',
            description: 'Job role/title',
          },
          startDate: {
            type: 'number',
            description: 'Start date as Unix timestamp',
          },
        },
        required: ['name', 'email'],
      },
      handler: async (args: {
        name: string;
        email: string;
        phone?: string;
        department?: string;
        role?: string;
        startDate?: number;
      }) => {
        return client.post('/employees', args);
      },
    },

    update_employee: {
      description: 'Update an existing employee.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          employeeId: {
            type: 'string',
            description: 'Employee ID to update',
          },
          name: {
            type: 'string',
            description: 'Employee name',
          },
          email: {
            type: 'string',
            description: 'Employee email',
          },
          phone: {
            type: 'string',
            description: 'Employee phone number',
          },
          department: {
            type: 'string',
            description: 'Department name',
          },
          role: {
            type: 'string',
            description: 'Job role/title',
          },
          startDate: {
            type: 'number',
            description: 'Start date as Unix timestamp',
          },
        },
        required: ['employeeId'],
      },
      handler: async (args: {
        employeeId: string;
        name?: string;
        email?: string;
        phone?: string;
        department?: string;
        role?: string;
        startDate?: number;
      }) => {
        const { employeeId, ...data } = args;
        return client.put(`/employees/${employeeId}`, data);
      },
    },

    delete_employee: {
      description: 'Delete an employee.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          employeeId: {
            type: 'string',
            description: 'Employee ID to delete',
          },
        },
        required: ['employeeId'],
      },
      handler: async (args: { employeeId: string }) => {
        return client.delete(`/employees/${args.employeeId}`);
      },
    },

    // ==================== TIME TRACKING ====================
    list_team_time_entries: {
      description:
        'List team time tracking entries with optional filters. Supports field filtering to reduce response size.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          employeeId: {
            type: 'string',
            description: 'Filter by employee ID (optional)',
          },
          startDate: {
            type: 'string',
            description: 'Start date as Unix timestamp (optional)',
          },
          endDate: {
            type: 'string',
            description: 'End date as Unix timestamp (optional)',
          },
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
              'Select specific fields to return (e.g., ["id", "employeeId", "duration", "date"]). Reduces response size.',
          },
        },
        required: [],
      },
      readOnlyHint: true,
      handler: async (args: {
        employeeId?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
        summary?: boolean;
        fields?: string[];
      }) => {
        const queryParams: Record<string, string | number> = {};
        if (args.employeeId) queryParams.employeeId = args.employeeId;
        if (args.startDate) queryParams.startDate = args.startDate;
        if (args.endDate) queryParams.endDate = args.endDate;
        if (args.page) queryParams.page = args.page;
        if (args.limit) queryParams.limit = Math.min(args.limit, 500);

        const result = await client.get<Record<string, unknown>[]>('/timetracking', queryParams);

        if (Array.isArray(result)) {
          const defaultFields = ['id', 'employeeId', 'duration', 'date', 'projectId', 'taskId'];
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

    create_team_time_entry: {
      description: 'Create a time tracking entry for an employee.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          employeeId: {
            type: 'string',
            description: 'Employee ID',
          },
          projectId: {
            type: 'string',
            description: 'Project ID (optional)',
          },
          taskId: {
            type: 'string',
            description: 'Task ID (optional)',
          },
          duration: {
            type: 'number',
            description: 'Duration in minutes',
          },
          date: {
            type: 'number',
            description: 'Date as Unix timestamp',
          },
          notes: {
            type: 'string',
            description: 'Notes about the time entry',
          },
        },
        required: ['employeeId', 'duration', 'date'],
      },
      handler: async (args: {
        employeeId: string;
        projectId?: string;
        taskId?: string;
        duration: number;
        date: number;
        notes?: string;
      }) => {
        return client.post('/timetracking', args);
      },
    },

    update_team_time_entry: {
      description: 'Update a time tracking entry.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          timeEntryId: {
            type: 'string',
            description: 'Time entry ID to update',
          },
          employeeId: {
            type: 'string',
            description: 'Employee ID',
          },
          projectId: {
            type: 'string',
            description: 'Project ID (optional)',
          },
          taskId: {
            type: 'string',
            description: 'Task ID (optional)',
          },
          duration: {
            type: 'number',
            description: 'Duration in minutes',
          },
          date: {
            type: 'number',
            description: 'Date as Unix timestamp',
          },
          notes: {
            type: 'string',
            description: 'Notes about the time entry',
          },
        },
        required: ['timeEntryId'],
      },
      handler: async (args: {
        timeEntryId: string;
        employeeId?: string;
        projectId?: string;
        taskId?: string;
        duration?: number;
        date?: number;
        notes?: string;
      }) => {
        const { timeEntryId, ...data } = args;
        return client.put(`/timetracking/${timeEntryId}`, data);
      },
    },

    delete_team_time_entry: {
      description: 'Delete a time tracking entry.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          timeEntryId: {
            type: 'string',
            description: 'Time entry ID to delete',
          },
        },
        required: ['timeEntryId'],
      },
      handler: async (args: { timeEntryId: string }) => {
        return client.delete(`/timetracking/${args.timeEntryId}`);
      },
    },
  };
}
