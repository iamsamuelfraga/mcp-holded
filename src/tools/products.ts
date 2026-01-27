import { HoldedClient } from '../holded-client.js';
import {
  productIdSchema,
  createProductSchema,
  updateProductSchema,
  productImageSchema,
  updateProductStockSchema,
  withValidation,
} from '../validation.js';

export function getProductTools(client: HoldedClient) {
  return {
    // List Products
    list_products: {
      description:
        'List all products with optional pagination. Supports field filtering to reduce response size.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page: {
            type: 'number',
            description: 'Page number for pagination (optional)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of items to return (default: 50, max: 500)',
          },
          summary: {
            type: 'boolean',
            description: 'Return only count and pagination metadata without items (default: false)',
          },
          fields: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Select specific fields to return (e.g., ["id", "name", "price"]). Reduces response size by 70-90%. If not provided, returns default fields: id, name, sku, price, stock',
          },
        },
        required: [],
      },
      readOnlyHint: true,
      handler: async (
        args: { page?: number; limit?: number; summary?: boolean; fields?: string[] } = {}
      ) => {
        const queryParams: Record<string, string | number> = {};
        if (args.page) queryParams.page = args.page;
        if (args.limit) queryParams.limit = Math.min(args.limit, 500);
        const products = (await client.get('/products', queryParams)) as Array<
          Record<string, unknown>
        >;
        const limit = Math.min(args.limit ?? 50, 500);

        // Field filtering: if fields specified, return only those fields
        // Otherwise, return default minimal set
        const defaultFields = ['id', 'name', 'sku', 'price', 'stock'];
        const fieldsToInclude = args.fields && args.fields.length > 0 ? args.fields : defaultFields;

        const filtered = products.map((product) => {
          const result: Record<string, unknown> = {};
          for (const field of fieldsToInclude) {
            if (field in product) {
              result[field] = product[field];
            }
          }
          return result;
        });

        const items = filtered.slice(0, limit);

        // Summary mode: return only count and metadata
        if (args.summary) {
          return {
            count: items.length,
            hasMore: items.length === limit && filtered.length > limit,
          };
        }

        return {
          items,
          page: args.page,
          pageSize: items.length,
          hasMore: items.length === limit && filtered.length > limit,
        };
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
      handler: withValidation(createProductSchema, async (args) => {
        return client.post('/products', args);
      }),
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
      handler: withValidation(productIdSchema, async (args) => {
        return client.get(`/products/${args.productId}`);
      }),
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
      handler: withValidation(updateProductSchema, async (args) => {
        const { productId, ...body } = args;
        return client.put(`/products/${productId}`, body);
      }),
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
      handler: withValidation(productIdSchema, async (args) => {
        return client.delete(`/products/${args.productId}`);
      }),
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
      handler: withValidation(productIdSchema, async (args) => {
        return client.get(`/products/${args.productId}/image`);
      }),
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
      handler: withValidation(productIdSchema, async (args) => {
        return client.get(`/products/${args.productId}/images`);
      }),
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
      handler: withValidation(productImageSchema, async (args) => {
        return client.get(`/products/${args.productId}/images/${args.imageId}`);
      }),
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
      handler: withValidation(updateProductStockSchema, async (args) => {
        const body: Record<string, unknown> = { units: args.units };
        if (args.warehouseId) body.warehouseId = args.warehouseId;
        return client.put(`/products/${args.productId}/stock`, body);
      }),
    },
  };
}
