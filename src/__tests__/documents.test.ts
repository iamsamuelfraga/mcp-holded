import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from './mock-client.js';
import { getDocumentTools } from '../tools/documents.js';

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
    it('should create a document with required fields', async () => {
      const args = {
        docType: 'invoice' as const,
        contactId: 'contact-123',
        items: [{ name: 'Item 1', units: 1, subtotal: 100 }],
      };
      await tools.create_document.handler(args);
      expect(client.post).toHaveBeenCalledWith('/documents/invoice', {
        contactId: 'contact-123',
        items: [{ name: 'Item 1', units: 1, subtotal: 100 }],
      });
    });

    it('should include optional fields', async () => {
      const args = {
        docType: 'invoice' as const,
        contactId: 'contact-123',
        items: [],
        notes: 'Test notes',
        currency: 'EUR',
      };
      await tools.create_document.handler(args);
      expect(client.post).toHaveBeenCalledWith('/documents/invoice', {
        contactId: 'contact-123',
        items: [],
        notes: 'Test notes',
        currency: 'EUR',
      });
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
