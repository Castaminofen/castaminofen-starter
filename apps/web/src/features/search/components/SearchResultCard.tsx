import { PodcastCard } from '@/features/podcasts/PodcastCard';

export function SearchResultCard({ podcast }: { podcast: any }) {
  return <PodcastCard podcast={podcast} />;
}
