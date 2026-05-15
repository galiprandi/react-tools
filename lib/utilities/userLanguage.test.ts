import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getUserLanguage } from './userLanguage';

describe('getUserLanguage', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return "en" when navigator is undefined', () => {
    vi.stubGlobal('navigator', undefined);
    expect(getUserLanguage()).toBe('en');
  });

  it('should return normalized language code from navigator.language', () => {
    vi.stubGlobal('navigator', { language: 'en-US' });
    expect(getUserLanguage()).toBe('en');
  });

  it('should return normalized language code from navigator.languages[0]', () => {
    vi.stubGlobal('navigator', { languages: ['es-ES', 'en-US'] });
    expect(getUserLanguage()).toBe('es');
  });

  it('should return "en" when navigator.language is not available', () => {
    vi.stubGlobal('navigator', {});
    expect(getUserLanguage()).toBe('en');
  });

  it('should handle simple language codes without region', () => {
    vi.stubGlobal('navigator', { language: 'fr' });
    expect(getUserLanguage()).toBe('fr');
  });

  it('should handle language codes with region and script', () => {
    vi.stubGlobal('navigator', { language: 'zh-Hans-CN' });
    expect(getUserLanguage()).toBe('zh');
  });

  it('should prefer navigator.language over navigator.languages', () => {
    vi.stubGlobal('navigator', { language: 'de-DE', languages: ['en-US'] });
    expect(getUserLanguage()).toBe('de');
  });

  it('should return "en" when navigator.languages is an empty array', () => {
    vi.stubGlobal('navigator', { languages: [] });
    expect(getUserLanguage()).toBe('en');
  });
});
