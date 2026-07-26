-- CreateTable UserSubscription
CREATE TABLE "UserSubscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "podcastId" TEXT NOT NULL,
  "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable ListeningHistory
CREATE TABLE "ListeningHistory" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "episodeId" TEXT NOT NULL,
  "positionSeconds" INTEGER,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "lastPlayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ListeningHistory_pkey" PRIMARY KEY ("id")
);

-- Foreign keys with cascade
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_podcast_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE;

ALTER TABLE "ListeningHistory" ADD CONSTRAINT "ListeningHistory_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "ListeningHistory" ADD CONSTRAINT "ListeningHistory_episode_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE;

-- Indexes and unique constraints
CREATE UNIQUE INDEX "UserSubscription_user_podcast_unique" ON "UserSubscription"("userId", "podcastId");
CREATE INDEX "UserSubscription_user_idx" ON "UserSubscription"("userId");
CREATE INDEX "UserSubscription_podcast_idx" ON "UserSubscription"("podcastId");

CREATE UNIQUE INDEX "ListeningHistory_user_episode_unique" ON "ListeningHistory"("userId", "episodeId");
CREATE INDEX "ListeningHistory_user_lastPlayedAt_idx" ON "ListeningHistory"("userId", "lastPlayedAt");
