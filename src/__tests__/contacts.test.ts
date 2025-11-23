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

    it('should support pagination', async () => {
      await tools.list_contacts.handler({ page: 3 });
      expect(client.get).toHaveBeenCalledWith('/contacts', { page: 3 });
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
});
