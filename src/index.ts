#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { HoldedClient } from './holded-client.js';
import { getDocumentTools } from './tools/documents.js';
import { getContactTools } from './tools/contacts.js';
import { getProductTools } from './tools/products.js';
import { getTreasuryTools } from './tools/treasuries.js';
import { getExpensesAccountTools } from './tools/expenses-accounts.js';
import { getNumberingSeriesTools } from './tools/numbering-series.js';
import { getSalesChannelTools } from './tools/sales-channels.js';
import { getPaymentTools } from './tools/payments.js';
import { getTaxTools } from './tools/taxes.js';
import { getContactGroupTools } from './tools/contact-groups.js';
import { getRemittanceTools } from './tools/remittances.js';
import { getServiceTools } from './tools/services.js';
import { getWarehouseTools } from './tools/warehouses.js';

const API_KEY = process.env.HOLDED_API_KEY;

if (!API_KEY) {
  console.error('Error: HOLDED_API_KEY environment variable is required');
  process.exit(1);
}

const client = new HoldedClient(API_KEY);

// Collect all tools
const allTools = {
  ...getDocumentTools(client),
  ...getContactTools(client),
  ...getProductTools(client),
  ...getTreasuryTools(client),
  ...getExpensesAccountTools(client),
  ...getNumberingSeriesTools(client),
  ...getSalesChannelTools(client),
  ...getPaymentTools(client),
  ...getTaxTools(client),
  ...getContactGroupTools(client),
  ...getRemittanceTools(client),
  ...getServiceTools(client),
  ...getWarehouseTools(client),
};

// Create server
const server = new Server(
  {
    name: 'mcp-holded',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.entries(allTools).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const tool = allTools[name as keyof typeof allTools];
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  try {
    const result = await tool.handler(args as never);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Holded MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
