import { z } from 'zod';

/**
 * Common validation schemas
 */

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  limit: z.number().int().positive().max(500).optional(),
  summary: z.boolean().optional(),
});

// Field filtering schema
export const fieldFilteringSchema = z.object({
  fields: z.array(z.string()).optional(),
});

// Date filtering schemas
export const dateRangeSchema = z.object({
  starttmp: z.string().optional(),
  endtmp: z.string().optional(),
});

// Contact schemas
export const contactIdSchema = z.object({
  contactId: z.string().min(1),
});

export const createContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  vatnumber: z.string().optional(),
  type: z.enum(['client', 'supplier', 'lead', 'debtor', 'creditor']).optional(),
  billAddress: z
    .object({
      address: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      province: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  tradename: z.string().optional(),
  code: z.string().optional(),
  note: z.string().optional(),
});

export const updateContactSchema = contactIdSchema.merge(createContactSchema.partial());

export const contactAttachmentSchema = z.object({
  contactId: z.string().min(1),
  attachmentId: z.string().min(1),
});

// Document schemas
export const documentIdSchema = z.object({
  docType: z.enum([
    'invoice',
    'estimate',
    'salesorder',
    'purchaseorder',
    'waybill',
    'proform',
    'purchase',
  ]),
  documentId: z.string().min(1),
});

export const listDocumentsSchema = z
  .object({
    docType: z.enum([
      'invoice',
      'estimate',
      'salesorder',
      'purchaseorder',
      'waybill',
      'proform',
      'purchase',
    ]),
  })
  .merge(paginationSchema)
  .merge(fieldFilteringSchema)
  .merge(dateRangeSchema);

export const updateDocumentPipelineSchema = z.object({
  docType: z.enum([
    'invoice',
    'estimate',
    'salesorder',
    'purchaseorder',
    'waybill',
    'proform',
    'purchase',
  ]),
  documentId: z.string().min(1),
  pipelineId: z.string().min(1),
  stageId: z.string().min(1),
});

export const attachFileToDocumentSchema = z.object({
  docType: z.enum([
    'invoice',
    'estimate',
    'salesorder',
    'purchaseorder',
    'waybill',
    'proform',
    'purchase',
  ]),
  documentId: z.string().min(1),
  fileBase64: z.string().min(1),
  filename: z.string().min(1),
});

export const shipItemsByLineSchema = z.object({
  docType: z.enum([
    'invoice',
    'estimate',
    'salesorder',
    'purchaseorder',
    'waybill',
    'proform',
    'purchase',
  ]),
  documentId: z.string().min(1),
  lines: z.array(z.unknown()),
});

export const payDocumentSchema = z.object({
  docType: z.enum([
    'invoice',
    'estimate',
    'salesorder',
    'purchaseorder',
    'waybill',
    'proform',
    'purchase',
  ]),
  documentId: z.string().min(1),
  amount: z.number().nonnegative().optional(),
  date: z.number().optional(),
  treasuryId: z.string().optional(),
});

export const sendDocumentSchema = z.object({
  docType: z.enum([
    'invoice',
    'estimate',
    'salesorder',
    'purchaseorder',
    'waybill',
    'proform',
    'purchase',
  ]),
  documentId: z.string().min(1),
  emails: z.array(z.string().email()).optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
});

export const updateDocumentTrackingSchema = z.object({
  docType: z.enum([
    'invoice',
    'estimate',
    'salesorder',
    'purchaseorder',
    'waybill',
    'proform',
    'purchase',
  ]),
  documentId: z.string().min(1),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

export const createDocumentSchema = z.object({
  docType: z.enum([
    'invoice',
    'estimate',
    'salesorder',
    'purchaseorder',
    'waybill',
    'proform',
    'purchase',
  ]),
  contactId: z.string().min(1),
  items: z.array(z.unknown()),
  date: z.string().optional(),
  notes: z.string().optional(),
  currency: z.string().optional(),
});

export const updateDocumentSchema = documentIdSchema.merge(
  z.object({
    contactId: z.string().optional(),
    items: z.array(z.unknown()).optional(),
    date: z.string().optional(),
    notes: z.string().optional(),
    currency: z.string().optional(),
  })
);

// Product schemas
export const productIdSchema = z.object({
  productId: z.string().min(1),
});

export const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.number().nonnegative().optional(),
  cost: z.number().nonnegative().optional(),
  costPrice: z.number().nonnegative().optional(),
  tax: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  stock: z.number().optional(),
  kind: z.enum(['product', 'service']).optional(),
});

export const updateProductSchema = productIdSchema.merge(createProductSchema.partial());

export const productImageSchema = z.object({
  productId: z.string().min(1),
  imageId: z.string().min(1),
});

export const updateProductStockSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().optional(),
  units: z.number().int(),
});

// Treasury schemas
export const treasuryIdSchema = z.object({
  treasuryId: z.string().min(1),
});

export const createTreasurySchema = z.object({
  name: z.string().min(1),
  iban: z.string().optional(),
  bic: z.string().optional(),
  balance: z.number().optional(),
});

// Warehouse schemas
export const warehouseIdSchema = z.object({
  warehouseId: z.string().min(1),
});

export const createWarehouseSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
});

export const updateWarehouseSchema = warehouseIdSchema.merge(createWarehouseSchema.partial());

export const warehouseStockSchema = warehouseIdSchema
  .merge(paginationSchema)
  .merge(fieldFilteringSchema);

// Service schemas
export const serviceIdSchema = z.object({
  serviceId: z.string().min(1),
});

export const createServiceSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  price: z.number().nonnegative().optional(),
  tax: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
});

export const updateServiceSchema = serviceIdSchema.merge(createServiceSchema.partial());

// Payment schemas
export const paymentIdSchema = z.object({
  paymentId: z.string().min(1),
});

export const createPaymentSchema = z.object({
  name: z.string().min(1),
  days: z.number().int().nonnegative().optional(),
});

export const updatePaymentSchema = paymentIdSchema.merge(createPaymentSchema.partial());

// Numbering series schemas
export const numberingSerieIdSchema = z.object({
  docType: z.enum([
    'invoice',
    'salesreceipt',
    'creditnote',
    'receiptnote',
    'estimate',
    'salesorder',
    'waybill',
    'proform',
    'purchase',
    'purchaserefund',
    'purchaseorder',
  ]),
  serieId: z.string().min(1),
});

export const createNumberingSerieSchema = z.object({
  docType: z.enum([
    'invoice',
    'salesreceipt',
    'creditnote',
    'receiptnote',
    'estimate',
    'salesorder',
    'waybill',
    'proform',
    'purchase',
    'purchaserefund',
    'purchaseorder',
  ]),
  name: z.string().min(1),
  prefix: z.string().optional(),
  nextNumber: z.number().int().positive().optional(),
});

export const updateNumberingSerieSchema = numberingSerieIdSchema.merge(
  createNumberingSerieSchema.partial().omit({ docType: true })
);

/**
 * Validation utility function
 */
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues
        .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
      throw new Error(`Validation error: ${formattedErrors}`);
    }
    throw error;
  }
}

/**
 * Type-safe validation wrapper for tool handlers
 */
export function withValidation<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (args: TInput) => Promise<TOutput>
) {
  return async (args: unknown): Promise<TOutput> => {
    const validatedArgs = validateInput(schema, args);
    return handler(validatedArgs);
  };
}
