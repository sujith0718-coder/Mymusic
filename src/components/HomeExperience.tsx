import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { Recording } from '../data/recordings';
import { TrackArtwork } from './TrackArtwork';
import Lightfall from './Lightfall';
import CircularGallery from './CircularGallery';
import { HoloCard } from './HoloCard';

interface HomeExperienceProps {
  recordings: Recording[];
  currentTrackId: string | null;
  isPlaying: boolean;
  recentlyPlayedIds: string[];
  onSelectTrack: (track: Recording) => void;
  onExploreLibrary: () => void;
}

export function HomeExperience({
  recordings,
  currentTrackId,
  isPlaying,
  recentlyPlayedIds,
  onSelectTrack,
  onExploreLibrary,
}: HomeExperienceProps) {
  const shouldReduce = useReducedMotion();

  // Featured track
  const featuredTrack = useMemo(() => {
    return recordings.find((r) => r.id === 'track-12') || recordings[0];
  }, [recordings]);

  // Genuine playback history (only tracks actually listened to)
  const recentlyPlayedTracks = useMemo(() => {
    return recentlyPlayedIds
      .map((id) => recordings.find((r) => r.id === id))
      .filter((t): t is Recording => t !== undefined)
      .slice(0, 6);
  }, [recentlyPlayedIds, recordings]);

  // Curated collections
  const collections = useMemo(() => {
    return {
      intimate: recordings.filter((r) => r.collection === 'Intimate & Soft'),
      warm: recordings.filter((r) => r.collection === 'Warm & Harmonious'),
      ambient: recordings.filter((r) => r.collection === 'Ambient & Deep'),
    };
  }, [recordings]);

  // Gallery items for 3D CircularGallery component
  const galleryItems = useMemo(() => {
    return recordings.map((r) => ({
      image: r.artwork || '/images/whispered_dawn.jpg',
      text: r.title,
      description: `${r.mood} • ${r.collection} • ${r.durationApprox || '0:35'}`,
      alt: `${r.title} vocal recording artwork`,
    }));
  }, [recordings]);

  return (
    <div className="home-view">
      {/* Spotlight Hero Banner with Lightfall Dynamic Background */}
      <section className="spotlight-hero" aria-label="Featured vocal recording" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.35 }}>
          <Lightfall
            colors={[featuredTrack.accentColor, featuredTrack.secondaryColor, '#ffffff']}
            backgroundColor="#0a0a16"
            speed={0.25}
            streakCount={3}
            streakWidth={0.8}
            twinkle={0.35}
            backgroundGlow={0.15}
            headGlow={0.65}
            bloom={0.35}
            mouseInteraction
            holdToWarp
            intro
          />
        </div>

        <div
          className="spotlight-hero__bg"
          style={{
            background: `radial-gradient(ellipse at 80% 20%, ${featuredTrack.accentColor}28 0%, transparent 70%), radial-gradient(ellipse at 20% 80%, ${featuredTrack.secondaryColor}20 0%, transparent 60%), transparent`,
            zIndex: 1,
          }}
        />

        <div className="spotlight-hero__content" style={{ position: 'relative', zIndex: 2 }}>
          <div className="spotlight-hero__badge">
            <span className="spotlight-hero__badge-dot" style={{ background: featuredTrack.accentColor }} />
            <span>Featured Spotlight</span>
            <span className="spotlight-hero__badge-sep">•</span>
            <span>{featuredTrack.mood}</span>
          </div>

          <h1 className="spotlight-hero__title">{featuredTrack.title}</h1>
          <p className="spotlight-hero__desc">{featuredTrack.description}</p>

          <div className="spotlight-hero__meta">
            <span className="spotlight-hero__tag">{featuredTrack.collection}</span>
            <span className="spotlight-hero__tag">Duration: {featuredTrack.durationApprox || '0:35'}</span>
          </div>

          <div className="spotlight-hero__actions">
            <motion.button
              className="btn btn--spotlight-play"
              onClick={() => onSelectTrack(featuredTrack)}
              whileHover={shouldReduce ? {} : { scale: 1.04 }}
              whileTap={shouldReduce ? {} : { scale: 0.96 }}
              aria-label={`Play ${featuredTrack.title}`}
            >
              {currentTrackId === featuredTrack.id && isPlaying ? (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="btn__icon">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="btn__icon">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Play Now</span>
                </>
              )}
            </motion.button>

            <button className="btn btn--ghost" onClick={onExploreLibrary}>
              Browse Full Archive
            </button>
          </div>
        </div>

        {/* Large Featured Artwork with 3D Holographic Tilt */}
        <div className="spotlight-hero__art-wrap" style={{ position: 'relative', zIndex: 2 }}>
          <HoloCard glare={0.45} holo={0.35}>
            <TrackArtwork
              recording={featuredTrack}
              size="featured"
              isPlaying={currentTrackId === featuredTrack.id && isPlaying}
            />
          </HoloCard>
        </div>
      </section>

      {/* 3D Vocal Carousel Exhibition from React Bits */}
      <section className="home-section" aria-label="3D Vocal Carousel Exhibition">
        <div className="home-section__header">
          <div>
            <h2 className="home-section__title">3D Vocal Carousel Exhibition</h2>
            <p className="home-section__subtitle">Drag, scroll, or click any session to explore its artwork and soundscape</p>
          </div>
          <button className="home-section__more" onClick={onExploreLibrary}>
            Explore all {recordings.length}
          </button>
        </div>

        <div className="circular-gallery-wrapper">
          <CircularGallery
            items={galleryItems}
            bend={2.0}
            itemSize={0.85}
            textColor="#ffffff"
            borderRadius={0.06}
            scrollEase={0.05}
            scrollSpeed={2}
            shadow={0.3}
            onItemClick={(_item, index) => {
              if (recordings[index]) {
                onSelectTrack(recordings[index]);
              }
            }}
          />
        </div>
      </section>

      {/* Genuine Recently Played Section */}
      {recentlyPlayedTracks.length > 0 && (
        <section className="home-section" aria-label="Recently played recordings">
          <div className="home-section__header">
            <div>
              <h2 className="home-section__title">Recently Played</h2>
              <p className="home-section__subtitle">Jump back into your recent listening</p>
            </div>
          </div>

          <div className="recent-grid">
            {recentlyPlayedTracks.map((track) => {
              const isTrackPlaying = currentTrackId === track.id && isPlaying;
              return (
                <div
                  key={track.id}
                  className={`recent-card ${currentTrackId === track.id ? 'recent-card--active' : ''}`}
                  onClick={() => onSelectTrack(track)}
                  role="button"
                  tabIndex={0}
                >
                  <TrackArtwork
                    recording={track}
                    size="sm"
                    isPlaying={isTrackPlaying}
                  />
                  <div className="recent-card__info">
                    <span className="recent-card__title">{track.title}</span>
                    <span className="recent-card__mood">{track.mood}</span>
                  </div>
                  <button className="recent-card__play" aria-label={`Play ${track.title}`}>
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
        </section>
      )}

      {/* Curated Collection 1: Intimate & Soft */}
      <section className="home-section" aria-label="Intimate and Soft collection">
        <div className="home-section__header">
          <div>
            <h2 className="home-section__title">Intimate & Soft</h2>
            <p className="home-section__subtitle">Delicate vocal phrasing and gentle morning acoustic colors</p>
          </div>
          <button className="home-section__more" onClick={onExploreLibrary}>
            See all ({collections.intimate.length})
          </button>
        </div>

        <div className="cards-slider">
          {collections.intimate.map((track) => {
            const isTrackActive = currentTrackId === track.id;
            const isTrackPlaying = isTrackActive && isPlaying;
            return (
              <div
                key={track.id}
                className={`music-card ${isTrackActive ? 'music-card--active' : ''}`}
                onClick={() => onSelectTrack(track)}
                role="button"
                tabIndex={0}
              >
                <div className="music-card__art-box">
                  <TrackArtwork
                    recording={track}
                    size="lg"
                    isPlaying={isTrackPlaying}
                  />
                  <div className="music-card__hover-play">
                    {isTrackPlaying ? (
                      <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 19 12 6 20 6 4" /></svg>
                    )}
                  </div>
                </div>

                <div className="music-card__body">
                  <span className="music-card__title">{track.title}</span>
                  <span className="music-card__desc">{track.description}</span>
                  <div className="music-card__footer">
                    <span className="music-card__mood">{track.mood}</span>
                    <span className="music-card__duration">{track.durationApprox}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Curated Collection 2: Warm & Harmonious */}
      <section className="home-section" aria-label="Warm and Harmonious collection">
        <div className="home-section__header">
          <div>
            <h2 className="home-section__title">Warm & Harmonious</h2>
            <p className="home-section__subtitle">Resonant vocal harmonies and golden afternoon tones</p>
          </div>
          <button className="home-section__more" onClick={onExploreLibrary}>
            See all ({collections.warm.length})
          </button>
        </div>

        <div className="cards-slider">
          {collections.warm.map((track) => {
            const isTrackActive = currentTrackId === track.id;
            const isTrackPlaying = isTrackActive && isPlaying;
            return (
              <div
                key={track.id}
                className={`music-card ${isTrackActive ? 'music-card--active' : ''}`}
                onClick={() => onSelectTrack(track)}
                role="button"
                tabIndex={0}
              >
                <div className="music-card__art-box">
                  <TrackArtwork
                    recording={track}
                    size="lg"
                    isPlaying={isTrackPlaying}
                  />
                  <div className="music-card__hover-play">
                    {isTrackPlaying ? (
                      <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 19 12 6 20 6 4" /></svg>
                    )}
                  </div>
                </div>

                <div className="music-card__body">
                  <span className="music-card__title">{track.title}</span>
                  <span className="music-card__desc">{track.description}</span>
                  <div className="music-card__footer">
                    <span className="music-card__mood">{track.mood}</span>
                    <span className="music-card__duration">{track.durationApprox}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Curated Collection 3: Ambient & Deep */}
      <section className="home-section" aria-label="Ambient and Deep collection">
        <div className="home-section__header">
          <div>
            <h2 className="home-section__title">Ambient & Deep</h2>
            <p className="home-section__subtitle">Atmospheric reverberation and meditative vocal depth</p>
          </div>
          <button className="home-section__more" onClick={onExploreLibrary}>
            See all ({collections.ambient.length})
          </button>
        </div>

        <div className="cards-slider">
          {collections.ambient.map((track) => {
            const isTrackActive = currentTrackId === track.id;
            const isTrackPlaying = isTrackActive && isPlaying;
            return (
              <div
                key={track.id}
                className={`music-card ${isTrackActive ? 'music-card--active' : ''}`}
                onClick={() => onSelectTrack(track)}
                role="button"
                tabIndex={0}
              >
                <div className="music-card__art-box">
                  <TrackArtwork
                    recording={track}
                    size="lg"
                    isPlaying={isTrackPlaying}
                  />
                  <div className="music-card__hover-play">
                    {isTrackPlaying ? (
                      <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 19 12 6 20 6 4" /></svg>
                    )}
                  </div>
                </div>

                <div className="music-card__body">
                  <span className="music-card__title">{track.title}</span>
                  <span className="music-card__desc">{track.description}</span>
                  <div className="music-card__footer">
                    <span className="music-card__mood">{track.mood}</span>
                    <span className="music-card__duration">{track.durationApprox}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
