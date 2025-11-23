import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from './mock-client.js';
import { getServiceTools } from '../tools/services.js';

describe('Service Tools', () => {
  let client: ReturnType<typeof createMockClient>;
  let tools: ReturnType<typeof getServiceTools>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    tools = getServiceTools(client);
  });

  describe('list_services', () => {
    it('should list all services', async () => {
      await tools.list_services.handler({});
      expect(client.get).toHaveBeenCalledWith('/services', {});
    });

    it('should support pagination', async () => {
      await tools.list_services.handler({ page: 2 });
      expect(client.get).toHaveBeenCalledWith('/services', { page: 2 });
    });
  });

  describe('create_service', () => {
    it('should create a service with required fields', async () => {
      await tools.create_service.handler({ name: 'Consulting' });
      expect(client.post).toHaveBeenCalledWith('/services', { name: 'Consulting' });
    });

    it('should include optional fields', async () => {
      const args = {
        name: 'Consulting',
        sku: 'SRV-001',
        price: 150,
        tax: 21,
        description: 'Professional consulting services',
      };
      await tools.create_service.handler(args);
      expect(client.post).toHaveBeenCalledWith('/services', args);
    });
  });

  describe('get_service', () => {
    it('should get a service by ID', async () => {
      await tools.get_service.handler({ serviceId: 'service-123' });
      expect(client.get).toHaveBeenCalledWith('/services/service-123');
    });
  });

  describe('update_service', () => {
    it('should update a service', async () => {
      const args = {
        serviceId: 'service-123',
        name: 'Updated Service',
        price: 200,
      };
      await tools.update_service.handler(args);
      expect(client.put).toHaveBeenCalledWith('/services/service-123', {
        name: 'Updated Service',
        price: 200,
      });
    });
  });

  describe('delete_service', () => {
    it('should delete a service', async () => {
      await tools.delete_service.handler({ serviceId: 'service-123' });
      expect(client.delete).toHaveBeenCalledWith('/services/service-123');
    });
  });
});
