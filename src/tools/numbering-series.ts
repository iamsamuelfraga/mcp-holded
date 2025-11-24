import { HoldedClient } from '../holded-client.js';

export function getNumberingSeriesTools(client: HoldedClient) {
  return {
    // Get Numbering Series by Type
    get_numbering_series: {
      description: 'Get numbering series for a specific document type',
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
            description: 'Document type',
          },
        },
        required: ['docType'],
      },
      handler: async (args: { docType: string }) => {
        return client.get(`/numberseries/${args.docType}`);
      },
    },

    // Create Numbering Serie
    create_numbering_serie: {
      description: 'Create a new numbering serie',
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
            description: 'Document type',
          },
          name: {
            type: 'string',
            description: 'Serie name',
          },
          prefix: {
            type: 'string',
            description: 'Serie prefix',
          },
          nextNumber: {
            type: 'number',
            description: 'Next number in the serie',
          },
        },
        required: ['docType', 'name'],
      },
      handler: async (args: { docType: string; [key: string]: unknown }) => {
        const { docType, ...body } = args;
        return client.post(`/numberseries/${docType}`, body);
      },
    },

    // Update Numbering Serie
    update_numbering_serie: {
      description: 'Update an existing numbering serie',
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
            description: 'Document type',
          },
          serieId: {
            type: 'string',
            description: 'Serie ID to update',
          },
          name: {
            type: 'string',
            description: 'Serie name',
          },
          prefix: {
            type: 'string',
            description: 'Serie prefix',
          },
          nextNumber: {
            type: 'number',
            description: 'Next number in the serie',
          },
        },
        required: ['docType', 'serieId'],
      },
      handler: async (args: { docType: string; serieId: string; [key: string]: unknown }) => {
        const { docType, serieId, ...body } = args;
        return client.put(`/numberseries/${docType}/${serieId}`, body);
      },
    },

    // Delete Numbering Serie
    delete_numbering_serie: {
      description: 'Delete a numbering serie',
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
            description: 'Document type',
          },
          serieId: {
            type: 'string',
            description: 'Serie ID to delete',
          },
        },
        required: ['docType', 'serieId'],
      },
      handler: async (args: { docType: string; serieId: string }) => {
        return client.delete(`/numberseries/${args.docType}/${args.serieId}`);
      },
    },
  };
}
