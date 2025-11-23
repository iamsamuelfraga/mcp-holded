import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from './mock-client.js';
import { getRemittanceTools } from '../tools/remittances.js';

describe('Remittance Tools', () => {
  let client: ReturnType<typeof createMockClient>;
  let tools: ReturnType<typeof getRemittanceTools>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    tools = getRemittanceTools(client);
  });

  describe('list_remittances', () => {
    it('should list all remittances', async () => {
      await tools.list_remittances.handler();
      expect(client.get).toHaveBeenCalledWith('/remittances');
    });
  });

  describe('get_remittance', () => {
    it('should get a remittance by ID', async () => {
      await tools.get_remittance.handler({ remittanceId: 'remittance-123' });
      expect(client.get).toHaveBeenCalledWith('/remittances/remittance-123');
    });
  });
});
