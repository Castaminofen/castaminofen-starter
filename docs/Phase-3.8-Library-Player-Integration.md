# Phase 3.8 — Library & Player Runtime Integration

## Executive Summary
This phase integrated the Library continue-listening experience with the existing Player runtime without changing architecture ownership, routing, backend contracts, or UI design. The Library feature now triggers the Player runtime directly for resume playback and passes the saved progress position to the existing Player controller so playback resumes from the stored timestamp instead of restarting from zero.

## Files Modified
- apps/web/src/features/library/components/ContinueListeningSection.tsx
- apps/web/src/features/library/components/LibraryPodcastCard.tsx
- apps/web/src/features/player/runtime/playerRuntime.ts
- apps/web/src/features/player/runtime/playerRuntime.test.ts
- apps/web/src/features/player/types/index.ts
- apps/web/src/features/player/adapters/episodeToPlayable.ts
- docs/development/changelog.md
- docs/development/scripts-registry.md
- docs/project-status.md

## Runtime Integration
Library continue-listening items now call the existing Player runtime through the established Player API. Library does not own playback state, queue, audio engine, or media-session behavior; it only requests playback through the Player runtime.

## Player Integration
The Player runtime now accepts an optional resume start time when loading a playable item. This allows Library to reuse Player-owned resume behavior while preserving the single runtime owner model.

## Queue Behaviour
Queue behavior remains Player-owned. Library does not create or manage its own queue. Resume actions reuse the existing Player queue replacement behavior by loading a single item through the Player controller.

## Resume Behaviour
When a Library item is resumed, the saved positionSeconds is used as the initial playback position. If no progress exists, playback starts from time zero. The runtime uses the existing Player resume mechanism rather than introducing a Library-specific playback path.

## Listening History Integration
Playback progress updates continue to flow through the existing Library history mutation path. Library triggers the same mutation used elsewhere and avoids introducing duplicate progress-tracking logic.

## Architecture Preservation
Feature ownership remains intact. Library remains responsible for presenting and triggering playback actions; Player remains responsible for runtime, state, queue, and playback control. No circular dependencies were introduced.

## Runtime Preservation
Auth, Podcast runtime, Episode runtime, Search, Queue, Repeat, Shuffle, and AppShell were not changed.

## Build Results
- Vitest: 18/18 tests passed for Player runtime regression suite
- Web lint: passed with one non-blocking React hook warning in the Library component dependency list
- Web build: completed successfully

## Risks
- The Library UI now relies on Player state for current-playing indicators, so any future Player state shape change should preserve the currentItem contract.
- Resume timing is intentionally minimal and relies on the existing Player runtime rather than introducing a separate playback abstraction.

## Final Recommendation
The Library-Player integration is complete for the current phase. The implementation stays within the existing architecture, preserves Player ownership, and enables continue-listening resume without introducing duplicated runtime or state ownership.
