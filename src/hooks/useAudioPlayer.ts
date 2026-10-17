import { useState, useRef, useCallback, useEffect } from 'react';
import type { Recording } from '../data/recordings';

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentTrack: Recording | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  shuffle: boolean;
  repeat: RepeatMode;
  recentlyPlayedIds: string[];
}

export interface PlayerControls {
  play: (track: Recording) => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  selectTrack: (track: Recording) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setError: (err: string | null) => void;
}

const RECENT_KEY = 'mymusic_recent_recordings';

export function useAudioPlayer(playlist: Recording[] = []) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const prevVolumeRef = useRef<number>(0.8);

  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    isLoading: false,
    error: null,
    shuffle: false,
    repeat: 'off',
    recentlyPlayedIds,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const saveRecentTrack = useCallback((trackId: string) => {
    setRecentlyPlayedIds((prev) => {
      const next = [trackId, ...prev.filter((id) => id !== trackId)].slice(0, 10);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // Ignore quota
      }
      return next;
    });
  }, []);

  const startTimeLoop = useCallback(() => {
    const tick = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        setState((s) => ({ ...s, currentTime: audio.currentTime }));
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const play = useCallback((track: Recording) => {
    const audio = audioRef.current;
    if (!audio) return;

    saveRecentTrack(track.id);

    // If same track, just resume
    if (stateRef.current.currentTrack?.id === track.id && audio.src) {
      audio.play().then(() => {
        setState((s) => ({ ...s, isPlaying: true, error: null }));
        startTimeLoop();
      }).catch(() => {
        setState((s) => ({ ...s, error: 'Playback was blocked. Click play again.' }));
      });
      return;
    }

    setState((s) => ({
      ...s,
      currentTrack: track,
      isLoading: true,
      currentTime: 0,
      error: null,
    }));

    audio.src = track.audioSrc;
    audio.load();
    audio.play().then(() => {
      setState((s) => ({ ...s, isPlaying: true, isLoading: false }));
      startTimeLoop();
    }).catch(() => {
      setState((s) => ({
        ...s,
        isPlaying: false,
        isLoading: false,
        error: 'Playback was blocked by browser. Click play again.',
      }));
    });
  }, [startTimeLoop, saveRecentTrack]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    cancelAnimationFrame(rafRef.current);
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const togglePlay = useCallback(() => {
    if (stateRef.current.isPlaying) {
      pause();
    } else if (stateRef.current.currentTrack) {
      play(stateRef.current.currentTrack);
    } else if (playlist.length > 0) {
      play(playlist[0]);
    }
  }, [pause, play, playlist]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(time, audio.duration || time));
    audio.currentTime = clamped;
    setState((s) => ({ ...s, currentTime: clamped }));
  }, []);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(1, vol));
    audio.volume = clamped;
    if (clamped > 0) prevVolumeRef.current = clamped;
    setState((s) => ({ ...s, volume: clamped, isMuted: clamped === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (stateRef.current.isMuted || stateRef.current.volume === 0) {
      const restored = prevVolumeRef.current || 0.8;
      audio.volume = restored;
      setState((s) => ({ ...s, volume: restored, isMuted: false }));
    } else {
      prevVolumeRef.current = stateRef.current.volume;
      audio.volume = 0;
      setState((s) => ({ ...s, volume: 0, isMuted: true }));
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    setState((s) => ({ ...s, shuffle: !s.shuffle }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setState((s) => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const nextIdx = (modes.indexOf(s.repeat) + 1) % modes.length;
      return { ...s, repeat: modes[nextIdx] };
    });
  }, []);

  const nextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    const curr = stateRef.current.currentTrack;
    let nextIdx = 0;

    if (stateRef.current.shuffle) {
      nextIdx = Math.floor(Math.random() * playlist.length);
      if (playlist.length > 1 && curr && playlist[nextIdx].id === curr.id) {
        nextIdx = (nextIdx + 1) % playlist.length;
      }
    } else if (curr) {
      const currentIdx = playlist.findIndex((t) => t.id === curr.id);
      nextIdx = (currentIdx + 1) % playlist.length;
    }

    const target = playlist[nextIdx];
    play(target);
  }, [playlist, play]);

  const prevTrack = useCallback(() => {
    if (playlist.length === 0) return;
    const audio = audioRef.current;

    // If track has been playing for more than 3 seconds, restart it
    if (audio && audio.currentTime > 3) {
      seek(0);
      return;
    }

    const curr = stateRef.current.currentTrack;
    let prevIdx = 0;
    if (curr) {
      const currentIdx = playlist.findIndex((t) => t.id === curr.id);
      prevIdx = (currentIdx - 1 + playlist.length) % playlist.length;
    }

    const target = playlist[prevIdx];
    play(target);
  }, [playlist, play, seek]);

  // Audio element setup and listener registration
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = 0.8;
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setState((s) => ({ ...s, duration: audio.duration, isLoading: false, error: null }));
    };

    const onEnded = () => {
      const { repeat } = stateRef.current;
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
        return;
      }

      if (repeat === 'all' || stateRef.current.shuffle) {
        nextTrack();
        return;
      }

      setState((s) => ({ ...s, isPlaying: false, currentTime: 0 }));
      cancelAnimationFrame(rafRef.current);
    };

    const onError = () => {
      setState((s) => ({
        ...s,
        isPlaying: false,
        isLoading: false,
        error: 'Could not load audio. The file format may be unsupported on this device.',
      }));
      cancelAnimationFrame(rafRef.current);
    };

    const onWaiting = () => {
      setState((s) => ({ ...s, isLoading: true }));
    };

    const onCanPlay = () => {
      setState((s) => ({ ...s, isLoading: false }));
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      cancelAnimationFrame(rafRef.current);
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, [nextTrack]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' && e.altKey) {
        e.preventDefault();
        nextTrack();
      } else if (e.code === 'ArrowLeft' && e.altKey) {
        e.preventDefault();
        prevTrack();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seek(stateRef.current.currentTime + 5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seek(stateRef.current.currentTime - 5);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(stateRef.current.volume + 0.1);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(stateRef.current.volume - 0.1);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextTrack, prevTrack, seek, setVolume, toggleMute]);

  const selectTrack = useCallback((track: Recording) => {
    play(track);
  }, [play]);

  const setError = useCallback((err: string | null) => {
    setState((s) => ({ ...s, error: err, isLoading: false }));
  }, []);

  const controls: PlayerControls = {
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    selectTrack,
    nextTrack,
    prevTrack,
    setError,
  };

  return { state, controls, audioRef };
}
