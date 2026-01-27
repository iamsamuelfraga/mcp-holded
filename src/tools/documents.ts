import { HoldedClient } from '../holded-client.js';
import {
  documentIdSchema,
  createDocumentSchema,
  updateDocumentSchema,
  updateDocumentPipelineSchema,
  attachFileToDocumentSchema,
  shipItemsByLineSchema,
  payDocumentSchema,
  sendDocumentSchema,
  updateDocumentTrackingSchema,
  withValidation,
} from '../validation.js';

// Document types supported by Holded
export type DocumentType =
  | 'invoice'
  | 'salesreceipt'
  | 'creditnote'
  | 'receiptnote'
  | 'estimate'
  | 'salesorder'
  | 'waybill'
  | 'proform'
  | 'purchase'
  | 'purchaserefund'
  | 'purchaseorder';

export function getDocumentTools(client: HoldedClient) {
  return {
    // List Documents
    list_documents: {
      description:
        'List all documents of a specific type with optional filters for date range, contact, payment status, and sorting. Supports field filtering to reduce response size.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          docType: {
            type: 'string',
            enum: [
              'invoice',
              'salesreceipt',
              'creditnote',
              'receiptnote',
              'estimate',
              'salesorder',
              'waybill',
              'proform',
              'purchase',
              'purchaserefund',
              'purchaseorder',
            ],
            description: 'Type of document to list',
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
          starttmp: {
            type: 'string',
            description: 'Starting timestamp (Unix timestamp) for filtering documents by date',
          },
          endtmp: {
            type: 'string',
            description: 'Ending timestamp (Unix timestamp) for filtering documents by date',
          },
          contactid: {
            type: 'string',
            description: 'Filter documents by contact ID',
          },
          paid: {
            type: 'string',
            enum: ['0', '1', '2'],
            description: 'Filter by payment status: 0=not paid, 1=paid, 2=partially paid',
          },
          billed: {
            type: 'string',
            enum: ['0', '1'],
            description: 'Filter by billed status: 0=not billed, 1=billed',
          },
          sort: {
            type: 'string',
            enum: ['created-asc', 'created-desc'],
            description: 'Sort order by creation date',
          },
          fields: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Select specific fields to return (e.g., ["id", "contactName", "total"]). Reduces response size by 70-90%. If not provided, returns default fields: id, contact, contactName, date, tax, total, status',
          },
        },
        required: ['docType'],
      },
      readOnlyHint: true,
      handler: async (args: {
        docType: DocumentType;
        page?: number;
        limit?: number;
        summary?: boolean;
        starttmp?: string;
        endtmp?: string;
        contactid?: string;
        paid?: string;
        billed?: string;
        sort?: string;
        fields?: string[];
      }) => {
        const queryParams: Record<string, string | number> = {};
        if (args.page) queryParams.page = args.page;
        if (args.limit) queryParams.limit = Math.min(args.limit, 500);
        if (args.starttmp) {
          queryParams.starttmp = args.starttmp;
          // If starttmp is provided but endtmp is not, default to current timestamp
          if (!args.endtmp) {
            queryParams.endtmp = Math.floor(Date.now() / 1000).toString();
          }
        }
        if (args.endtmp) queryParams.endtmp = args.endtmp;
        if (args.contactid) queryParams.contactid = args.contactid;
        if (args.paid) queryParams.paid = args.paid;
        if (args.billed) queryParams.billed = args.billed;
        if (args.sort) queryParams.sort = args.sort;
        const result = await client.get(`/documents/${args.docType}`, queryParams);
        // Filter to return only essential fields
        if (Array.isArray(result)) {
          // Field filtering: if fields specified, return only those fields
          // Otherwise, return default minimal set
          const defaultFields = ['id', 'contact', 'contactName', 'date', 'tax', 'total', 'status'];
          const fieldsToInclude =
            args.fields && args.fields.length > 0 ? args.fields : defaultFields;

          const filtered = result.map((doc: Record<string, unknown>) => {
            const resultDoc: Record<string, unknown> = {};
            for (const field of fieldsToInclude) {
              if (field in doc) {
                resultDoc[field] = doc[field];
              }
            }
            return resultDoc;
          });

          // Virtual pagination: control context by returning only a window of data
          const page = args.page ?? 1;
          const limit = Math.min(args.limit ?? 50, 500);

          // Calculate pagination window
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const items = filtered.slice(startIndex, endIndex);

          // Summary mode: return only count and metadata
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

    // Create Document
    create_document: {
      description: 'Create a new document (invoice, estimate, etc.)',
      inputSchema: {
        type: 'object' as const,
        properties: {
          docType: {
            type: 'string',
            enum: [
              'invoice',
              'salesreceipt',
              'creditnote',
              'receiptnote',
              'estimate',
              'salesorder',
              'waybill',
              'proform',
              'purchase',
              'purchaserefund',
              'purchaseorder',
            ],
            description: 'Type of document to create',
          },
          contactId: {
            type: 'string',
            description: 'Contact ID for the document',
          },
          items: {
            type: 'array',
            description: 'Array of line items',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                units: { type: 'number' },
                subtotal: { type: 'number' },
                tax: { type: 'number' },
              },
            },
          },
          date: {
            type: 'number',
            description: 'Document date as Unix timestamp',
          },
          notes: {
            type: 'string',
            description: 'Notes for the document',
          },
          currency: {
            type: 'string',
            description: 'Currency code (e.g., EUR, USD)',
          },
        },
        required: ['docType', 'contactId', 'items'],
      },
      destructiveHint: true,
      handler: withValidation(createDocumentSchema, async (args) => {
        const { docType, ...body } = args;
        return client.post(`/documents/${docType}`, body);
      }),
    },

    // Get Document
    get_document: {
      description: 'Get a specific document by ID',
      inputSchema: {
        type: 'object' as const,
        properties: {
          docType: {
            type: 'string',
            enum: [
              'invoice',
              'salesreceipt',
              'creditnote',
              'receiptnote',
              'estimate',
              'salesorder',
              'waybill',
              'proform',
              'purchase',
              'purchaserefund',
              'purchaseorder',
            ],
            description: 'Type of document',
          },
          documentId: {
            type: 'string',
            description: 'Document ID',
          },
        },
        required: ['docType', 'documentId'],
      },
      readOnlyHint: true,
      handler: withValidation(documentIdSchema, async (args) => {
        return client.get(`/documents/${args.docType}/${args.documentId}`);
      }),
    },

    // Update Document
    update_document: {
      description: 'Update an existing document',
      inputSchema: {
        type: 'object' as const,
        properties: {
          docType: {
            type: 'string',
            enum: [
              'invoice',
              'salesreceipt',
              'creditnote',
              'receiptnote',
              'estimate',
              'salesorder',
              'waybill',
              'proform',
              'purchase',
              'purchaserefund',
              'purchaseorder',
            ],
            description: 'Type of document',
          },
          documentId: {
            type: 'string',
            description: 'Document ID to update',
          },
          contactId: {
            type: 'string',
            description: 'Contact ID for the document',
          },
          items: {
            type: 'array',
            description: 'Array of line items',
          },
          date: {
            type: 'number',
            description: 'Document date as Unix timestamp',
          },
          notes: {
            type: 'string',
            description: 'Notes for the document',
          },
        },
        required: ['docType', 'documentId'],
      },
      destructiveHint: true,
      handler: withValidation(updateDocumentSchema, async (args) => {
        const { docType, documentId, ...body } = args;
        return client.put(`/documents/${docType}/${documentId}`, body);
      }),
    },

    // Delete Document
    delete_document: {
      description: 'Delete a document',
      inputSchema: {
        type: 'object' as const,
        properties: {
          docType: {
            type: 'string',
            enum: [
              'invoice',
              'salesreceipt',
              'creditnote',
              'receiptnote',
              'estimate',
              'salesorder',
              'waybill',
              'proform',
              'purchase',
              'purchaserefund',
              'purchaseorder',
            ],
            description: 'Type of document',
          },
          documentId: {
            type: 'string',
            description: 'Document ID to delete',
          },
        },
        required: ['docType', 'documentId'],
      },
      destructiveHint: true,
      handler: withValidation(documentIdSchema, async (args) => {
        return client.delete(`/documents/${args.docType}/${args.documentId}`);
      }),
    },

    // Pay Document
    pay_document: {
      description: 'Register a payment for a document',
      inputSchema: {
        type: 'object' as const,
        properties: {
          docType: {
            type: 'string',
            enum: [
              'invoice',
              'salesreceipt',
              'creditnote',
              'receiptnote',
              'estimate',
              'salesorder',
              'waybill',
              'proform',
              'purchase',
              'purchaserefund',
              'purchaseorder',
            ],
            description: 'Type of document',
          },
          documentId: {
            type: 'string',
            description: 'Document ID',
          },
          date: {
            type: 'number',
            description: 'Payment date as Unix timestamp',
          },
          amount: {
            type: 'number',
            description: 'Payment amount',
          },
          treasuryId: {
            type: 'string',
            description: 'Treasury account ID',
          },
        },
        required: ['docType', 'documentId', 'amount'],
      },
      destructiveHint: true,
      handler: withValidation(payDocumentSchema, async (args) => {
        const { docType, documentId, ...body } = args;
        return client.post(`/documents/${docType}/${documentId}/pay`, body);
      }),
    },

    // Send Document
    send_document: {
      description: 'Send a document by email',
      inputSchema: {
        type: 'object' as const,
        properties: {
          docType: {
            type: 'string',
            enum: [
              'invoice',
              'salesreceipt',
              'creditnote',
              'receiptnote',
              'estimate',
              'salesorder',
              'waybill',
              'proform',
              'purchase',
              'purchaserefund',
              'purchaseorder',
            ],
            description: 'Type of document',
          },
          documentId: {
            type: 'string',
            description: 'Document ID',
          },
          emails: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of email addresses to send to',
          },
          subject: {
            type: 'string',
            description: 'Email subject',
          },
          message: {
            type: 'string',
            description: 'Email message body',
          },
        },
        required: ['docType', 'documentId', 'emails'],
      },
      destructiveHint: true,
      handler: withValidation(sendDocumentSchema, async (args) => {
        const { docType, documentId, ...body } = args;
        return client.post(`/documents/${docType}/${documentId}/send`, body);
      }),
    },

    // Get Document PDF
    get_document_pdf: {
      description: 'Get the PDF of a document',
      inputSchema: {
        type: 'object' as const,
        properties: {
          docType: {
            type: 'string',
            enum: [
              'invoice',
              'salesreceipt',
              'creditnote',
              'receiptnote',
              'estimate',
              'salesorder',
              'waybill',
              'proform',
              'purchase',
              'purchaserefund',
              'purchaseorder',
            ],
            description: 'Type of document',
          },
          documentId: {
            type: 'string',
            description: 'Document ID',
          },
        },
        required: ['docType', 'documentId'],
      },
      readOnlyHint: true,
      handler: withValidation(documentIdSchema, async (args) => {
        return client.get(`/documents/${args.docType}/${args.documentId}/pdf`);
      }),
    },

    // Ship All Items
    ship_all_items: {
      description: 'Ship all items of a document',
      inputSchema: {
        type: 'object' as const,
        properties: {
          docType: {
            type: 'string',
            enum: [
              'invoice',
              'salesreceipt',
              'creditnote',
              'receiptnote',
              'estimate',
              'salesorder',
              'waybill',
              'proform',
              'purchase',
              'purchaserefund',
              'purchaseorder',
            ],
            description: 'Type of document',
          },
          documentId: {
            type: 'string',
            description: 'Document ID',
          },
        },
        required: ['docType', 'documentId'],
      },
      destructiveHint: true,
      handler: withValidation(documentIdSchema, async (args) => {
        return client.post(`/documents/${args.docType}/${args.documentId}/ship`);
      }),
    },

    // Ship Items by Line
    ship_items_by_line: {
      description: 'Ship specific items by line',
      inputSchema: {
        type: 'object' as const,
        properties: {
          docType: {
            type: 'string',
            enum: [
              'invoice',
              'salesreceipt',
              'creditnote',
              'receiptnote',
              'estimate',
              'salesorder',
              'waybill',
              'proform',
              'purchase',
              'purchaserefund',
              'purchaseorder',
            ],
            description: 'Type of document',
          },
          documentId: {
            type: 'string',
            description: 'Document ID',
          },
          lines: {
            type: 'array',
            description: 'Array of line items to ship',
            items: {
              type: 'object',
              properties: {
                lineId: { type: 'string' },
                units: { type: 'number' },
              },
            },
          },
        },
        required: ['docType', 'documentId', 'lines'],
      },
      destructiveHint: true,
      handler: withValidation(shipItemsByLineSchema, async (args) => {
        return client.post(`/documents/${args.docType}/${args.documentId}/ship`, {
          lines: args.lines,
        });
      }),
    },

    // Get Shipped Units by Item
    get_shipped_units: {
      description: 'Get shipped units by item for a document',
      inputSchema: {
        type: 'object' as const,
        properties: {
          docType: {
            type: 'string',
            enum: [
              'invoice',
              'salesreceipt',
              'creditnote',
              'receiptnote',
              'estimate',
              'salesorder',
              'waybill',
              'proform',
              'purchase',
              'purchaserefund',
              'purchaseorder',
            ],
            description: 'Type of document',
          },
          documentId: {
            type: 'string',
            description: 'Document ID',
          },
        },
        required: ['docType', 'documentId'],
      },
      readOnlyHint: true,
      handler: withValidation(documentIdSchema, async (args) => {
        return client.get(`/documents/${args.docType}/${args.documentId}/shipped`);
      }),
    },

    // Attach File to Document
    attach_file_to_document: {
      description: 'Attach a file to a document',
      inputSchema: {
        type: 'object' as const,
        properties: {
          docType: {
            type: 'string',
            enum: [
              'invoice',
              'salesreceipt',
              'creditnote',
              'receiptnote',
              'estimate',
              'salesorder',
              'waybill',
              'proform',
              'purchase',
              'purchaserefund',
              'purchaseorder',
            ],
            description: 'Type of document',
          },
          documentId: {
            type: 'string',
            description: 'Document ID',
          },
          fileBase64: {
            type: 'string',
            description: 'File content as base64 encoded string',
          },
          filename: {
            type: 'string',
            description: 'Name of the file',
          },
        },
        required: ['docType', 'documentId', 'fileBase64', 'filename'],
      },
      destructiveHint: true,
      handler: withValidation(attachFileToDocumentSchema, async (args) => {
        const buffer = Buffer.from(args.fileBase64, 'base64');
        return client.uploadFile(
          `/documents/${args.docType}/${args.documentId}/attach`,
          buffer,
          args.filename
        );
      }),
    },

    // Update Tracking Info
    update_document_tracking: {
      description: 'Update tracking information for a document',
      inputSchema: {
        type: 'object' as const,
        properties: {
          docType: {
            type: 'string',
            enum: [
              'invoice',
              'salesreceipt',
              'creditnote',
              'receiptnote',
              'estimate',
              'salesorder',
              'waybill',
              'proform',
              'purchase',
              'purchaserefund',
              'purchaseorder',
            ],
            description: 'Type of document',
          },
          documentId: {
            type: 'string',
            description: 'Document ID',
          },
          trackingNumber: {
            type: 'string',
            description: 'Tracking number',
          },
          carrier: {
            type: 'string',
            description: 'Carrier name',
          },
        },
        required: ['docType', 'documentId'],
      },
      destructiveHint: true,
      handler: withValidation(updateDocumentTrackingSchema, async (args) => {
        const { docType, documentId, ...body } = args;
        return client.post(`/documents/${docType}/${documentId}/tracking`, body);
      }),
    },

    // Update Pipeline
    update_document_pipeline: {
      description: 'Update pipeline stage for a document',
      inputSchema: {
        type: 'object' as const,
        properties: {
          docType: {
            type: 'string',
            enum: [
              'invoice',
              'salesreceipt',
              'creditnote',
              'receiptnote',
              'estimate',
              'salesorder',
              'waybill',
              'proform',
              'purchase',
              'purchaserefund',
              'purchaseorder',
            ],
            description: 'Type of document',
          },
          documentId: {
            type: 'string',
            description: 'Document ID',
          },
          pipelineId: {
            type: 'string',
            description: 'Pipeline ID',
          },
          stageId: {
            type: 'string',
            description: 'Stage ID within the pipeline',
          },
        },
        required: ['docType', 'documentId', 'pipelineId', 'stageId'],
      },
      destructiveHint: true,
      handler: withValidation(updateDocumentPipelineSchema, async (args) => {
        return client.post(`/documents/${args.docType}/${args.documentId}/pipeline`, {
          pipelineId: args.pipelineId,
          stageId: args.stageId,
        });
      }),
    },

    // List Payment Methods
    list_payment_methods: {
      description: 'List available payment methods',
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      readOnlyHint: true,
      handler: async () => {
        return client.get('/paymentmethods');
      },
    },
  };
}
