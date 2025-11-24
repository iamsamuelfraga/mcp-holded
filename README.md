# MCP Holded

[![CI](https://github.com/iamsamuelfraga/mcp-holded/actions/workflows/ci.yml/badge.svg)](https://github.com/iamsamuelfraga/mcp-holded/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/%40iamsamuelfraga%2Fmcp-holded.svg)](https://www.npmjs.com/package/@iamsamuelfraga/mcp-holded)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/iamsamuelfraga/mcp-holded/branch/main/graph/badge.svg)](https://codecov.io/gh/iamsamuelfraga/mcp-holded)

A Model Context Protocol (MCP) server for the Holded Invoice API. This server allows AI assistants like Claude to interact with Holded's invoicing, contacts, products, and more.

## Features

This MCP server provides access to the complete Holded Invoice API:

- **Documents** (16 tools): Create, list, update, delete invoices, estimates, credit notes, etc. Also pay, send, get PDF, ship items, and more.
- **Contacts** (7 tools): Manage clients and suppliers with attachments.
- **Products** (9 tools): Full product management including images and stock.
- **Treasuries** (3 tools): Manage treasury accounts.
- **Expenses Accounts** (5 tools): Handle expense account categories.
- **Numbering Series** (4 tools): Configure document numbering.
- **Sales Channels** (5 tools): Manage sales channels.
- **Warehouses** (5 tools): Warehouse management.
- **Payments** (5 tools): Payment method configuration.
- **Taxes** (1 tool): Get available taxes.
- **Contact Groups** (5 tools): Organize contacts into groups.
- **Remittances** (2 tools): Access remittance data.
- **Services** (5 tools): Manage services.

**Total: 72 tools**

## Installation

### Prerequisites

- Node.js 18 or higher
- A Holded account with API access
- Your Holded API key (get it from Holded Settings > API)

### Install from npm

```bash
npm install -g @iamsamuelfraga/mcp-holded
```

### Install from source

```bash
git clone https://github.com/iamsamuelfraga/mcp-holded.git
cd mcp-holded
npm install
npm run build
```

## Configuration

### Environment Variable

Set your Holded API key:

```bash
export HOLDED_API_KEY=your_api_key_here
```

### Claude Desktop Configuration

Add to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "holded": {
      "command": "npx",
      "args": ["-y", "@iamsamuelfraga/mcp-holded"],
      "env": {
        "HOLDED_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Or if installed from source:

```json
{
  "mcpServers": {
    "holded": {
      "command": "node",
      "args": ["/path/to/mcp-holded/dist/index.js"],
      "env": {
        "HOLDED_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Usage Examples

Once configured, you can ask Claude to:

### Documents

- "List all my invoices from Holded"
- "Create an invoice for client X with 2 items"
- "Send invoice #123 to the client by email"
- "Get the PDF of invoice #456"
- "Mark invoice #789 as paid"

### Contacts

- "List all my clients in Holded"
- "Create a new client named Acme Corp"
- "Update the email for contact #123"

### Products

- "Show me all products"
- "Create a new product called Widget with price 50 EUR"
- "Update stock for product #123 adding 10 units"

### Reports

- "Get all my taxes"
- "List all treasuries"
- "Show me the sales channels"

## Document Types

The API supports these document types:

| Type | Description |
|------|-------------|
| `invoice` | Sales invoices |
| `salesreceipt` | Sales receipts |
| `creditnote` | Credit notes (refunds) |
| `receiptnote` | Receipt notes |
| `estimate` | Estimates/Quotes |
| `salesorder` | Sales orders |
| `waybill` | Packing lists |
| `proform` | Proforma invoices |
| `purchase` | Purchases |
| `purchaserefund` | Purchase refunds |
| `purchaseorder` | Purchase orders |

## API Reference

### Base URL

```
https://api.holded.com/api/invoicing/v1/
```

### Authentication

All requests use the `key` header with your API key.

### Pagination

List endpoints support pagination via the `page` query parameter.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev
```

## License

MIT

## Author

Samuel Fraga

- [GitHub](https://github.com/iamsamuelfraga)
- [LinkedIn](https://www.linkedin.com/in/samuel-fraga/)

## Links

- [Holded API Documentation](https://developers.holded.com/reference/documents)
- [MCP Specification](https://modelcontextprotocol.io/)
