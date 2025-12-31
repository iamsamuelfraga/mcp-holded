import { HoldedClient } from '../holded-client.js';

export function getProductTools(client: HoldedClient) {
  return {
    // List Products
    list_products: {
      description: 'List all products with optional pagination',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page: {
            type: 'number',
            description: 'Page number for pagination (optional)',
          },
        },
        required: [],
      },
      readOnlyHint: true,
      handler: async (args: { page?: number }) => {
        const queryParams: Record<string, string | number> = {};
        if (args.page) queryParams.page = args.page;
        const products = (await client.get('/products', queryParams)) as Array<
          Record<string, unknown>
        >;
        return products.map((product) => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          stock: product.stock,
        }));
      },
    },

    // Create Product
    create_product: {
      description: 'Create a new product',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Product name',
          },
          sku: {
            type: 'string',
            description: 'Product SKU',
          },
          barcode: {
            type: 'string',
            description: 'Product barcode',
          },
          price: {
            type: 'number',
            description: 'Product price',
          },
          costPrice: {
            type: 'number',
            description: 'Cost price',
          },
          tax: {
            type: 'number',
            description: 'Tax percentage',
          },
          description: {
            type: 'string',
            description: 'Product description',
          },
          stock: {
            type: 'number',
            description: 'Initial stock quantity',
          },
          kind: {
            type: 'string',
            enum: ['product', 'service'],
            description: 'Product kind',
          },
        },
        required: ['name'],
      },
      destructiveHint: true,
      handler: async (args: Record<string, unknown>) => {
        return client.post('/products', args);
      },
    },

    // Get Product
    get_product: {
      description: 'Get a specific product by ID',
      inputSchema: {
        type: 'object' as const,
        properties: {
          productId: {
            type: 'string',
            description: 'Product ID',
          },
        },
        required: ['productId'],
      },
      readOnlyHint: true,
      handler: async (args: { productId: string }) => {
        return client.get(`/products/${args.productId}`);
      },
    },

    // Update Product
    update_product: {
      description: 'Update an existing product',
      inputSchema: {
        type: 'object' as const,
        properties: {
          productId: {
            type: 'string',
            description: 'Product ID to update',
          },
          name: {
            type: 'string',
            description: 'Product name',
          },
          sku: {
            type: 'string',
            description: 'Product SKU',
          },
          barcode: {
            type: 'string',
            description: 'Product barcode',
          },
          price: {
            type: 'number',
            description: 'Product price',
          },
          costPrice: {
            type: 'number',
            description: 'Cost price',
          },
          tax: {
            type: 'number',
            description: 'Tax percentage',
          },
          description: {
            type: 'string',
            description: 'Product description',
          },
        },
        required: ['productId'],
      },
      destructiveHint: true,
      handler: async (args: { productId: string; [key: string]: unknown }) => {
        const { productId, ...body } = args;
        return client.put(`/products/${productId}`, body);
      },
    },

    // Delete Product
    delete_product: {
      description: 'Delete a product',
      inputSchema: {
        type: 'object' as const,
        properties: {
          productId: {
            type: 'string',
            description: 'Product ID to delete',
          },
        },
        required: ['productId'],
      },
      destructiveHint: true,
      handler: async (args: { productId: string }) => {
        return client.delete(`/products/${args.productId}`);
      },
    },

    // Get Product Main Image
    get_product_main_image: {
      description: 'Get the main image of a product',
      inputSchema: {
        type: 'object' as const,
        properties: {
          productId: {
            type: 'string',
            description: 'Product ID',
          },
        },
        required: ['productId'],
      },
      readOnlyHint: true,
      handler: async (args: { productId: string }) => {
        return client.get(`/products/${args.productId}/image`);
      },
    },

    // List Product Images
    list_product_images: {
      description: 'List all images of a product',
      inputSchema: {
        type: 'object' as const,
        properties: {
          productId: {
            type: 'string',
            description: 'Product ID',
          },
        },
        required: ['productId'],
      },
      readOnlyHint: true,
      handler: async (args: { productId: string }) => {
        return client.get(`/products/${args.productId}/images`);
      },
    },

    // Get Product Secondary Image
    get_product_secondary_image: {
      description: 'Get a secondary image of a product',
      inputSchema: {
        type: 'object' as const,
        properties: {
          productId: {
            type: 'string',
            description: 'Product ID',
          },
          imageId: {
            type: 'string',
            description: 'Image ID',
          },
        },
        required: ['productId', 'imageId'],
      },
      readOnlyHint: true,
      handler: async (args: { productId: string; imageId: string }) => {
        return client.get(`/products/${args.productId}/images/${args.imageId}`);
      },
    },

    // Update Product Stock
    update_product_stock: {
      description: 'Update stock quantity for a product',
      inputSchema: {
        type: 'object' as const,
        properties: {
          productId: {
            type: 'string',
            description: 'Product ID',
          },
          warehouseId: {
            type: 'string',
            description: 'Warehouse ID (optional)',
          },
          units: {
            type: 'number',
            description: 'Number of units to add or subtract',
          },
        },
        required: ['productId', 'units'],
      },
      destructiveHint: true,
      handler: async (args: { productId: string; warehouseId?: string; units: number }) => {
        const body: Record<string, unknown> = { units: args.units };
        if (args.warehouseId) body.warehouseId = args.warehouseId;
        return client.put(`/products/${args.productId}/stock`, body);
      },
    },
  };
}
