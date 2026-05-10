import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAI } from './useAI';

describe('useAI', () => {
  const mockAvailability = vi.fn();

  beforeEach(() => {
    // Chrome native API: Summarizer is a global constructor (function)
    // Create a function mock that also has static methods
    const SummarizerMock = vi.fn() as unknown as { availability: typeof mockAvailability };
    SummarizerMock.availability = mockAvailability;

    // Mock window.Summarizer directly
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'Summarizer', {
        value: SummarizerMock,
        writable: true,
        configurable: true,
      });
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
      delete (window as unknown as { Summarizer?: unknown }).Summarizer;
    }
  });

  it('should return isAvailable: false if Summarizer does not exist', async () => {
    if (typeof window !== 'undefined') {
      delete (window as unknown as { Summarizer?: unknown }).Summarizer;
    }
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.availability).toBe('unavailable');
  });

  it('should return availability: "available" if availability() returns "available"', async () => {
    mockAvailability.mockResolvedValue('available');
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.availability).toBe('available');
  });

  it('should return availability: "downloadable" if availability() returns "downloadable"', async () => {
    mockAvailability.mockResolvedValue('downloadable');
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.availability).toBe('downloadable');
  });

  it('should return availability: "downloading" if availability() returns "downloading"', async () => {
    mockAvailability.mockResolvedValue('downloading');
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.availability).toBe('downloading');
  });

  it('should handle errors in availability()', async () => {
    const error = new Error('Test Error');
    mockAvailability.mockRejectedValue(error);
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe(error);
  });
});
