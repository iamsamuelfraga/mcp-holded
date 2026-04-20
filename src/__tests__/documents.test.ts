import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from './mock-client.js';
import { getDocumentTools } from '../tools/documents.js';
import {
  documentItemSchema,
  docTypeEnum,
  documentIdSchema,
  listDocumentsSchema,
  updateDocumentPipelineSchema,
  attachFileToDocumentSchema,
  shipItemsByLineSchema,
  payDocumentSchema,
  sendDocumentSchema,
  updateDocumentTrackingSchema,
  createDocumentSchema,
  updateDocumentSchema,
  numberingSerieIdSchema,
  createNumberingSerieSchema,
} from '../validation.js';

describe('Document Tools', () => {
  let client: ReturnType<typeof createMockClient>;
  let tools: ReturnType<typeof getDocumentTools>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    tools = getDocumentTools(client);
  });

  describe('list_documents', () => {
    it('should list documents of a specific type', async () => {
      await tools.list_documents.handler({ docType: 'invoice' });
      expect(client.get).toHaveBeenCalledWith('/documents/invoice', {});
    });

    it('should support pagination with page parameter', async () => {
      await tools.list_documents.handler({ docType: 'invoice', page: 2 });
      expect(client.get).toHaveBeenCalledWith('/documents/invoice', { page: 2 });
    });

    it('should handle requests with only docType', async () => {
      await tools.list_documents.handler({ docType: 'invoice' });
      expect(client.get).toHaveBeenCalledWith('/documents/invoice', {});
    });

    it('should support limit parameter for virtual pagination', async () => {
      await tools.list_documents.handler({ docType: 'invoice', limit: 20 });
      expect(client.get).toHaveBeenCalledWith('/documents/invoice', { limit: 20 });
    });

    it('should support summary mode', async () => {
      await tools.list_documents.handler({ docType: 'invoice', summary: true });
      expect(client.get).toHaveBeenCalledWith('/documents/invoice', {});
    });

    it('should work with different document types', async () => {
      await tools.list_documents.handler({ docType: 'estimate' });
      expect(client.get).toHaveBeenCalledWith('/documents/estimate', {});
    });

    it('should support combining pagination parameters', async () => {
      await tools.list_documents.handler({
        docType: 'salesorder',
        page: 3,
      });
      expect(client.get).toHaveBeenCalledWith('/documents/salesorder', { page: 3 });
    });

    it('should support summary mode with pagination', async () => {
      await tools.list_documents.handler({
        docType: 'invoice',
        page: 1,
        summary: true,
      });
      expect(client.get).toHaveBeenCalledWith('/documents/invoice', { page: 1 });
    });

    it('should handle all document types correctly', async () => {
      const docTypes = ['invoice', 'estimate', 'salesorder', 'purchaseorder', 'waybill'];
      for (const docType of docTypes) {
        await tools.list_documents.handler({ docType: docType as any });
        expect(client.get).toHaveBeenCalledWith(`/documents/${docType}`, {});
      }
    });

    it('should support limit without pagination for virtual pagination', async () => {
      await tools.list_documents.handler({
        docType: 'invoice',
        limit: 5,
        summary: false,
      });
      expect(client.get).toHaveBeenCalledWith('/documents/invoice', { limit: 5 });
    });
  });

  describe('create_document', () => {
    it('should create a document with required fields including date as Unix timestamp', async () => {
      const args = {
        docType: 'invoice' as const,
        contactId: 'contact-123',
        items: [{ name: 'Item 1', units: 1, subtotal: 100 }],
        date: 1700000000,
      };
      await tools.create_document.handler(args);
      expect(client.post).toHaveBeenCalledWith('/documents/invoice', {
        contactId: 'contact-123',
        items: [{ name: 'Item 1', units: 1, subtotal: 100 }],
        date: 1700000000,
      });
    });

    it('should reject date as string (must be Unix timestamp integer)', async () => {
      await expect(
        tools.create_document.handler({
          docType: 'invoice' as const,
          contactId: 'contact-123',
          items: [],
          date: '2024-01-15' as any,
        })
      ).rejects.toThrow();
    });

    it('should reject missing date field', async () => {
      await expect(
        tools.create_document.handler({
          docType: 'invoice' as const,
          contactId: 'contact-123',
          items: [],
        } as any)
      ).rejects.toThrow();
    });

    it('should include optional fields alongside required date', async () => {
      const args = {
        docType: 'invoice' as const,
        contactId: 'contact-123',
        items: [],
        date: 1700000000,
        notes: 'Test notes',
        currency: 'EUR',
      };
      await tools.create_document.handler(args);
      expect(client.post).toHaveBeenCalledWith('/documents/invoice', {
        contactId: 'contact-123',
        items: [],
        date: 1700000000,
        notes: 'Test notes',
        currency: 'EUR',
      });
    });

    it('should accept date as current Unix timestamp', async () => {
      const now = Math.floor(Date.now() / 1000);
      const args = {
        docType: 'estimate' as const,
        contactId: 'contact-456',
        items: [{ name: 'Service', units: 1, subtotal: 200 }],
        date: now,
      };
      await tools.create_document.handler(args);
      expect(client.post).toHaveBeenCalledWith('/documents/estimate', {
        contactId: 'contact-456',
        items: [{ name: 'Service', units: 1, subtotal: 200 }],
        date: now,
      });
    });

    it('should accept extended docTypes: salesreceipt, creditnote, receiptnote, purchaserefund', async () => {
      const extendedTypes = [
        'salesreceipt',
        'creditnote',
        'receiptnote',
        'purchaserefund',
      ] as const;
      for (const docType of extendedTypes) {
        const args = {
          docType,
          contactId: 'contact-123',
          items: [],
          date: 1700000000,
        };
        await tools.create_document.handler(args);
        expect(client.post).toHaveBeenCalledWith(`/documents/${docType}`, {
          contactId: 'contact-123',
          items: [],
          date: 1700000000,
        });
      }
    });
  });

  describe('get_document', () => {
    it('should get a document by ID', async () => {
      await tools.get_document.handler({ docType: 'invoice', documentId: 'doc-123' });
      expect(client.get).toHaveBeenCalledWith('/documents/invoice/doc-123');
    });
  });

  describe('update_document', () => {
    it('should update a document', async () => {
      const args = {
        docType: 'invoice' as const,
        documentId: 'doc-123',
        notes: 'Updated notes',
      };
      await tools.update_document.handler(args);
      expect(client.put).toHaveBeenCalledWith('/documents/invoice/doc-123', {
        notes: 'Updated notes',
      });
    });

    it('should accept date as Unix timestamp integer when updating', async () => {
      const args = {
        docType: 'invoice' as const,
        documentId: 'doc-123',
        date: 1700086400,
        notes: 'Revised notes',
      };
      await tools.update_document.handler(args);
      expect(client.put).toHaveBeenCalledWith('/documents/invoice/doc-123', {
        date: 1700086400,
        notes: 'Revised notes',
      });
    });

    it('should reject date as string when updating', async () => {
      await expect(
        tools.update_document.handler({
          docType: 'invoice' as const,
          documentId: 'doc-123',
          date: '2024-01-15' as any,
        })
      ).rejects.toThrow();
    });

    it('should accept currency field when updating a document', async () => {
      const args = {
        docType: 'invoice' as const,
        documentId: 'doc-123',
        currency: 'USD',
      };
      await tools.update_document.handler(args);
      expect(client.put).toHaveBeenCalledWith('/documents/invoice/doc-123', {
        currency: 'USD',
      });
    });

    it('inputSchema should include currency field in update_document', () => {
      expect(tools.update_document.inputSchema.properties).toHaveProperty('currency');
    });
  });

  describe('delete_document', () => {
    it('should delete a document', async () => {
      await tools.delete_document.handler({ docType: 'invoice', documentId: 'doc-123' });
      expect(client.delete).toHaveBeenCalledWith('/documents/invoice/doc-123');
    });
  });

  describe('pay_document', () => {
    it('should register a payment', async () => {
      const args = {
        docType: 'invoice' as const,
        documentId: 'doc-123',
        amount: 100,
        date: 1700000000,
      };
      await tools.pay_document.handler(args);
      expect(client.post).toHaveBeenCalledWith('/documents/invoice/doc-123/pay', {
        amount: 100,
        date: 1700000000,
      });
    });
  });

  describe('send_document', () => {
    it('should send a document by email', async () => {
      const args = {
        docType: 'invoice' as const,
        documentId: 'doc-123',
        emails: ['test@example.com'],
        subject: 'Invoice',
        message: 'Please find attached',
      };
      await tools.send_document.handler(args);
      expect(client.post).toHaveBeenCalledWith('/documents/invoice/doc-123/send', {
        emails: ['test@example.com'],
        subject: 'Invoice',
        message: 'Please find attached',
      });
    });

    it('should send a document without emails (emails is optional)', async () => {
      // emails is optional — the document can be sent to the contact associated with it
      const args = {
        docType: 'invoice' as const,
        documentId: 'doc-123',
        subject: 'Invoice',
        message: 'Please find attached',
      };
      await tools.send_document.handler(args);
      expect(client.post).toHaveBeenCalledWith('/documents/invoice/doc-123/send', {
        subject: 'Invoice',
        message: 'Please find attached',
      });
    });

    it('should send a document with only required fields (docType and documentId)', async () => {
      const args = {
        docType: 'invoice' as const,
        documentId: 'doc-123',
      };
      await tools.send_document.handler(args);
      expect(client.post).toHaveBeenCalledWith('/documents/invoice/doc-123/send', {});
    });

    it('should reject invalid email addresses in emails array', async () => {
      await expect(
        tools.send_document.handler({
          docType: 'invoice' as const,
          documentId: 'doc-123',
          emails: ['not-an-email'],
        })
      ).rejects.toThrow();
    });

    it('inputSchema should not include emails in required array', () => {
      expect(tools.send_document.inputSchema.required).not.toContain('emails');
      expect(tools.send_document.inputSchema.required).toContain('docType');
      expect(tools.send_document.inputSchema.required).toContain('documentId');
    });
  });

  describe('get_document_pdf', () => {
    it('should get document PDF', async () => {
      await tools.get_document_pdf.handler({ docType: 'invoice', documentId: 'doc-123' });
      expect(client.get).toHaveBeenCalledWith('/documents/invoice/doc-123/pdf');
    });
  });

  describe('ship_all_items', () => {
    it('should ship all items', async () => {
      await tools.ship_all_items.handler({ docType: 'salesorder', documentId: 'doc-123' });
      expect(client.post).toHaveBeenCalledWith('/documents/salesorder/doc-123/ship');
    });
  });

  describe('ship_items_by_line', () => {
    it('should ship specific items by line', async () => {
      const args = {
        docType: 'salesorder' as const,
        documentId: 'doc-123',
        lines: [{ lineId: 'line-1', units: 5 }],
      };
      await tools.ship_items_by_line.handler(args);
      expect(client.post).toHaveBeenCalledWith('/documents/salesorder/doc-123/ship', {
        lines: [{ lineId: 'line-1', units: 5 }],
      });
    });
  });

  describe('get_shipped_units', () => {
    it('should get shipped units', async () => {
      await tools.get_shipped_units.handler({ docType: 'salesorder', documentId: 'doc-123' });
      expect(client.get).toHaveBeenCalledWith('/documents/salesorder/doc-123/shipped');
    });
  });

  describe('attach_file_to_document', () => {
    it('should attach a file', async () => {
      const args = {
        docType: 'invoice' as const,
        documentId: 'doc-123',
        fileBase64: 'SGVsbG8gV29ybGQ=',
        filename: 'test.pdf',
      };
      await tools.attach_file_to_document.handler(args);
      expect(client.uploadFile).toHaveBeenCalledWith(
        '/documents/invoice/doc-123/attach',
        expect.any(Buffer),
        'test.pdf'
      );
    });
  });

  describe('update_document_tracking', () => {
    it('should update tracking info', async () => {
      const args = {
        docType: 'salesorder' as const,
        documentId: 'doc-123',
        trackingNumber: 'TRACK123',
        carrier: 'DHL',
      };
      await tools.update_document_tracking.handler(args);
      expect(client.post).toHaveBeenCalledWith('/documents/salesorder/doc-123/tracking', {
        trackingNumber: 'TRACK123',
        carrier: 'DHL',
      });
    });
  });

  describe('update_document_pipeline', () => {
    it('should update pipeline stage', async () => {
      const args = {
        docType: 'estimate' as const,
        documentId: 'doc-123',
        pipelineId: 'pipe-1',
        stageId: 'stage-2',
      };
      await tools.update_document_pipeline.handler(args);
      expect(client.post).toHaveBeenCalledWith('/documents/estimate/doc-123/pipeline', {
        pipelineId: 'pipe-1',
        stageId: 'stage-2',
      });
    });
  });

  describe('list_payment_methods', () => {
    it('should list payment methods', async () => {
      await tools.list_payment_methods.handler();
      expect(client.get).toHaveBeenCalledWith('/paymentmethods');
    });
  });

  describe('invoiceNum field', () => {
    it('should include invoiceNum in create_document inputSchema', () => {
      expect(tools.create_document.inputSchema.properties).toHaveProperty('invoiceNum');
    });

    it('should include invoiceNum in update_document inputSchema', () => {
      expect(tools.update_document.inputSchema.properties).toHaveProperty('invoiceNum');
    });

    it('should pass invoiceNum to the API on create', async () => {
      await tools.create_document.handler({
        docType: 'purchase' as const,
        contactId: 'contact-123',
        items: [{ name: 'Part A', units: 2, subtotal: 50 }],
        date: 1700000000,
        invoiceNum: 'PROV-2024-001',
      });
      expect(client.post).toHaveBeenCalledWith('/documents/purchase', {
        contactId: 'contact-123',
        items: [{ name: 'Part A', units: 2, subtotal: 50 }],
        date: 1700000000,
        invoiceNum: 'PROV-2024-001',
      });
    });

    it('should pass invoiceNum to the API on update', async () => {
      await tools.update_document.handler({
        docType: 'invoice' as const,
        documentId: 'doc-123',
        invoiceNum: 'INV-2024-007',
      });
      expect(client.put).toHaveBeenCalledWith('/documents/invoice/doc-123', {
        invoiceNum: 'INV-2024-007',
      });
    });

    it('should not require invoiceNum (optional field)', async () => {
      const args = {
        docType: 'invoice' as const,
        contactId: 'contact-123',
        items: [],
        date: 1700000000,
      };
      await expect(tools.create_document.handler(args)).resolves.not.toThrow();
    });
  });

  describe('taxes array per line item', () => {
    it('documentItemSchema should accept taxes array with exactly 1 element', () => {
      const result = documentItemSchema.safeParse({
        name: 'Service X',
        units: 1,
        subtotal: 100,
        taxes: ['tax-id-holded'],
      });
      expect(result.success).toBe(true);
    });

    it('documentItemSchema should reject taxes array with more than 1 element', () => {
      const result = documentItemSchema.safeParse({
        name: 'Service X',
        units: 1,
        subtotal: 100,
        taxes: ['tax-id-1', 'tax-id-2'],
      });
      expect(result.success).toBe(false);
    });

    it('documentItemSchema should accept taxes as undefined (optional)', () => {
      const result = documentItemSchema.safeParse({
        name: 'Service X',
        units: 1,
        subtotal: 100,
      });
      expect(result.success).toBe(true);
    });

    it('documentItemSchema should accept both tax (number) and taxes (array) simultaneously for backward compatibility', () => {
      const result = documentItemSchema.safeParse({
        name: 'Service X',
        units: 1,
        subtotal: 100,
        tax: 21,
        taxes: ['holded-tax-id'],
      });
      expect(result.success).toBe(true);
    });

    it('create_document inputSchema should include taxes with maxItems: 1 on line items', () => {
      const itemsSchema = (tools.create_document.inputSchema.properties as any).items;
      expect(itemsSchema.items.properties.taxes.maxItems).toBe(1);
      expect(itemsSchema.items.properties.taxes.minItems).toBe(1);
    });

    it('update_document inputSchema should include taxes with maxItems: 1 on line items', () => {
      const itemsSchema = (tools.update_document.inputSchema.properties as any).items;
      expect(itemsSchema.items.properties.taxes.maxItems).toBe(1);
    });

    it('should pass taxes array in line items to the API on create', async () => {
      await tools.create_document.handler({
        docType: 'invoice' as const,
        contactId: 'contact-123',
        items: [{ name: 'Service A', units: 1, subtotal: 200, taxes: ['holded-tax-123'] }],
        date: 1700000000,
      });
      expect(client.post).toHaveBeenCalledWith('/documents/invoice', {
        contactId: 'contact-123',
        items: [{ name: 'Service A', units: 1, subtotal: 200, taxes: ['holded-tax-123'] }],
        date: 1700000000,
      });
    });
  });

  describe('salesChannelId field', () => {
    it('should include salesChannelId in create_document inputSchema', () => {
      expect(tools.create_document.inputSchema.properties).toHaveProperty('salesChannelId');
    });

    it('should include salesChannelId in update_document inputSchema', () => {
      expect(tools.update_document.inputSchema.properties).toHaveProperty('salesChannelId');
    });

    it('should pass salesChannelId to the API on create', async () => {
      await tools.create_document.handler({
        docType: 'invoice' as const,
        contactId: 'contact-123',
        items: [{ name: 'Item', units: 1, subtotal: 100 }],
        date: 1700000000,
        salesChannelId: 'channel-abc',
      });
      expect(client.post).toHaveBeenCalledWith('/documents/invoice', {
        contactId: 'contact-123',
        items: [{ name: 'Item', units: 1, subtotal: 100 }],
        date: 1700000000,
        salesChannelId: 'channel-abc',
      });
    });

    it('should pass salesChannelId to the API on update', async () => {
      await tools.update_document.handler({
        docType: 'invoice' as const,
        documentId: 'doc-123',
        salesChannelId: 'channel-xyz',
      });
      expect(client.put).toHaveBeenCalledWith('/documents/invoice/doc-123', {
        salesChannelId: 'channel-xyz',
      });
    });
  });

  describe('expAccountId field', () => {
    it('should include expAccountId in create_document inputSchema', () => {
      expect(tools.create_document.inputSchema.properties).toHaveProperty('expAccountId');
    });

    it('should include expAccountId in update_document inputSchema', () => {
      expect(tools.update_document.inputSchema.properties).toHaveProperty('expAccountId');
    });

    it('should pass expAccountId to the API on create', async () => {
      await tools.create_document.handler({
        docType: 'purchase' as const,
        contactId: 'contact-123',
        items: [{ name: 'Office Supply', units: 1, subtotal: 50 }],
        date: 1700000000,
        expAccountId: 'exp-account-456',
      });
      expect(client.post).toHaveBeenCalledWith('/documents/purchase', {
        contactId: 'contact-123',
        items: [{ name: 'Office Supply', units: 1, subtotal: 50 }],
        date: 1700000000,
        expAccountId: 'exp-account-456',
      });
    });

    it('should pass expAccountId to the API on update', async () => {
      await tools.update_document.handler({
        docType: 'purchase' as const,
        documentId: 'doc-456',
        expAccountId: 'exp-account-789',
      });
      expect(client.put).toHaveBeenCalledWith('/documents/purchase/doc-456', {
        expAccountId: 'exp-account-789',
      });
    });
  });

  describe('documentItemSchema validation', () => {
    it('should require name, units, and subtotal', () => {
      const result = documentItemSchema.safeParse({ name: 'A', units: 1, subtotal: 100 });
      expect(result.success).toBe(true);
    });

    it('should reject item missing name', () => {
      const result = documentItemSchema.safeParse({ units: 1, subtotal: 100 });
      expect(result.success).toBe(false);
    });

    it('should reject item missing units', () => {
      const result = documentItemSchema.safeParse({ name: 'A', subtotal: 100 });
      expect(result.success).toBe(false);
    });

    it('should reject item missing subtotal', () => {
      const result = documentItemSchema.safeParse({ name: 'A', units: 1 });
      expect(result.success).toBe(false);
    });

    it('should accept all optional fields', () => {
      const result = documentItemSchema.safeParse({
        name: 'Product',
        units: 3,
        subtotal: 300,
        desc: 'A detailed description',
        sku: 'SKU-001',
        tax: 21,
        taxes: ['holded-tax-id'],
        discount: 10,
        serviceId: 'service-abc',
      });
      expect(result.success).toBe(true);
    });

    it('should pass through unknown fields (passthrough)', () => {
      const result = documentItemSchema.safeParse({
        name: 'X',
        units: 1,
        subtotal: 10,
        unknownApiField: 'some-value',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect((result.data as any).unknownApiField).toBe('some-value');
      }
    });

    it('should reject tax value above 100', () => {
      const result = documentItemSchema.safeParse({
        name: 'X',
        units: 1,
        subtotal: 10,
        tax: 150,
      });
      expect(result.success).toBe(false);
    });

    it('should reject discount value above 100', () => {
      const result = documentItemSchema.safeParse({
        name: 'X',
        units: 1,
        subtotal: 10,
        discount: 110,
      });
      expect(result.success).toBe(false);
    });

    it('should reject taxes array with more than 1 element', () => {
      const result = documentItemSchema.safeParse({
        name: 'X',
        units: 1,
        subtotal: 10,
        taxes: ['id-1', 'id-2'],
      });
      expect(result.success).toBe(false);
    });

    it('create_document should reject items with missing required line item fields', async () => {
      await expect(
        tools.create_document.handler({
          docType: 'invoice' as const,
          contactId: 'contact-123',
          items: [{ units: 1, subtotal: 100 } as any],
          date: 1700000000,
        })
      ).rejects.toThrow();
    });
  });

  describe('update_document item validation', () => {
    it('should reject items without name when updating a document', async () => {
      await expect(
        tools.update_document.handler({
          docType: 'invoice' as const,
          documentId: 'doc-123',
          items: [{ units: 2, subtotal: 100 } as any],
        })
      ).rejects.toThrow();
    });

    it('should reject items without units when updating a document', async () => {
      await expect(
        tools.update_document.handler({
          docType: 'invoice' as const,
          documentId: 'doc-123',
          items: [{ name: 'Service A', subtotal: 100 } as any],
        })
      ).rejects.toThrow();
    });

    it('should reject items without subtotal when updating a document', async () => {
      await expect(
        tools.update_document.handler({
          docType: 'invoice' as const,
          documentId: 'doc-123',
          items: [{ name: 'Service A', units: 1 } as any],
        })
      ).rejects.toThrow();
    });

    it('should accept valid items when updating a document', async () => {
      await expect(
        tools.update_document.handler({
          docType: 'invoice' as const,
          documentId: 'doc-123',
          items: [{ name: 'Service A', units: 1, subtotal: 100 }],
        })
      ).resolves.not.toThrow();
    });
  });

  describe('docTypeEnum consistency — regression prevention', () => {
    /**
     * This test ensures that ALL document-related schemas reference the same
     * shared docTypeEnum constant, preventing future regressions where a new
     * document type is added to some schemas but not others.
     *
     * The test works by verifying that each schema accepts every value from
     * docTypeEnum.options — if any schema uses a narrower enum, this will fail.
     */
    const ALL_DOC_TYPES = docTypeEnum.options;

    const schemasWithDocType: Array<{ name: string; parse: (docType: string) => unknown }> = [
      {
        name: 'documentIdSchema',
        parse: (docType) => documentIdSchema.safeParse({ docType, documentId: 'id-1' }),
      },
      {
        name: 'listDocumentsSchema',
        parse: (docType) => listDocumentsSchema.safeParse({ docType }),
      },
      {
        name: 'updateDocumentPipelineSchema',
        parse: (docType) =>
          updateDocumentPipelineSchema.safeParse({
            docType,
            documentId: 'id-1',
            pipelineId: 'pipe-1',
            stageId: 'stage-1',
          }),
      },
      {
        name: 'attachFileToDocumentSchema',
        parse: (docType) =>
          attachFileToDocumentSchema.safeParse({
            docType,
            documentId: 'id-1',
            fileBase64: 'abc',
            filename: 'test.pdf',
          }),
      },
      {
        name: 'shipItemsByLineSchema',
        parse: (docType) =>
          shipItemsByLineSchema.safeParse({ docType, documentId: 'id-1', lines: [] }),
      },
      {
        name: 'payDocumentSchema',
        parse: (docType) => payDocumentSchema.safeParse({ docType, documentId: 'id-1' }),
      },
      {
        name: 'sendDocumentSchema',
        parse: (docType) => sendDocumentSchema.safeParse({ docType, documentId: 'id-1' }),
      },
      {
        name: 'updateDocumentTrackingSchema',
        parse: (docType) => updateDocumentTrackingSchema.safeParse({ docType, documentId: 'id-1' }),
      },
      {
        name: 'createDocumentSchema',
        parse: (docType) =>
          createDocumentSchema.safeParse({
            docType,
            contactId: 'contact-1',
            items: [],
            date: 1700000000,
          }),
      },
      {
        name: 'updateDocumentSchema',
        parse: (docType) => updateDocumentSchema.safeParse({ docType, documentId: 'id-1' }),
      },
      {
        name: 'numberingSerieIdSchema',
        parse: (docType) => numberingSerieIdSchema.safeParse({ docType, serieId: 'serie-1' }),
      },
      {
        name: 'createNumberingSerieSchema',
        parse: (docType) => createNumberingSerieSchema.safeParse({ docType, name: 'Serie A' }),
      },
    ];

    for (const schema of schemasWithDocType) {
      it(`${schema.name} should accept all docTypeEnum values`, () => {
        for (const docType of ALL_DOC_TYPES) {
          const result = schema.parse(docType) as { success: boolean };
          expect(result.success, `${schema.name} rejected docType "${docType}"`).toBe(true);
        }
      });
    }

    it('should reject unknown docType in all schemas', () => {
      for (const schema of schemasWithDocType) {
        const result = schema.parse('unknowntype') as { success: boolean };
        expect(result.success, `${schema.name} unexpectedly accepted "unknowntype"`).toBe(false);
      }
    });
  });

  describe('payDocumentSchema.date integer validation', () => {
    it('should accept integer Unix timestamp for payment date', () => {
      const result = payDocumentSchema.safeParse({
        docType: 'invoice',
        documentId: 'doc-123',
        date: 1700000000,
      });
      expect(result.success).toBe(true);
    });

    it('should reject float (non-integer) payment date', () => {
      const result = payDocumentSchema.safeParse({
        docType: 'invoice',
        documentId: 'doc-123',
        date: 1700000000.5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('documentItemSchema taxes empty array rejection', () => {
    it('should reject taxes as empty array (min 1 required when provided)', () => {
      const result = documentItemSchema.safeParse({
        name: 'Service X',
        units: 1,
        subtotal: 100,
        taxes: [],
      });
      expect(result.success).toBe(false);
    });

    it('should accept taxes with exactly 1 element', () => {
      const result = documentItemSchema.safeParse({
        name: 'Service X',
        units: 1,
        subtotal: 100,
        taxes: ['holded-tax-id'],
      });
      expect(result.success).toBe(true);
    });

    it('should reject taxes with more than 1 element', () => {
      const result = documentItemSchema.safeParse({
        name: 'Service X',
        units: 1,
        subtotal: 100,
        taxes: ['tax-1', 'tax-2'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Virtual pagination', () => {
    it('should return first page of results with page=1', async () => {
      // Mock 100 documents
      const mockDocuments = Array.from({ length: 100 }, (_, i) => ({
        id: `doc-${i + 1}`,
        contact: `contact-${i + 1}`,
        contactName: `Contact ${i + 1}`,
        date: 1700000000 + i * 86400,
        tax: 21,
        total: (i + 1) * 100,
        status: 1,
      }));
      client.get = vi.fn().mockResolvedValue(mockDocuments);

      const result = (await tools.list_documents.handler({
        docType: 'invoice',
        page: 1,
        limit: 10,
      })) as any;

      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe('doc-1');
      expect(result.items[9].id).toBe('doc-10');
      expect(result.page).toBe(1);
      expect(result.totalItems).toBe(100);
      expect(result.totalPages).toBe(10);
      expect(result.hasMore).toBe(true);
    });

    it('should return second page of results with page=2', async () => {
      const mockDocuments = Array.from({ length: 100 }, (_, i) => ({
        id: `doc-${i + 1}`,
        contact: `contact-${i + 1}`,
        contactName: `Contact ${i + 1}`,
        date: 1700000000 + i * 86400,
        tax: 21,
        total: (i + 1) * 100,
        status: 1,
      }));
      client.get = vi.fn().mockResolvedValue(mockDocuments);

      const result = (await tools.list_documents.handler({
        docType: 'invoice',
        page: 2,
        limit: 10,
      })) as any;

      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe('doc-11');
      expect(result.items[9].id).toBe('doc-20');
      expect(result.page).toBe(2);
      expect(result.hasMore).toBe(true);
    });

    it('should return last page with hasMore=false', async () => {
      const mockDocuments = Array.from({ length: 25 }, (_, i) => ({
        id: `doc-${i + 1}`,
        contact: `contact-${i + 1}`,
        contactName: `Contact ${i + 1}`,
        date: 1700000000 + i * 86400,
        tax: 21,
        total: (i + 1) * 100,
        status: 1,
      }));
      client.get = vi.fn().mockResolvedValue(mockDocuments);

      const result = (await tools.list_documents.handler({
        docType: 'invoice',
        page: 3,
        limit: 10,
      })) as any;

      expect(result.items).toHaveLength(5);
      expect(result.items[0].id).toBe('doc-21');
      expect(result.items[4].id).toBe('doc-25');
      expect(result.hasMore).toBe(false);
    });

    it('should return summary with pagination metadata', async () => {
      const mockDocuments = Array.from({ length: 75 }, (_, i) => ({
        id: `doc-${i + 1}`,
        contact: `contact-${i + 1}`,
        contactName: `Contact ${i + 1}`,
        date: 1700000000 + i * 86400,
        tax: 21,
        total: (i + 1) * 100,
        status: 1,
      }));
      client.get = vi.fn().mockResolvedValue(mockDocuments);

      const result = (await tools.list_documents.handler({
        docType: 'invoice',
        page: 2,
        limit: 20,
        summary: true,
      })) as any;

      expect(result.count).toBe(75);
      expect(result.totalPages).toBe(4);
      expect(result.currentPage).toBe(2);
      expect(result.hasMore).toBe(true);
    });

    it('should default to page 1 when page is not specified', async () => {
      const mockDocuments = Array.from({ length: 30 }, (_, i) => ({
        id: `doc-${i + 1}`,
        contact: `contact-${i + 1}`,
        contactName: `Contact ${i + 1}`,
        date: 1700000000 + i * 86400,
        tax: 21,
        total: (i + 1) * 100,
        status: 1,
      }));
      client.get = vi.fn().mockResolvedValue(mockDocuments);

      const result = (await tools.list_documents.handler({ docType: 'invoice', limit: 10 })) as any;

      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe('doc-1');
      expect(result.page).toBe(1);
    });
  });
});
