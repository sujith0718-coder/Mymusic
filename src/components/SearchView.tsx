import { useState, useMemo } from 'react';
import type { Recording } from '../data/recordings';
import { TrackArtwork } from './TrackArtwork';

interface SearchViewProps {
  recordings: Recording[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onSelectTrack: (track: Recording) => void;
}

export function SearchView({
  recordings,
  currentTrackId,
  isPlaying,
  onSelectTrack,
}: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // All unique moods and tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    recordings.forEach((r) => {
      set.add(r.mood);
      r.tags.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [recordings]);

  const searchResults = useMemo(() => {
    if (!query.trim() && !selectedTag) {
      return [];
    }

    const q = query.toLowerCase().trim();
    return recordings.filter((r) => {
      const matchesTag = !selectedTag || r.mood === selectedTag || r.tags.includes(selectedTag);
      if (!q) return matchesTag;

      return (
        matchesTag &&
        (r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.mood.toLowerCase().includes(q) ||
          r.collection.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }, [recordings, query, selectedTag]);

  return (
    <div className="search-view" aria-label="Search recordings">
      {/* Big Search Input */}
      <div className="search-hero">
        <h1 className="search-hero__title">Search Vault</h1>
        <p className="search-hero__desc">Search across all vocal sessions, moods, and harmonic styles.</p>

        <div className="search-input-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-input-box__icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input-box__input"
            placeholder="What do you want to listen to? (e.g. Dawn, Warm, Ambient)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="search-input-box__clear" onClick={() => setQuery('')}>
              ✕
            </button>
          )}
        </div>

        {/* Quick Tag Pills */}
        <div className="search-tags">
          <span className="search-tags__label">Explore moods:</span>
          {allTags.slice(0, 10).map((tag) => (
            <button
              key={tag}
              className={`search-tag-chip ${selectedTag === tag ? 'search-tag-chip--active' : ''}`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="search-results">
        {searchResults.length > 0 ? (
          <div className="search-results__grid">
            {searchResults.map((track) => {
              const isActive = currentTrackId === track.id;
              const isTrackPlaying = isActive && isPlaying;
              return (
                <div
                  key={track.id}
                  className={`search-card ${isActive ? 'search-card--active' : ''}`}
                  onClick={() => onSelectTrack(track)}
                >
                  <TrackArtwork recording={track} size="md" isPlaying={isTrackPlaying} />
                  <div className="search-card__body">
                    <span className="search-card__title">{track.title}</span>
                    <span className="search-card__desc">{track.description}</span>
                    <div className="search-card__meta">
                      <span className="search-card__mood">{track.mood}</span>
                      <span className="search-card__duration">{track.durationApprox}</span>
                    </div>
                  </div>
                  <button className="search-card__play" aria-label={`Play ${track.title}`}>
                    {isTrackPlaying ? (
                      <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 19 12 6 20 6 4" /></svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : query || selectedTag ? (
          <div className="library-empty">
            <h3 className="library-empty__title">No matching recordings found</h3>
            <p className="library-empty__desc">Try checking the spelling or searching for another keyword.</p>
          </div>
        ) : (
          <div className="search-suggestions">
            <h3 className="search-suggestions__title">All Available Vocal Tracks</h3>
            <div className="search-results__grid">
              {recordings.slice(0, 8).map((track) => (
                <div
                  key={track.id}
                  className="search-card"
                  onClick={() => onSelectTrack(track)}
                >
                  <TrackArtwork recording={track} size="md" />
                  <div className="search-card__body">
                    <span className="search-card__title">{track.title}</span>
                    <span className="search-card__desc">{track.description}</span>
                    <span className="search-card__mood">{track.mood}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
