import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from './mock-client.js';
import { getContactTools } from '../tools/contacts.js';

describe('Contact Tools', () => {
  let client: ReturnType<typeof createMockClient>;
  let tools: ReturnType<typeof getContactTools>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    tools = getContactTools(client);
  });

  describe('list_contacts', () => {
    it('should list all contacts', async () => {
      await tools.list_contacts.handler({});
      expect(client.get).toHaveBeenCalledWith('/contacts', {});
    });

    it('should support pagination with page parameter', async () => {
      await tools.list_contacts.handler({ page: 3 });
      expect(client.get).toHaveBeenCalledWith('/contacts', { page: 3 });
    });

    it('should handle requests without any parameters', async () => {
      await tools.list_contacts.handler({});
      expect(client.get).toHaveBeenCalledWith('/contacts', {});
    });

    it('should support limit parameter for virtual pagination', async () => {
      await tools.list_contacts.handler({ limit: 10 });
      expect(client.get).toHaveBeenCalledWith('/contacts', { limit: 10 });
    });

    it('should support summary mode', async () => {
      await tools.list_contacts.handler({ summary: true });
      expect(client.get).toHaveBeenCalledWith('/contacts', {});
    });

    it('should support filtering by phone', async () => {
      await tools.list_contacts.handler({ phone: '+34600000000' });
      expect(client.get).toHaveBeenCalledWith('/contacts', { phone: '+34600000000' });
    });

    it('should support filtering by mobile', async () => {
      await tools.list_contacts.handler({ mobile: '+34700000000' });
      expect(client.get).toHaveBeenCalledWith('/contacts', { mobile: '+34700000000' });
    });

    it('should support filtering by customId array', async () => {
      await tools.list_contacts.handler({ customId: ['CUST-001', 'CUST-002'] });
      expect(client.get).toHaveBeenCalledWith('/contacts', { 'customId[]': 'CUST-001,CUST-002' });
    });

    it('should support combining pagination and filters', async () => {
      await tools.list_contacts.handler({
        page: 2,
        phone: '+34600000000',
      });
      expect(client.get).toHaveBeenCalledWith('/contacts', {
        page: 2,
        phone: '+34600000000',
      });
    });

    it('should support combining all parameters', async () => {
      await tools.list_contacts.handler({
        page: 1,
        limit: 25,
        summary: true,
        mobile: '+34700000000',
      });
      expect(client.get).toHaveBeenCalledWith('/contacts', {
        page: 1,
        limit: 25,
        mobile: '+34700000000',
      });
    });
  });

  describe('create_contact', () => {
    it('should create a contact with required fields', async () => {
      await tools.create_contact.handler({ name: 'Test Contact' });
      expect(client.post).toHaveBeenCalledWith('/contacts', { name: 'Test Contact' });
    });

    it('should include optional fields', async () => {
      const args = {
        name: 'Test Contact',
        email: 'test@example.com',
        phone: '+34600000000',
        vatnumber: 'B12345678',
        type: 'client',
      };
      await tools.create_contact.handler(args);
      expect(client.post).toHaveBeenCalledWith('/contacts', args);
    });

    it('should include billing address', async () => {
      const args = {
        name: 'Test Contact',
        billAddress: {
          address: 'Calle Test 123',
          city: 'Madrid',
          postalCode: '28001',
          country: 'ES',
        },
      };
      await tools.create_contact.handler(args);
      expect(client.post).toHaveBeenCalledWith('/contacts', args);
    });
  });

  describe('get_contact', () => {
    it('should get a contact by ID', async () => {
      await tools.get_contact.handler({ contactId: 'contact-123' });
      expect(client.get).toHaveBeenCalledWith('/contacts/contact-123');
    });
  });

  describe('update_contact', () => {
    it('should update a contact', async () => {
      const args = {
        contactId: 'contact-123',
        name: 'Updated Name',
        email: 'updated@example.com',
      };
      await tools.update_contact.handler(args);
      expect(client.put).toHaveBeenCalledWith('/contacts/contact-123', {
        name: 'Updated Name',
        email: 'updated@example.com',
      });
    });
  });

  describe('delete_contact', () => {
    it('should delete a contact', async () => {
      await tools.delete_contact.handler({ contactId: 'contact-123' });
      expect(client.delete).toHaveBeenCalledWith('/contacts/contact-123');
    });
  });

  describe('list_contact_attachments', () => {
    it('should list contact attachments', async () => {
      await tools.list_contact_attachments.handler({ contactId: 'contact-123' });
      expect(client.get).toHaveBeenCalledWith('/contacts/contact-123/attachments');
    });
  });

  describe('get_contact_attachment', () => {
    it('should get a specific attachment', async () => {
      await tools.get_contact_attachment.handler({
        contactId: 'contact-123',
        attachmentId: 'attach-456',
      });
      expect(client.get).toHaveBeenCalledWith('/contacts/contact-123/attachments/attach-456');
    });
  });

  describe('Virtual pagination', () => {
    it('should return first page of results with page=1', async () => {
      // Mock 100 contacts
      const mockContacts = Array.from({ length: 100 }, (_, i) => ({
        id: `contact-${i + 1}`,
        name: `Contact ${i + 1}`,
        email: `contact${i + 1}@example.com`,
        customId: `CUST-${i + 1}`,
      }));
      client.get = vi.fn().mockResolvedValue(mockContacts);

      const result = (await tools.list_contacts.handler({ page: 1, limit: 10 })) as any;

      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe('contact-1');
      expect(result.items[9].id).toBe('contact-10');
      expect(result.page).toBe(1);
      expect(result.totalItems).toBe(100);
      expect(result.totalPages).toBe(10);
      expect(result.hasMore).toBe(true);
    });

    it('should return second page of results with page=2', async () => {
      const mockContacts = Array.from({ length: 100 }, (_, i) => ({
        id: `contact-${i + 1}`,
        name: `Contact ${i + 1}`,
        email: `contact${i + 1}@example.com`,
        customId: `CUST-${i + 1}`,
      }));
      client.get = vi.fn().mockResolvedValue(mockContacts);

      const result = (await tools.list_contacts.handler({ page: 2, limit: 10 })) as any;

      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe('contact-11');
      expect(result.items[9].id).toBe('contact-20');
      expect(result.page).toBe(2);
      expect(result.hasMore).toBe(true);
    });

    it('should return last page with hasMore=false', async () => {
      const mockContacts = Array.from({ length: 25 }, (_, i) => ({
        id: `contact-${i + 1}`,
        name: `Contact ${i + 1}`,
        email: `contact${i + 1}@example.com`,
        customId: `CUST-${i + 1}`,
      }));
      client.get = vi.fn().mockResolvedValue(mockContacts);

      const result = (await tools.list_contacts.handler({ page: 3, limit: 10 })) as any;

      expect(result.items).toHaveLength(5);
      expect(result.items[0].id).toBe('contact-21');
      expect(result.items[4].id).toBe('contact-25');
      expect(result.hasMore).toBe(false);
    });

    it('should return summary with pagination metadata', async () => {
      const mockContacts = Array.from({ length: 75 }, (_, i) => ({
        id: `contact-${i + 1}`,
        name: `Contact ${i + 1}`,
        email: `contact${i + 1}@example.com`,
        customId: `CUST-${i + 1}`,
      }));
      client.get = vi.fn().mockResolvedValue(mockContacts);

      const result = (await tools.list_contacts.handler({
        page: 2,
        limit: 20,
        summary: true,
      })) as any;

      expect(result.count).toBe(75);
      expect(result.totalPages).toBe(4);
      expect(result.currentPage).toBe(2);
      expect(result.hasMore).toBe(true);
    });

    it('should default to page 1 when page is not specified', async () => {
      const mockContacts = Array.from({ length: 30 }, (_, i) => ({
        id: `contact-${i + 1}`,
        name: `Contact ${i + 1}`,
        email: `contact${i + 1}@example.com`,
        customId: `CUST-${i + 1}`,
      }));
      client.get = vi.fn().mockResolvedValue(mockContacts);

      const result = (await tools.list_contacts.handler({ limit: 10 })) as any;

      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe('contact-1');
      expect(result.page).toBe(1);
    });
  });
});
