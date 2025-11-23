import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from './mock-client.js';
import { getWarehouseTools } from '../tools/warehouses.js';

describe('Warehouse Tools', () => {
  let client: ReturnType<typeof createMockClient>;
  let tools: ReturnType<typeof getWarehouseTools>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    tools = getWarehouseTools(client);
  });

  describe('list_warehouses', () => {
    it('should list all warehouses', async () => {
      await tools.list_warehouses.handler();
      expect(client.get).toHaveBeenCalledWith('/warehouses');
    });
  });

  describe('create_warehouse', () => {
    it('should create a warehouse with required fields', async () => {
      await tools.create_warehouse.handler({ name: 'Main Warehouse' });
      expect(client.post).toHaveBeenCalledWith('/warehouses', { name: 'Main Warehouse' });
    });

    it('should include address fields', async () => {
      const args = {
        name: 'Madrid Warehouse',
        address: 'Calle Industrial 123',
        city: 'Madrid',
        postalCode: '28001',
        province: 'Madrid',
        country: 'ES',
      };
      await tools.create_warehouse.handler(args);
      expect(client.post).toHaveBeenCalledWith('/warehouses', args);
    });
  });

  describe('list_warehouse_stock', () => {
    it('should list products stock in warehouse', async () => {
      await tools.list_warehouse_stock.handler({ warehouseId: 'warehouse-123' });
      expect(client.get).toHaveBeenCalledWith('/warehouses/warehouse-123/stock', {});
    });

    it('should support pagination', async () => {
      await tools.list_warehouse_stock.handler({ warehouseId: 'warehouse-123', page: 2 });
      expect(client.get).toHaveBeenCalledWith('/warehouses/warehouse-123/stock', { page: 2 });
    });
  });

  describe('get_warehouse', () => {
    it('should get a warehouse by ID', async () => {
      await tools.get_warehouse.handler({ warehouseId: 'warehouse-123' });
      expect(client.get).toHaveBeenCalledWith('/warehouses/warehouse-123');
    });
  });

  describe('update_warehouse', () => {
    it('should update a warehouse', async () => {
      const args = {
        warehouseId: 'warehouse-123',
        name: 'Updated Warehouse',
        city: 'Barcelona',
      };
      await tools.update_warehouse.handler(args);
      expect(client.put).toHaveBeenCalledWith('/warehouses/warehouse-123', {
        name: 'Updated Warehouse',
        city: 'Barcelona',
      });
    });
  });

  describe('delete_warehouse', () => {
    it('should delete a warehouse', async () => {
      await tools.delete_warehouse.handler({ warehouseId: 'warehouse-123' });
      expect(client.delete).toHaveBeenCalledWith('/warehouses/warehouse-123');
    });
  });
});
