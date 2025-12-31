import { HoldedClient } from '../holded-client.js';

export function getRemittanceTools(client: HoldedClient) {
  return {
    // List Remittances
    list_remittances: {
      description: 'List all remittances',
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      readOnlyHint: true,
      handler: async () => {
        const remittances = (await client.get('/remittances')) as Array<Record<string, unknown>>;
        return remittances.map((remittance) => ({
          id: remittance.id,
          name: remittance.name,
          date: remittance.date,
        }));
      },
    },

    // Get Remittance
    get_remittance: {
      description: 'Get a specific remittance by ID',
      inputSchema: {
        type: 'object' as const,
        properties: {
          remittanceId: {
            type: 'string',
            description: 'Remittance ID',
          },
        },
        required: ['remittanceId'],
      },
      readOnlyHint: true,
      handler: async (args: { remittanceId: string }) => {
        return client.get(`/remittances/${args.remittanceId}`);
      },
    },
  };
}
