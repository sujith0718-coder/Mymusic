export type NavTab = 'home' | 'player' | 'library' | 'search';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onSelectCollection: (col: string) => void;
  trackCount: number;
}

export function Sidebar({
  activeTab,
  onTabChange,
  onSelectCollection,
  trackCount,
}: SidebarProps) {
  return (
    <aside className="app-sidebar" aria-label="Main navigation">
      {/* Brand Header */}
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div className="sidebar__brand-text">
          <span className="sidebar__title">My Music</span>
          <span className="sidebar__subtitle">Personal Vocal Vault</span>
        </div>
      </div>

      {/* Main Navigation Items */}
      <nav className="sidebar__nav">
        <button
          className={`sidebar__nav-item ${activeTab === 'home' ? 'sidebar__nav-item--active' : ''}`}
          onClick={() => onTabChange('home')}
          aria-label="Go to Home"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </button>

        <button
          className={`sidebar__nav-item ${activeTab === 'player' ? 'sidebar__nav-item--active' : ''}`}
          onClick={() => onTabChange('player')}
          aria-label="Go to Now Playing Studio"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
          </svg>
          <span>Now Playing</span>
        </button>

        <button
          className={`sidebar__nav-item ${activeTab === 'library' ? 'sidebar__nav-item--active' : ''}`}
          onClick={() => onTabChange('library')}
          aria-label="Go to Library"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span>Recordings</span>
          <span className="sidebar__badge">{trackCount}</span>
        </button>

        <button
          className={`sidebar__nav-item ${activeTab === 'search' ? 'sidebar__nav-item--active' : ''}`}
          onClick={() => onTabChange('search')}
          aria-label="Go to Search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search</span>
        </button>
      </nav>

      {/* Curated Collections */}
      <div className="sidebar__section">
        <div className="sidebar__section-title">Collections</div>
        <div className="sidebar__playlists">
          <button
            className="sidebar__playlist-link"
            onClick={() => {
              onTabChange('library');
              onSelectCollection('Intimate & Soft');
            }}
          >
            <span className="sidebar__playlist-dot" style={{ background: 'hsl(265, 80%, 65%)' }} />
            <span>Intimate & Soft</span>
          </button>
          <button
            className="sidebar__playlist-link"
            onClick={() => {
              onTabChange('library');
              onSelectCollection('Warm & Harmonious');
            }}
          >
            <span className="sidebar__playlist-dot" style={{ background: 'hsl(35, 95%, 55%)' }} />
            <span>Warm & Harmonious</span>
          </button>
          <button
            className="sidebar__playlist-link"
            onClick={() => {
              onTabChange('library');
              onSelectCollection('Ambient & Deep');
            }}
          >
            <span className="sidebar__playlist-dot" style={{ background: 'hsl(215, 85%, 60%)' }} />
            <span>Ambient & Deep</span>
          </button>
        </div>
      </div>

      {/* Bottom Vault Info Widget */}
      <div className="sidebar__vault-card" style={{ marginTop: 'auto' }}>
        <div className="sidebar__vault-status">
          <span className="status-pill status-pill--approved">
            Public Archive
          </span>
        </div>
        <p className="sidebar__vault-desc">
          Open personal vocal catalog. Listen freely to all 17 acoustic sessions with zero ads or sign-ins.
        </p>
      </div>
    </aside>
  );
}
