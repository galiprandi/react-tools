import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAI } from './useAI';

describe('useAI', () => {
  beforeEach(() => {
    // Clear any previous stubs
    vi.unstubAllGlobals();
    if (typeof window !== 'undefined') {
        delete (window as any).Summarizer;
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (typeof window !== 'undefined') {
        delete (window as any).Summarizer;
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

  it('should return availability: "available" if Summarizer.availability() returns "available"', async () => {
    const SummarizerMock = {
      availability: vi.fn().mockResolvedValue('available'),
    };
    vi.stubGlobal('Summarizer', SummarizerMock);
    if (typeof window !== 'undefined') {
        (window as any).Summarizer = SummarizerMock;
    }
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.availability).toBe('available');
  });

  it('should return availability: "downloadable" if Summarizer.availability() returns "downloadable"', async () => {
    const SummarizerMock = {
      availability: vi.fn().mockResolvedValue('downloadable'),
    };
    vi.stubGlobal('Summarizer', SummarizerMock);
    if (typeof window !== 'undefined') {
        (window as any).Summarizer = SummarizerMock;
    }
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.availability).toBe('downloadable');
  });

  it('should handle errors in availability()', async () => {
    const error = new Error('Test Error');
    const SummarizerMock = {
      availability: vi.fn().mockRejectedValue(error),
    };
    vi.stubGlobal('Summarizer', SummarizerMock);
    if (typeof window !== 'undefined') {
        (window as any).Summarizer = SummarizerMock;
    }
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe(error);
  });
});
