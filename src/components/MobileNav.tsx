import type { NavTab } from './Sidebar';

interface MobileNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <button
        className={`mobile-nav__item ${activeTab === 'home' ? 'mobile-nav__item--active' : ''}`}
        onClick={() => onTabChange('home')}
        aria-label="Home"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>Home</span>
      </button>

      <button
        className={`mobile-nav__item ${activeTab === 'player' ? 'mobile-nav__item--active' : ''}`}
        onClick={() => onTabChange('player')}
        aria-label="Now Playing"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
        </svg>
        <span>Player</span>
      </button>

      <button
        className={`mobile-nav__item ${activeTab === 'library' ? 'mobile-nav__item--active' : ''}`}
        onClick={() => onTabChange('library')}
        aria-label="Recordings"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
        <span>Recordings</span>
      </button>

      <button
        className={`mobile-nav__item ${activeTab === 'search' ? 'mobile-nav__item--active' : ''}`}
        onClick={() => onTabChange('search')}
        aria-label="Search"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>Search</span>
      </button>
    </nav>
  );
}
