import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeHTML, sanitizeURL } from '@/utils/inputSanitization';

describe('Input Sanitization Utils', () => {
  describe('sanitizeInput', () => {
    it('sanitizes basic XSS attempts', () => {
      const malicious = '<script>alert("xss")</script>';
      const result = sanitizeInput(malicious);
      expect(result).not.toContain('<script>');
    });

    it('preserves safe text content', () => {
      const safe = 'Hello, World!';
      const result = sanitizeInput(safe);
      expect(result).toBe(safe);
    });

    it('handles empty input', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('sanitizeHTML', () => {
    it('removes dangerous HTML elements', () => {
      const malicious = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizeHTML(malicious);
      expect(result).not.toContain('onclick');
    });

    it('allows safe HTML elements', () => {
      const safe = '<p>Hello</p>';
      const result = sanitizeHTML(safe);
      expect(result).toContain('Hello');
    });
  });

  describe('sanitizeURL', () => {
    it('blocks dangerous URL protocols', () => {
      const malicious = 'javascript:alert(1)';
      const result = sanitizeURL(malicious);
      expect(result).toBe('');
    });

    it('allows safe URLs', () => {
      const safe = 'https://example.com';
      const result = sanitizeURL(safe);
      expect(result).toBe(safe);
    });
  });
});
