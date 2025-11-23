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

    it('should support pagination', async () => {
      await tools.list_documents.handler({ docType: 'invoice', page: 2 });
      expect(client.get).toHaveBeenCalledWith('/documents/invoice', { page: 2 });
    });

    it('should work with different document types', async () => {
      await tools.list_documents.handler({ docType: 'estimate' });
      expect(client.get).toHaveBeenCalledWith('/documents/estimate', {});
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
});
