import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from './mock-client.js';
import { getSalesChannelTools } from '../tools/sales-channels.js';

describe('Sales Channel Tools', () => {
  let client: ReturnType<typeof createMockClient>;
  let tools: ReturnType<typeof getSalesChannelTools>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    tools = getSalesChannelTools(client);
  });

  describe('list_sales_channels', () => {
    it('should list all sales channels', async () => {
      await tools.list_sales_channels.handler();
      expect(client.get).toHaveBeenCalledWith('/saleschannels');
    });
  });

  describe('create_sales_channel', () => {
    it('should create a sales channel', async () => {
      await tools.create_sales_channel.handler({ name: 'Online Store' });
      expect(client.post).toHaveBeenCalledWith('/saleschannels', { name: 'Online Store' });
    });
  });

  describe('get_sales_channel', () => {
    it('should get a sales channel by ID', async () => {
      await tools.get_sales_channel.handler({ channelId: 'channel-123' });
      expect(client.get).toHaveBeenCalledWith('/saleschannels/channel-123');
    });
  });

  describe('update_sales_channel', () => {
    it('should update a sales channel', async () => {
      const args = {
        channelId: 'channel-123',
        name: 'Updated Channel',
      };
      await tools.update_sales_channel.handler(args);
      expect(client.put).toHaveBeenCalledWith('/saleschannels/channel-123', {
        name: 'Updated Channel',
      });
    });
  });

  describe('delete_sales_channel', () => {
    it('should delete a sales channel', async () => {
      await tools.delete_sales_channel.handler({ channelId: 'channel-123' });
      expect(client.delete).toHaveBeenCalledWith('/saleschannels/channel-123');
    });
  });
});
