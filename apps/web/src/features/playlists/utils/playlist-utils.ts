export function getPlaylistPlaceholderLabel(title: string) {
  const trimmed = title.trim();

  if (!trimmed) {
    return 'PL';
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}
