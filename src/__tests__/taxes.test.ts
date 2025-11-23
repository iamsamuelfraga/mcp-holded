import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from './mock-client.js';
import { getTaxTools } from '../tools/taxes.js';

describe('Tax Tools', () => {
  let client: ReturnType<typeof createMockClient>;
  let tools: ReturnType<typeof getTaxTools>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    tools = getTaxTools(client);
  });

  describe('get_taxes', () => {
    it('should get all taxes', async () => {
      await tools.get_taxes.handler();
      expect(client.get).toHaveBeenCalledWith('/taxes');
    });
  });
});
