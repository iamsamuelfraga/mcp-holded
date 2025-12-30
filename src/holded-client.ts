import fetch, { RequestInit } from 'node-fetch';
import FormData from 'form-data';

const BASE_URL = 'https://api.holded.com/api/invoicing/v1';

export class HoldedClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number>
  ): Promise<T> {
    let url = `${BASE_URL}${endpoint}`;

    if (queryParams) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      }
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const headers: Record<string, string> = {
      key: this.apiKey,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Holded API error (${response.status}): ${errorText}`);
    }

    // Some endpoints return empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  }

  async get<T>(endpoint: string, queryParams?: Record<string, string | number>): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, queryParams);
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, body);
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', endpoint, body);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  // File upload for attachments
  async uploadFile(endpoint: string, file: Buffer, filename: string): Promise<unknown> {
    const url = `${BASE_URL}${endpoint}`;

    const formData = new FormData();
    formData.append('file', file, filename);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        key: this.apiKey,
        ...formData.getHeaders(),
      },
      body: formData as any,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Holded API error (${response.status}): ${errorText}`);
    }

    const text = await response.text();
    if (!text) {
      return {};
    }

    return JSON.parse(text);
  }
}
