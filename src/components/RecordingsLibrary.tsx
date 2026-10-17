import { useState, useMemo, forwardRef } from 'react';
import type { Recording } from '../data/recordings';
import { TrackArtwork } from './TrackArtwork';

interface RecordingsLibraryProps {
  recordings: Recording[];
  currentTrackId: string | null;
  isPlaying: boolean;
  selectedCollectionFilter?: string | null;
  onSelectTrack: (track: Recording) => void;
}

export const RecordingsLibrary = forwardRef<HTMLElement, RecordingsLibraryProps>(
  function RecordingsLibrary(
    {
      recordings,
      currentTrackId,
      isPlaying,
      selectedCollectionFilter = null,
      onSelectTrack,
    },
    ref
  ) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCollection, setSelectedCollection] = useState<string>(selectedCollectionFilter || 'All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filter tracks by query and collection
    const filteredRecordings = useMemo(() => {
      return recordings.filter((track) => {
        const matchesCollection =
          selectedCollection === 'All' || track.collection === selectedCollection;

        if (!matchesCollection) return false;

        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase();
        return (
          track.title.toLowerCase().includes(q) ||
          track.description.toLowerCase().includes(q) ||
          track.mood.toLowerCase().includes(q) ||
          track.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }, [recordings, selectedCollection, searchQuery]);

    return (
      <section className="library-view" ref={ref} id="library" aria-label="Music recordings library">
        {/* Library Header */}
        <div className="library-header">
          <div>
            <div className="library-header__tag">
              <span>Archive Collection</span>
              <span>•</span>
              <span>{recordings.length} Recordings</span>
            </div>
            <h1 className="library-header__title">Recordings Library</h1>
            <p className="library-header__desc">
              Explore intimate vocal recordings, melody sketches, and harmonic studies. Tap any track to listen immediately.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="view-toggle" role="group" aria-label="Library view mode">
            <button
              className={`view-toggle__btn ${viewMode === 'grid' ? 'view-toggle__btn--active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              title="Grid view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button
              className={`view-toggle__btn ${viewMode === 'list' ? 'view-toggle__btn--active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
              title="List view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="3" />
                <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="3" />
                <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="library-toolbar">
          {/* Search Input */}
          <div className="library-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="library-search__icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="library-search__input"
              placeholder="Search by title, mood, or tags (e.g. dawn, warm, harmony)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search recordings"
            />
            {searchQuery && (
              <button
                className="library-search__clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Collection Filter Chips */}
          <div className="filter-chips" role="radiogroup" aria-label="Filter collections">
            {['All', 'Intimate & Soft', 'Warm & Harmonious', 'Ambient & Deep'].map((col) => {
              const count = col === 'All' ? recordings.length : recordings.filter((r) => r.collection === col).length;
              const isActive = selectedCollection === col;
              return (
                <button
                  key={col}
                  className={`filter-chip ${isActive ? 'filter-chip--active' : ''}`}
                  onClick={() => setSelectedCollection(col)}
                  role="radio"
                  aria-checked={isActive}
                >
                  <span>{col}</span>
                  <span className="filter-chip__count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        {filteredRecordings.length === 0 ? (
          <div className="library-empty">
            <div className="library-empty__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <h3 className="library-empty__title">No recordings match your search</h3>
            <p className="library-empty__desc">
              We couldn't find any recordings matching "{searchQuery}". Try searching for another keyword.
            </p>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCollection('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="library-grid" role="list">
            {filteredRecordings.map((track) => {
              const isActive = currentTrackId === track.id;
              const isTrackPlaying = isActive && isPlaying;
              return (
                <div
                  key={track.id}
                  className={`library-card ${isActive ? 'library-card--active' : ''}`}
                  onClick={() => onSelectTrack(track)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${track.title} - ${track.mood}`}
                >
                  <div className="library-card__art-box">
                    <TrackArtwork
                      recording={track}
                      size="lg"
                      isPlaying={isTrackPlaying}
                    />

                    <div className="library-card__hover-play">
                      {isTrackPlaying ? (
                        <div className="eq-bars">
                          {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="eq-bar" style={{ background: '#fff' }} />
                          ))}
                        </div>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="6 4 19 12 6 20 6 4" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="library-card__content">
                    <div className="library-card__title-row">
                      <h3 className="library-card__title">{track.title}</h3>
                      <span className="library-card__mood-tag">{track.mood}</span>
                    </div>
                    <p className="library-card__desc">{track.description}</p>
                    <div className="library-card__tags">
                      {track.tags.map((tag) => (
                        <span key={tag} className="library-card__tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="library-table-wrap">
            <table className="library-table" aria-label="Recordings table">
              <thead>
                <tr>
                  <th style={{ width: '48px' }}>#</th>
                  <th>Title & Description</th>
                  <th>Mood</th>
                  <th>Collection</th>
                  <th style={{ textAlign: 'right' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecordings.map((track, idx) => {
                  const isActive = currentTrackId === track.id;
                  const isTrackPlaying = isActive && isPlaying;
                  return (
                    <tr
                      key={track.id}
                      className={`library-row ${isActive ? 'library-row--active' : ''}`}
                      onClick={() => onSelectTrack(track)}
                    >
                      <td className="library-row__idx">
                        {isTrackPlaying ? (
                          <div className="eq-bars eq-bars--sm">
                            {[0, 1, 2].map((i) => (
                              <div key={i} className="eq-bar" style={{ background: track.accentColor }} />
                            ))}
                          </div>
                        ) : (
                          <span className="library-row__num">{idx + 1}</span>
                        )}
                        <span className="library-row__play-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="6 4 19 12 6 20 6 4" />
                          </svg>
                        </span>
                      </td>

                      <td className="library-row__title-col">
                        <TrackArtwork recording={track} size="sm" />
                        <div className="library-row__info">
                          <span className="library-row__title">{track.title}</span>
                          <span className="library-row__desc">{track.description}</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className="status-pill status-pill--approved"
                          style={{ background: `${track.accentColor}18`, color: track.accentColor }}
                        >
                          {track.mood}
                        </span>
                      </td>

                      <td className="library-row__collection">{track.collection}</td>

                      <td style={{ textAlign: 'right' }} className="library-row__duration">
                        {track.durationApprox || '0:35'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }
);
