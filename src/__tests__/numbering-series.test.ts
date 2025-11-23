import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from './mock-client.js';
import { getNumberingSeriesTools } from '../tools/numbering-series.js';

describe('Numbering Series Tools', () => {
  let client: ReturnType<typeof createMockClient>;
  let tools: ReturnType<typeof getNumberingSeriesTools>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    tools = getNumberingSeriesTools(client);
  });

  describe('get_numbering_series', () => {
    it('should get numbering series for a document type', async () => {
      await tools.get_numbering_series.handler({ docType: 'invoice' });
      expect(client.get).toHaveBeenCalledWith('/numberseries/invoice');
    });

    it('should work with different document types', async () => {
      await tools.get_numbering_series.handler({ docType: 'estimate' });
      expect(client.get).toHaveBeenCalledWith('/numberseries/estimate');
    });
  });

  describe('create_numbering_serie', () => {
    it('should create a numbering serie', async () => {
      const args = {
        docType: 'invoice',
        name: '2024 Series',
      };
      await tools.create_numbering_serie.handler(args);
      expect(client.post).toHaveBeenCalledWith('/numberseries/invoice', {
        name: '2024 Series',
      });
    });

    it('should include optional fields', async () => {
      const args = {
        docType: 'invoice',
        name: '2024 Series',
        prefix: 'INV-2024-',
        nextNumber: 1,
      };
      await tools.create_numbering_serie.handler(args);
      expect(client.post).toHaveBeenCalledWith('/numberseries/invoice', {
        name: '2024 Series',
        prefix: 'INV-2024-',
        nextNumber: 1,
      });
    });
  });

  describe('update_numbering_serie', () => {
    it('should update a numbering serie', async () => {
      const args = {
        docType: 'invoice',
        serieId: 'serie-123',
        name: 'Updated Series',
        nextNumber: 100,
      };
      await tools.update_numbering_serie.handler(args);
      expect(client.put).toHaveBeenCalledWith('/numberseries/invoice/serie-123', {
        name: 'Updated Series',
        nextNumber: 100,
      });
    });
  });

  describe('delete_numbering_serie', () => {
    it('should delete a numbering serie', async () => {
      await tools.delete_numbering_serie.handler({
        docType: 'invoice',
        serieId: 'serie-123',
      });
      expect(client.delete).toHaveBeenCalledWith('/numberseries/invoice/serie-123');
    });
  });
});
