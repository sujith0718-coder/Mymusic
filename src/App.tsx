import { useState, useCallback } from 'react';
import { recordings, type Recording } from './data/recordings';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { Sidebar, type NavTab } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { HomeExperience } from './components/HomeExperience';
import { RecordingsLibrary } from './components/RecordingsLibrary';
import { SearchView } from './components/SearchView';
import { AudioPlayer } from './components/AudioPlayer';
import { NowPlayingExperience } from './components/NowPlayingExperience';
import GlowCursor from './components/GlowCursor';

export default function App() {
  const { state, controls } = useAudioPlayer(recordings);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedCollectionFilter, setSelectedCollectionFilter] = useState<string | null>(null);

  const handleSelectTrack = useCallback(
    (track: Recording) => {
      controls.play(track);
    },
    [controls]
  );

  const handleSelectCollection = (col: string) => {
    setSelectedCollectionFilter(col);
    setActiveTab('library');
  };

  return (
    <GlowCursor
      color="#8b5cf6"
      secondaryColor="#38bdf8"
      intensity={1.2}
      trailWidth={2.8}
      linger={1.2}
      glow={1.1}
      clickBurst
      theme="dark"
      style={{ minHeight: '100vh', width: '100%' }}
    >
      <div className="platform-layout">
      {/* Desktop Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'library') setSelectedCollectionFilter(null);
          setActiveTab(tab);
        }}
        onSelectCollection={handleSelectCollection}
        trackCount={recordings.length}
      />

      {/* Main Content Viewport */}
      <div className="platform-main">
        {/* Top Floating App Bar */}
        <header className="platform-topbar">
          <div className="platform-topbar__tabs">
            <button
              className={`platform-topbar__tab ${activeTab === 'home' ? 'platform-topbar__tab--active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              Home
            </button>
            <button
              className={`platform-topbar__tab ${activeTab === 'player' ? 'platform-topbar__tab--active' : ''}`}
              onClick={() => setActiveTab('player')}
            >
              Now Playing
            </button>
            <button
              className={`platform-topbar__tab ${activeTab === 'library' ? 'platform-topbar__tab--active' : ''}`}
              onClick={() => {
                setSelectedCollectionFilter(null);
                setActiveTab('library');
              }}
            >
              Recordings
            </button>
            <button
              className={`platform-topbar__tab ${activeTab === 'search' ? 'platform-topbar__tab--active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              Search
            </button>
          </div>

          <div className="platform-topbar__actions">
            <span className="status-badge status-badge--approved">
              <span className="status-badge__dot" />
              Public Archive
            </span>
          </div>
        </header>

        {/* View Switcher based on Active Tab */}
        <main className="platform-content">
          {activeTab === 'home' && (
            <HomeExperience
              recordings={recordings}
              currentTrackId={state.currentTrack?.id ?? null}
              isPlaying={state.isPlaying}
              recentlyPlayedIds={state.recentlyPlayedIds}
              onSelectTrack={handleSelectTrack}
              onExploreLibrary={() => {
                setSelectedCollectionFilter(null);
                setActiveTab('library');
              }}
            />
          )}

          {activeTab === 'player' && (
            <NowPlayingExperience
              state={state}
              controls={controls}
              recordings={recordings}
              onClose={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'library' && (
            <RecordingsLibrary
              recordings={recordings}
              currentTrackId={state.currentTrack?.id ?? null}
              isPlaying={state.isPlaying}
              selectedCollectionFilter={selectedCollectionFilter}
              onSelectTrack={handleSelectTrack}
            />
          )}

          {activeTab === 'search' && (
            <SearchView
              recordings={recordings}
              currentTrackId={state.currentTrack?.id ?? null}
              isPlaying={state.isPlaying}
              onSelectTrack={handleSelectTrack}
            />
          )}

          <footer className="footer" style={{ padding: '3rem 1.5rem', marginBottom: '80px' }}>
            <div className="footer__inner">
              <p className="footer__text">
                My Music • {recordings.length} personal vocal recordings.
              </p>
              <p className="footer__subtext">
                Free, open acoustic catalog. No sign-in or tracking required.
              </p>
            </div>
          </footer>
        </main>
      </div>

      {/* Persistent Bottom Music Player */}
      <AudioPlayer
        state={state}
        controls={controls}
        onExpand={() => setActiveTab('player')}
      />

      {/* Compact Mobile Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'library') setSelectedCollectionFilter(null);
          setActiveTab(tab);
        }}
      />
      </div>
    </GlowCursor>
  );
}
