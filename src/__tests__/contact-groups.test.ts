import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from './mock-client.js';
import { getContactGroupTools } from '../tools/contact-groups.js';

describe('Contact Group Tools', () => {
  let client: ReturnType<typeof createMockClient>;
  let tools: ReturnType<typeof getContactGroupTools>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    tools = getContactGroupTools(client);
  });

  describe('list_contact_groups', () => {
    it('should list all contact groups', async () => {
      await tools.list_contact_groups.handler();
      expect(client.get).toHaveBeenCalledWith('/contactgroups');
    });
  });

  describe('create_contact_group', () => {
    it('should create a contact group', async () => {
      await tools.create_contact_group.handler({ name: 'VIP Clients' });
      expect(client.post).toHaveBeenCalledWith('/contactgroups', { name: 'VIP Clients' });
    });
  });

  describe('get_contact_group', () => {
    it('should get a contact group by ID', async () => {
      await tools.get_contact_group.handler({ groupId: 'group-123' });
      expect(client.get).toHaveBeenCalledWith('/contactgroups/group-123');
    });
  });

  describe('update_contact_group', () => {
    it('should update a contact group', async () => {
      const args = {
        groupId: 'group-123',
        name: 'Premium Clients',
      };
      await tools.update_contact_group.handler(args);
      expect(client.put).toHaveBeenCalledWith('/contactgroups/group-123', {
        name: 'Premium Clients',
      });
    });
  });

  describe('delete_contact_group', () => {
    it('should delete a contact group', async () => {
      await tools.delete_contact_group.handler({ groupId: 'group-123' });
      expect(client.delete).toHaveBeenCalledWith('/contactgroups/group-123');
    });
  });
});
