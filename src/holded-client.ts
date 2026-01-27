import fetch, { RequestInit } from 'node-fetch';
import FormData from 'form-data';

const BASE_URL = 'https://api.holded.com/api/invoicing/v1';

export class HoldedClient {
  private apiKey: string;
  private maxRetries = 3;
  private backoffDelays = [1000, 2000, 4000]; // milliseconds
  private retryableStatusCodes = new Set([429, 502, 503, 504]);

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

    let lastError: Error | null = null;

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        // Check if response should be retried
        if (!response.ok && this.retryableStatusCodes.has(response.status)) {
          const errorText = await response.text();
          lastError = new Error(`Holded API error (${response.status}): ${errorText}`);

          // If not last attempt, wait and retry
          if (attempt < this.maxRetries - 1) {
            const delay = this.backoffDelays[attempt];
            await this.sleep(delay);
            continue;
          }
          // Last attempt, throw error
          throw lastError;
        }

        // Non-retryable error
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Holded API error (${response.status}): ${errorText}`);
        }

        // Success - parse and return response
        const text = await response.text();
        if (!text) {
          return {} as T;
        }

        return JSON.parse(text) as T;
      } catch (error) {
        // Network errors or other exceptions
        if (error instanceof Error) {
          lastError = error;

          // Only retry if it's a retryable HTTP error
          if (error.message.includes('Holded API error')) {
            const statusMatch = error.message.match(/\((\d+)\)/);
            if (statusMatch) {
              const status = parseInt(statusMatch[1], 10);
              if (this.retryableStatusCodes.has(status) && attempt < this.maxRetries - 1) {
                const delay = this.backoffDelays[attempt];
                await this.sleep(delay);
                continue;
              }
            }
          }
        }

        // Non-retryable error or last attempt
        throw error;
      }
    }

    // Should not reach here, but throw last error just in case
    throw lastError || new Error('Request failed after retries');
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

  // File upload for attachments with retry logic
  async uploadFile(endpoint: string, file: Buffer, filename: string): Promise<unknown> {
    const url = `${BASE_URL}${endpoint}`;
    let lastError: Error | null = null;

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const formData = new FormData();
        formData.append('file', file, filename);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            key: this.apiKey,
            ...formData.getHeaders(),
          },
          body: formData as unknown as BodyInit,
        });

        // Check if response should be retried
        if (!response.ok && this.retryableStatusCodes.has(response.status)) {
          const errorText = await response.text();
          lastError = new Error(`Holded API error (${response.status}): ${errorText}`);

          // If not last attempt, wait and retry
          if (attempt < this.maxRetries - 1) {
            const delay = this.backoffDelays[attempt];
            await this.sleep(delay);
            continue;
          }
          // Last attempt, throw error
          throw lastError;
        }

        // Non-retryable error
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Holded API error (${response.status}): ${errorText}`);
        }

        // Success - parse and return response
        const text = await response.text();
        if (!text) {
          return {};
        }

        return JSON.parse(text);
      } catch (error) {
        // Network errors or other exceptions
        if (error instanceof Error) {
          lastError = error;

          // Only retry if it's a retryable HTTP error
          if (error.message.includes('Holded API error')) {
            const statusMatch = error.message.match(/\((\d+)\)/);
            if (statusMatch) {
              const status = parseInt(statusMatch[1], 10);
              if (this.retryableStatusCodes.has(status) && attempt < this.maxRetries - 1) {
                const delay = this.backoffDelays[attempt];
                await this.sleep(delay);
                continue;
              }
            }
          }
        }

        // Non-retryable error or last attempt
        throw error;
      }
    }

    // Should not reach here, but throw last error just in case
    throw lastError || new Error('File upload failed after retries');
  }
}
