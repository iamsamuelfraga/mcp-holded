import { ProjectsClient } from '../projects-client.js';

export function getProjectsTools(client: ProjectsClient) {
  return {
    // ==================== PROJECTS ====================
    list_projects: {
      description: 'List all projects. Supports field filtering to reduce response size.',
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
              'Select specific fields to return (e.g., ["id", "name", "status", "budget"]). Reduces response size.',
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

        const result = await client.get<Record<string, unknown>[]>('/projects', queryParams);

        if (Array.isArray(result)) {
          const defaultFields = ['id', 'name', 'status', 'budget', 'progress'];
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

    get_project: {
      description: 'Get a specific project by ID.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          projectId: {
            type: 'string',
            description: 'Project ID',
          },
        },
        required: ['projectId'],
      },
      readOnlyHint: true,
      handler: async (args: { projectId: string }) => {
        return client.get(`/projects/${args.projectId}`);
      },
    },

    create_project: {
      description: 'Create a new project.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Project name',
          },
          description: {
            type: 'string',
            description: 'Project description',
          },
          contactId: {
            type: 'string',
            description: 'Related contact ID',
          },
          budget: {
            type: 'number',
            description: 'Project budget',
          },
          startDate: {
            type: 'number',
            description: 'Start date as Unix timestamp',
          },
          endDate: {
            type: 'number',
            description: 'End date as Unix timestamp',
          },
        },
        required: ['name'],
      },
      handler: async (args: {
        name: string;
        description?: string;
        contactId?: string;
        budget?: number;
        startDate?: number;
        endDate?: number;
      }) => {
        return client.post('/projects', args);
      },
    },

    update_project: {
      description: 'Update an existing project.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          projectId: {
            type: 'string',
            description: 'Project ID to update',
          },
          name: {
            type: 'string',
            description: 'Project name',
          },
          description: {
            type: 'string',
            description: 'Project description',
          },
          contactId: {
            type: 'string',
            description: 'Related contact ID',
          },
          budget: {
            type: 'number',
            description: 'Project budget',
          },
          startDate: {
            type: 'number',
            description: 'Start date as Unix timestamp',
          },
          endDate: {
            type: 'number',
            description: 'End date as Unix timestamp',
          },
          status: {
            type: 'string',
            description: 'Project status',
          },
        },
        required: ['projectId'],
      },
      handler: async (args: {
        projectId: string;
        name?: string;
        description?: string;
        contactId?: string;
        budget?: number;
        startDate?: number;
        endDate?: number;
        status?: string;
      }) => {
        const { projectId, ...data } = args;
        return client.put(`/projects/${projectId}`, data);
      },
    },

    delete_project: {
      description: 'Delete a project.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          projectId: {
            type: 'string',
            description: 'Project ID to delete',
          },
        },
        required: ['projectId'],
      },
      handler: async (args: { projectId: string }) => {
        return client.delete(`/projects/${args.projectId}`);
      },
    },

    // ==================== TASKS ====================
    list_project_tasks: {
      description: 'List all tasks for a specific project.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          projectId: {
            type: 'string',
            description: 'Project ID',
          },
          page: {
            type: 'number',
            description: 'Page number for pagination (optional)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of items to return (default: 50, max: 500)',
          },
          fields: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Select specific fields to return (e.g., ["id", "name", "status", "hours"]). Reduces response size.',
          },
        },
        required: ['projectId'],
      },
      readOnlyHint: true,
      handler: async (args: {
        projectId: string;
        page?: number;
        limit?: number;
        fields?: string[];
      }) => {
        const queryParams: Record<string, string | number> = {};
        if (args.page) queryParams.page = args.page;
        if (args.limit) queryParams.limit = Math.min(args.limit, 500);

        const result = await client.get<Record<string, unknown>[]>(
          `/projects/${args.projectId}/tasks`,
          queryParams
        );

        if (Array.isArray(result)) {
          const defaultFields = ['id', 'name', 'status', 'hours', 'assignedTo'];
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

    get_project_task: {
      description: 'Get a specific task from a project.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          projectId: {
            type: 'string',
            description: 'Project ID',
          },
          taskId: {
            type: 'string',
            description: 'Task ID',
          },
        },
        required: ['projectId', 'taskId'],
      },
      readOnlyHint: true,
      handler: async (args: { projectId: string; taskId: string }) => {
        return client.get(`/projects/${args.projectId}/tasks/${args.taskId}`);
      },
    },

    create_project_task: {
      description: 'Create a new task in a project.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          projectId: {
            type: 'string',
            description: 'Project ID',
          },
          name: {
            type: 'string',
            description: 'Task name',
          },
          description: {
            type: 'string',
            description: 'Task description',
          },
          assignedTo: {
            type: 'string',
            description: 'Employee ID to assign task to',
          },
          hours: {
            type: 'number',
            description: 'Estimated hours',
          },
          dueDate: {
            type: 'number',
            description: 'Due date as Unix timestamp',
          },
        },
        required: ['projectId', 'name'],
      },
      handler: async (args: {
        projectId: string;
        name: string;
        description?: string;
        assignedTo?: string;
        hours?: number;
        dueDate?: number;
      }) => {
        const { projectId, ...data } = args;
        return client.post(`/projects/${projectId}/tasks`, data);
      },
    },

    update_project_task: {
      description: 'Update an existing task in a project.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          projectId: {
            type: 'string',
            description: 'Project ID',
          },
          taskId: {
            type: 'string',
            description: 'Task ID to update',
          },
          name: {
            type: 'string',
            description: 'Task name',
          },
          description: {
            type: 'string',
            description: 'Task description',
          },
          assignedTo: {
            type: 'string',
            description: 'Employee ID to assign task to',
          },
          hours: {
            type: 'number',
            description: 'Estimated hours',
          },
          dueDate: {
            type: 'number',
            description: 'Due date as Unix timestamp',
          },
          status: {
            type: 'string',
            description: 'Task status',
          },
        },
        required: ['projectId', 'taskId'],
      },
      handler: async (args: {
        projectId: string;
        taskId: string;
        name?: string;
        description?: string;
        assignedTo?: string;
        hours?: number;
        dueDate?: number;
        status?: string;
      }) => {
        const { projectId, taskId, ...data } = args;
        return client.put(`/projects/${projectId}/tasks/${taskId}`, data);
      },
    },

    delete_project_task: {
      description: 'Delete a task from a project.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          projectId: {
            type: 'string',
            description: 'Project ID',
          },
          taskId: {
            type: 'string',
            description: 'Task ID to delete',
          },
        },
        required: ['projectId', 'taskId'],
      },
      handler: async (args: { projectId: string; taskId: string }) => {
        return client.delete(`/projects/${args.projectId}/tasks/${args.taskId}`);
      },
    },

    // ==================== TIME TRACKING ====================
    list_project_time_entries: {
      description: 'List time tracking entries for a project.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          projectId: {
            type: 'string',
            description: 'Project ID',
          },
          page: {
            type: 'number',
            description: 'Page number for pagination (optional)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of items to return (default: 50, max: 500)',
          },
          fields: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Select specific fields to return (e.g., ["id", "taskId", "duration", "date"]). Reduces response size.',
          },
        },
        required: ['projectId'],
      },
      readOnlyHint: true,
      handler: async (args: {
        projectId: string;
        page?: number;
        limit?: number;
        fields?: string[];
      }) => {
        const queryParams: Record<string, string | number> = {};
        if (args.page) queryParams.page = args.page;
        if (args.limit) queryParams.limit = Math.min(args.limit, 500);

        const result = await client.get<Record<string, unknown>[]>(
          `/projects/${args.projectId}/time`,
          queryParams
        );

        if (Array.isArray(result)) {
          const defaultFields = ['id', 'taskId', 'duration', 'date', 'employeeId'];
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

    create_project_time_entry: {
      description: 'Create a time tracking entry for a project task.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          projectId: {
            type: 'string',
            description: 'Project ID',
          },
          taskId: {
            type: 'string',
            description: 'Task ID',
          },
          employeeId: {
            type: 'string',
            description: 'Employee ID',
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
        required: ['projectId', 'taskId', 'employeeId', 'duration', 'date'],
      },
      handler: async (args: {
        projectId: string;
        taskId: string;
        employeeId: string;
        duration: number;
        date: number;
        notes?: string;
      }) => {
        const { projectId, ...data } = args;
        return client.post(`/projects/${projectId}/time`, data);
      },
    },
  };
}
