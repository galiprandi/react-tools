import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAI } from './useAI';

describe('useAI', () => {
  beforeEach(() => {
    vi.stubGlobal('ai', {
      summarizer: {
        capabilities: vi.fn(),
      },
    });
    // In happy-dom, window.ai might be needed, let's try stubbing window.ai directly if possible
    // or rely on global ai if it's mirrored
    if (typeof window !== 'undefined') {
        (window as any).ai = (global as any).ai;
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (typeof window !== 'undefined') {
        delete (window as any).ai;
    }
  });

  it('should return isAvailable: false if window.ai does not exist', async () => {
    vi.stubGlobal('ai', undefined);
    if (typeof window !== 'undefined') {
        delete (window as any).ai;
    }
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.availability).toBe('no');
  });

  it('should return availability: "readily" if capabilities() returns "readily"', async () => {
    ((global as any).ai.summarizer.capabilities as any).mockResolvedValue({ available: 'readily' });
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.availability).toBe('readily');
    expect(result.current.capabilities).toEqual({ available: 'readily' });
  });

  it('should return availability: "after-download" if capabilities() returns "after-download"', async () => {
    ((global as any).ai.summarizer.capabilities as any).mockResolvedValue({ available: 'after-download' });
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.availability).toBe('after-download');
  });

  it('should handle errors in capabilities()', async () => {
    const error = new Error('Test Error');
    ((global as any).ai.summarizer.capabilities as any).mockRejectedValue(error);
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe(error);
  });
});
