import React from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

function AudioPlayer({
  currentAudio,
  currentIndex,
  totalCount,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  canGoPrevious,
  canGoNext
}) {
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentAudio) {
    return null;
  }

  return (
    <div className="player-container">
      <div className="player-title">
        <h2>{currentAudio.title}</h2>
        <p>Piste {currentIndex + 1} sur {totalCount}</p>
      </div>

      <div className="player-progress">
        <input
          type="range"
          min="0"
          max="100"
          value={duration ? (currentTime / duration) * 100 : 0}
          onChange={onSeek}
        />
        <div className="player-time">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-controls">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="btn btn-light btn-icon"
        >
          <SkipBack size={24} />
        </button>

        <button
          onClick={onPlayPause}
          className="btn btn-primary btn-icon"
          style={{ width: '60px', height: '60px' }}
        >
          {isPlaying ? <Pause size={32} /> : <Play size={32} />}
        </button>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="btn btn-light btn-icon"
        >
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  );
}

export default AudioPlayer;