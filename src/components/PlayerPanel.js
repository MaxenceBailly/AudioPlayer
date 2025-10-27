import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { List, Music, Calendar as CalendarIcon } from 'lucide-react';
import CalendarView from './CalendarView';
import AudioPlayer from './AudioPlayer';

function PlayerPanel({ userRole }) {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [audios, setAudios] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('playlist');

  useEffect(() => {
    loadPlaylists();
  }, []);

  useEffect(() => {
    const audio = new Audio();
    
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });
    
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    
    audio.addEventListener('ended', () => {
      handleNext();
    });

    setAudioElement(audio);

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const loadPlaylists = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'playlists'));
      const playlistsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlaylists(playlistsData.sort((a, b) => a.order - b.order));
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des playlists:', error);
      setLoading(false);
    }
  };

  const loadPlaylistAudios = async (playlistId) => {
    try {
      const q = query(
        collection(db, 'audios'),
        where('playlistId', '==', playlistId)
      );
      const querySnapshot = await getDocs(q);
      let audiosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      audiosData = audiosData.filter(audio => {
        if (!audio.visibleFor || audio.visibleFor.length === 0) return true;
        return audio.visibleFor.includes(userRole);
      });
      
      audiosData.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      setAudios(audiosData);
      setCurrentAudioIndex(0);
      
      if (audiosData.length > 0 && audioElement) {
        audioElement.src = audiosData[0].url;
        audioElement.load();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des audios:', error);
    }
  };

  const handleSelectPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
    setIsPlaying(false);
    if (audioElement) {
      audioElement.pause();
    }
    loadPlaylistAudios(playlist.id);
  };

  const togglePlayPause = () => {
    if (!audioElement || audios.length === 0) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (!audioElement) return;
    
    if (currentAudioIndex < audios.length - 1) {
      const nextIndex = currentAudioIndex + 1;
      setCurrentAudioIndex(nextIndex);
      audioElement.src = audios[nextIndex].url;
      audioElement.load();
      if (isPlaying) {
        audioElement.play();
      }
    } else {
      setIsPlaying(false);
      audioElement.pause();
    }
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      audioElement.currentTime = 0;
    } else if (currentAudioIndex > 0) {
      const prevIndex = currentAudioIndex - 1;
      setCurrentAudioIndex(prevIndex);
      audioElement.src = audios[prevIndex].url;
      audioElement.load();
      if (isPlaying) {
        audioElement.play();
      }
    }
  };

  const handleSelectAudio = (index) => {
    setCurrentAudioIndex(index);
    audioElement.src = audios[index].url;
    audioElement.load();
    audioElement.play();
    setIsPlaying(true);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    audioElement.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="empty-state">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sélecteur de vue */}
      <div className="view-switcher">
        <button
          onClick={() => setViewMode('playlist')}
          className={viewMode === 'playlist' ? 'active' : ''}
        >
          <List size={20} />
          Vue Playlists
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={viewMode === 'calendar' ? 'active' : ''}
        >
          <CalendarIcon size={20} />
          Vue Calendrier
        </button>
      </div>

      {viewMode === 'playlist' ? (
        <div>
          <h2>🎵 Lecteur Audio</h2>

          {!selectedPlaylist ? (
            <div>
              <p className="text-muted mb-md">
                Sélectionnez une playlist pour commencer à écouter
              </p>
              
              {playlists.length === 0 ? (
                <div className="empty-state">
                  <Music size={48} color="#ccc" />
                  <p>Aucune playlist disponible pour le moment</p>
                </div>
              ) : (
                <div className="grid grid-2">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      onClick={() => handleSelectPlaylist(playlist)}
                      className="card card-hover"
                    >
                      <div className="flex gap-md">
                        <List size={32} color="#4CAF50" />
                        <div>
                          <h3 style={{ margin: 0, fontSize: '20px' }}>{playlist.name}</h3>
                          <p className="text-muted" style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                            Cliquez pour ouvrir
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <button
                onClick={() => {
                  setSelectedPlaylist(null);
                  setIsPlaying(false);
                  if (audioElement) {
                    audioElement.pause();
                  }
                }}
                className="btn btn-light mb-md"
              >
                ← Retour aux playlists
              </button>

              <h3 className="mb-md">📁 {selectedPlaylist.name}</h3>

              {audios.length === 0 ? (
                <div className="empty-state">
                  <Music size={48} color="#ccc" />
                  <p>Aucun audio disponible pour vous dans cette playlist</p>
                </div>
              ) : (
                <>
                  {/* Lecteur unifié */}
                  <AudioPlayer
                    currentAudio={audios[currentAudioIndex]}
                    currentIndex={currentAudioIndex}
                    totalCount={audios.length}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    onPlayPause={togglePlayPause}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onSeek={handleSeek}
                    canGoPrevious={currentAudioIndex > 0 || currentTime > 3}
                    canGoNext={currentAudioIndex < audios.length - 1}
                  />

                  {/* Liste des pistes */}
                  <div>
                    <h4 className="mb-sm">Liste des pistes</h4>
                    <div className="grid">
                      {audios.map((audio, index) => (
                        <div
                          key={audio.id}
                          onClick={() => handleSelectAudio(index)}
                          className={`audio-item ${index === currentAudioIndex ? 'active' : ''}`}
                        >
                          <div className={`audio-number ${index === currentAudioIndex ? 'active' : ''}`}>
                            {index + 1}
                          </div>
                          <div className="audio-info">
                            <h4>{audio.title}</h4>
                            <p>
                              {formatTime(audio.duration || 0)}
                              {audio.date && ` • 📅 ${audio.date}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <CalendarView userRole={userRole} />
      )}
    </div>
  );
}

export default PlayerPanel;