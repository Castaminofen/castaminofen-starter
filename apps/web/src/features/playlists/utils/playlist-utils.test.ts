import { describe, expect, it } from 'vitest';
import { getPlaylistPlaceholderLabel } from './playlist-utils';

describe('getPlaylistPlaceholderLabel', () => {
  it('returns a short label from the playlist title', () => {
    expect(getPlaylistPlaceholderLabel('Morning Commute')).toBe('MC');
    expect(getPlaylistPlaceholderLabel('')).toBe('PL');
  });
});
