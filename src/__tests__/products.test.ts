import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from './mock-client.js';
import { getProductTools } from '../tools/products.js';

describe('Product Tools', () => {
  let client: ReturnType<typeof createMockClient>;
  let tools: ReturnType<typeof getProductTools>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    tools = getProductTools(client);
  });

  describe('list_products', () => {
    it('should list all products', async () => {
      await tools.list_products.handler({});
      expect(client.get).toHaveBeenCalledWith('/products', {});
    });

    it('should support pagination', async () => {
      await tools.list_products.handler({ page: 2 });
      expect(client.get).toHaveBeenCalledWith('/products', { page: 2 });
    });
  });

  describe('create_product', () => {
    it('should create a product with required fields', async () => {
      await tools.create_product.handler({ name: 'Test Product' });
      expect(client.post).toHaveBeenCalledWith('/products', { name: 'Test Product' });
    });

    it('should include optional fields', async () => {
      const args = {
        name: 'Test Product',
        sku: 'SKU-001',
        barcode: '1234567890',
        price: 99.99,
        costPrice: 50,
        tax: 21,
        description: 'A test product',
        stock: 100,
        kind: 'product',
      };
      await tools.create_product.handler(args);
      expect(client.post).toHaveBeenCalledWith('/products', args);
    });
  });

  describe('get_product', () => {
    it('should get a product by ID', async () => {
      await tools.get_product.handler({ productId: 'product-123' });
      expect(client.get).toHaveBeenCalledWith('/products/product-123');
    });
  });

  describe('update_product', () => {
    it('should update a product', async () => {
      const args = {
        productId: 'product-123',
        name: 'Updated Product',
        price: 149.99,
      };
      await tools.update_product.handler(args);
      expect(client.put).toHaveBeenCalledWith('/products/product-123', {
        name: 'Updated Product',
        price: 149.99,
      });
    });
  });

  describe('delete_product', () => {
    it('should delete a product', async () => {
      await tools.delete_product.handler({ productId: 'product-123' });
      expect(client.delete).toHaveBeenCalledWith('/products/product-123');
    });
  });

  describe('get_product_main_image', () => {
    it('should get product main image', async () => {
      await tools.get_product_main_image.handler({ productId: 'product-123' });
      expect(client.get).toHaveBeenCalledWith('/products/product-123/image');
    });
  });

  describe('list_product_images', () => {
    it('should list product images', async () => {
      await tools.list_product_images.handler({ productId: 'product-123' });
      expect(client.get).toHaveBeenCalledWith('/products/product-123/images');
    });
  });

  describe('get_product_secondary_image', () => {
    it('should get a secondary image', async () => {
      await tools.get_product_secondary_image.handler({
        productId: 'product-123',
        imageId: 'image-456',
      });
      expect(client.get).toHaveBeenCalledWith('/products/product-123/images/image-456');
    });
  });

  describe('update_product_stock', () => {
    it('should update product stock', async () => {
      await tools.update_product_stock.handler({
        productId: 'product-123',
        units: 50,
      });
      expect(client.put).toHaveBeenCalledWith('/products/product-123/stock', { units: 50 });
    });

    it('should include warehouse ID if provided', async () => {
      await tools.update_product_stock.handler({
        productId: 'product-123',
        warehouseId: 'warehouse-1',
        units: -10,
      });
      expect(client.put).toHaveBeenCalledWith('/products/product-123/stock', {
        units: -10,
        warehouseId: 'warehouse-1',
      });
    });
  });
});
