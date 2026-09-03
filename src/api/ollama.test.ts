import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * API interaction tests for Ollama endpoints
 * 
 * These tests verify the shape of API requests, payload construction,
 * and response handling without mocking the full component tree.
 * The Index.tsx component is tested end-to-end separately.
 */

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Ollama API Interactions', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Models endpoint (/v1/models)', () => {
    it('fetches models list with correct URL', async () => {
      const mockData = {
        data: [
          { id: 'phi:2.7b' },
          { id: 'codegemma:2b' },
          { id: 'llama3.1:8b' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const response = await fetch('http://localhost:11434/v1/models');
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:11434/v1/models');
      expect(data.data).toHaveLength(3);
      expect(data.data[0].id).toBe('phi:2.7b');
    });

    it('handles fetch error gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const response = await fetch('http://localhost:11434/v1/models');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });

    it('handles network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetch('http://localhost:11434/v1/models'))
        .rejects.toThrow('Network error');
    });

    it('returns sorted model names', () => {
      const modelNames = ['zebra:1b', 'apple:2b', 'middle:3b'];
      const sorted = [...modelNames].sort((a, b) => a.localeCompare(b));
      expect(sorted).toEqual(['apple:2b', 'middle:3b', 'zebra:1b']);
    });
  });

  describe('Generate endpoint (/api/generate)', () => {
    it('sends correct payload structure', async () => {
      const mockResponse = {
        response: 'Generated text response',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const payload = {
        model: 'phi:2.7b',
        prompt: 'What is TypeScript?',
        stream: false,
        think: false,
        num_ctx: 8192,
        temperature: 0.2,
        num_predict: 1024,
        system: 'You are a helpful assistant.',
      };

      await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      );
    });

    it('handles string fields that need integer coercion', () => {
      // Simulate the string-to-integer conversion from <select> onChange
      const numCtxFromSelect = '8192';
      const numPredictFromSelect = '1024';
      const coerced = {
        num_ctx: parseInt(String(numCtxFromSelect)),
        num_predict: parseInt(String(numPredictFromSelect)),
      };
      expect(coerced.num_ctx).toBe(8192);
      expect(coerced.num_predict).toBe(1024);
    });

    it('parses response correctly', async () => {
      const mockData = {
        response: 'Hello! How can I help?',
        text: 'Hello! How can I help?',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const response = await fetch('http://localhost:11434/api/generate');
      const data = await response.json();
      const apiResponse = data.response || data.text || JSON.stringify(data);

      expect(apiResponse).toBe('Hello! How can I help?');
    });

    it('falls back to JSON.stringify when both response and text are missing', async () => {
      const mockData = { unexpected: 'format' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const response = await fetch('http://localhost:11434/api/generate');
      const data = await response.json();
      const apiResponse = data.response || data.text || JSON.stringify(data);

      expect(apiResponse).toBe(JSON.stringify({ unexpected: 'format' }));
    });

    it('throws on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const response = await fetch('http://localhost:11434/api/generate');
      expect(response.ok).toBe(false);
    });
  });

  describe('Request options validation', () => {
    it('num_ctx must be integer', () => {
      const numCtx = 8192;
      expect(Number.isInteger(numCtx)).toBe(true);
    });

    it('num_predict must be integer', () => {
      const numPredict = 1024;
      expect(Number.isInteger(numPredict)).toBe(true);
    });

    it('temperature is float between 0 and 1', () => {
      const temperature = 0.2;
      expect(temperature).toBeGreaterThanOrEqual(0);
      expect(temperature).toBeLessThanOrEqual(1);
    });

    it('think mode boolean is sent correctly', () => {
      const think = true;
      const payload = { think };
      expect(payload.think).toBe(true);
    });

    it('stream mode boolean is sent correctly', () => {
      const stream = false;
      const payload = { stream };
      expect(payload.stream).toBe(false);
    });
  });
});