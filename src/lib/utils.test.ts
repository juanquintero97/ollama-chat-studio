import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('base', 'override')).toBe('base override');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional');
    expect(cn('base', false && 'conditional')).toBe('base');
  });

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'valid')).toBe('base valid');
  });

  it('merges Tailwind classes correctly (twMerge behavior)', () => {
    expect(cn('p-2 p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('handles single class', () => {
    expect(cn('single')).toBe('single');
  });

  it('handles objects', () => {
    expect(cn({ 'active': true, 'disabled': false })).toBe('active');
    expect(cn({ 'active': false, 'disabled': true })).toBe('disabled');
  });

  it('merges arrays', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });
});