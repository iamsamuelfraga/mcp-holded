import { HoldedClient } from '../holded-client.js';

export function getContactTools(client: HoldedClient) {
  return {
    // List Contacts
    list_contacts: {
      description: 'List all contacts with optional filters for phone, mobile, or custom ID',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page: {
            type: 'number',
            description: 'Page number for pagination (optional)',
          },
          phone: {
            type: 'string',
            description: 'Filter by exact phone number match',
          },
          mobile: {
            type: 'string',
            description: 'Filter by exact mobile number match',
          },
          customId: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter by custom ID(s)',
          },
        },
        required: [],
      },
      handler: async (args: {
        page?: number;
        phone?: string;
        mobile?: string;
        customId?: string[];
      }) => {
        const queryParams: Record<string, string | number> = {};
        if (args.page) queryParams.page = args.page;
        if (args.phone) queryParams.phone = args.phone;
        if (args.mobile) queryParams.mobile = args.mobile;
        if (args.customId) queryParams['customId[]'] = args.customId.join(',');
        const contacts = (await client.get('/contacts', queryParams)) as Array<
          Record<string, unknown>
        >;
        return contacts.map((contact) => ({
          id: contact.id,
          customId: contact.customId,
          name: contact.name,
          email: contact.email,
        }));
      },
    },

    // Create Contact
    create_contact: {
      description: 'Create a new contact',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Contact name',
          },
          email: {
            type: 'string',
            description: 'Contact email',
          },
          phone: {
            type: 'string',
            description: 'Contact phone number',
          },
          vatnumber: {
            type: 'string',
            description: 'VAT number / Tax ID',
          },
          type: {
            type: 'string',
            enum: ['client', 'supplier', 'lead', 'debtor', 'creditor'],
            description: 'Contact type',
          },
          billAddress: {
            type: 'object',
            description: 'Billing address',
            properties: {
              address: { type: 'string' },
              city: { type: 'string' },
              postalCode: { type: 'string' },
              province: { type: 'string' },
              country: { type: 'string' },
            },
          },
          tradename: {
            type: 'string',
            description: 'Trade name',
          },
          code: {
            type: 'string',
            description: 'Contact code',
          },
          note: {
            type: 'string',
            description: 'Notes about the contact',
          },
        },
        required: ['name'],
      },
      handler: async (args: Record<string, unknown>) => {
        return client.post('/contacts', args);
      },
    },

    // Get Contact
    get_contact: {
      description: 'Get a specific contact by ID',
      inputSchema: {
        type: 'object' as const,
        properties: {
          contactId: {
            type: 'string',
            description: 'Contact ID',
          },
        },
        required: ['contactId'],
      },
      handler: async (args: { contactId: string }) => {
        return client.get(`/contacts/${args.contactId}`);
      },
    },

    // Update Contact
    update_contact: {
      description: 'Update an existing contact',
      inputSchema: {
        type: 'object' as const,
        properties: {
          contactId: {
            type: 'string',
            description: 'Contact ID to update',
          },
          name: {
            type: 'string',
            description: 'Contact name',
          },
          email: {
            type: 'string',
            description: 'Contact email',
          },
          phone: {
            type: 'string',
            description: 'Contact phone number',
          },
          vatnumber: {
            type: 'string',
            description: 'VAT number / Tax ID',
          },
          type: {
            type: 'string',
            enum: ['client', 'supplier', 'lead', 'debtor', 'creditor'],
            description: 'Contact type',
          },
          billAddress: {
            type: 'object',
            description: 'Billing address',
          },
        },
        required: ['contactId'],
      },
      handler: async (args: { contactId: string; [key: string]: unknown }) => {
        const { contactId, ...body } = args;
        return client.put(`/contacts/${contactId}`, body);
      },
    },

    // Delete Contact
    delete_contact: {
      description: 'Delete a contact',
      inputSchema: {
        type: 'object' as const,
        properties: {
          contactId: {
            type: 'string',
            description: 'Contact ID to delete',
          },
        },
        required: ['contactId'],
      },
      handler: async (args: { contactId: string }) => {
        return client.delete(`/contacts/${args.contactId}`);
      },
    },

    // Get Contact Attachments List
    list_contact_attachments: {
      description: 'Get list of attachments for a contact',
      inputSchema: {
        type: 'object' as const,
        properties: {
          contactId: {
            type: 'string',
            description: 'Contact ID',
          },
        },
        required: ['contactId'],
      },
      handler: async (args: { contactId: string }) => {
        return client.get(`/contacts/${args.contactId}/attachments`);
      },
    },

    // Get Contact Attachment
    get_contact_attachment: {
      description: 'Get a specific attachment from a contact',
      inputSchema: {
        type: 'object' as const,
        properties: {
          contactId: {
            type: 'string',
            description: 'Contact ID',
          },
          attachmentId: {
            type: 'string',
            description: 'Attachment ID',
          },
        },
        required: ['contactId', 'attachmentId'],
      },
      handler: async (args: { contactId: string; attachmentId: string }) => {
        return client.get(`/contacts/${args.contactId}/attachments/${args.attachmentId}`);
      },
    },
  };
}
