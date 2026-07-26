import type { LibraryListeningHistoryItem, LibrarySubscription } from '../types';

export function toLibrarySubscriptionList(items: LibrarySubscription[]) {
  return items;
}

export function toContinueListeningList(items: LibraryListeningHistoryItem[]) {
  return items;
}
