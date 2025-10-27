import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ChevronLeft, ChevronRight, Music, Play } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

function CalendarView({ userRole }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allAudios, setAllAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateAudios, setSelectedDateAudios] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // États du player
  const [audioElement, setAudioElement] = useState(null);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    loadAllAudios();
  }, []);

  // Créer l'élément audio
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

  const loadAllAudios = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'audios'));
      let audiosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      audiosData = audiosData.filter(audio => {
        if (!audio.visibleFor || audio.visibleFor.length === 0) return true;
        return audio.visibleFor.includes(userRole);
      });

      setAllAudios(audiosData);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des audios:', error);
      setLoading(false);
    }
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getAudiosForDate = (date) => {
    const dateString = formatDateToString(date);
    
    return allAudios.filter(audio => {
      if (audio.date) {
        return audio.date === dateString;
      }
      if (audio.uploadedAt?.toDate) {
        const uploadDate = audio.uploadedAt.toDate();
        return formatDateToString(uploadDate) === dateString;
      }
      return false;
    });
  };

  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const hasAudiosOnDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return getAudiosForDate(date).length > 0;
  };

  const handleDayClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const audios = getAudiosForDate(date);
    setSelectedDate(date);
    setSelectedDateAudios(audios);
    setCurrentAudioIndex(0);
    setIsPlaying(false);
    
    if (audioElement) {
      audioElement.pause();
      if (audios.length > 0) {
        audioElement.src = audios[0].url;
        audioElement.load();
      }
    }
  };

  const playAudio = (index) => {
    if (!audioElement || !selectedDateAudios[index]) return;
    
    setCurrentAudioIndex(index);
    audioElement.src = selectedDateAudios[index].url;
    audioElement.load();
    audioElement.play();
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (!audioElement || selectedDateAudios.length === 0) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentAudioIndex < selectedDateAudios.length - 1) {
      playAudio(currentAudioIndex + 1);
    } else {
      setIsPlaying(false);
      audioElement.pause();
    }
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      audioElement.currentTime = 0;
    } else if (currentAudioIndex > 0) {
      playAudio(currentAudioIndex - 1);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    audioElement.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedDateAudios([]);
    setIsPlaying(false);
    if (audioElement) audioElement.pause();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
    setSelectedDateAudios([]);
    setIsPlaying(false);
    if (audioElement) audioElement.pause();
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="empty-state">
        <p>Chargement du calendrier...</p>
      </div>
    );
  }

  const { daysInMonth, startingDayOfWeek } = getMonthDays();
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div>
      <h2>📅 Vue Calendrier</h2>
      
      <div className="calendar-grid">
        {/* Calendrier */}
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={previousMonth} className="btn btn-light" style={{ padding: '8px' }}>
              <ChevronLeft size={20} />
            </button>
            
            <h3>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            
            <button onClick={nextMonth} className="btn btn-light" style={{ padding: '8px' }}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="calendar-days">
            {dayNames.map(day => (
              <div key={day} className="calendar-day-name">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-days">
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const hasAudios = hasAudiosOnDate(day);
              const isSelected = selectedDate && selectedDate.getDate() === day && 
                                 selectedDate.getMonth() === currentDate.getMonth() &&
                                 selectedDate.getFullYear() === currentDate.getFullYear();

              return (
                <div
                  key={day}
                  onClick={() => hasAudios && handleDayClick(day)}
                  className={`calendar-day ${hasAudios ? 'has-audio' : ''} ${isSelected ? 'selected' : ''}`}
                >
                  {day}
                  {hasAudios && <div className="calendar-day-indicator" />}
                </div>
              );
            })}
          </div>

          <p style={{ marginTop: '15px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
            Les jours en vert contiennent des audios
          </p>
        </div>

        {/* Lecteur et liste */}
        <div>
          {selectedDate ? (
            <div>
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
                📅 {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>

              {selectedDateAudios.length === 0 ? (
                <div className="empty-state">
                  <Music size={48} color="#ccc" />
                  <p>Aucun audio pour cette date</p>
                </div>
              ) : (
                <>
                  {/* Lecteur unifié */}
                  <AudioPlayer
                    currentAudio={selectedDateAudios[currentAudioIndex]}
                    currentIndex={currentAudioIndex}
                    totalCount={selectedDateAudios.length}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    onPlayPause={togglePlayPause}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onSeek={handleSeek}
                    canGoPrevious={currentAudioIndex > 0 || currentTime > 3}
                    canGoNext={currentAudioIndex < selectedDateAudios.length - 1}
                  />

                  {/* Liste des pistes */}
                  <div className="mb-md">
                    <h4 className="mb-sm">Liste des pistes</h4>
                    <div className="grid">
                      {selectedDateAudios.map((audio, index) => (
                        <div
                          key={audio.id}
                          onClick={() => playAudio(index)}
                          className={`audio-item ${index === currentAudioIndex ? 'active' : ''}`}
                        >
                          <div className={`audio-number ${index === currentAudioIndex ? 'active' : ''}`}>
                            {index === currentAudioIndex && isPlaying ? (
                              <Play size={20} fill="white" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="audio-info">
                            <h4>{audio.title}</h4>
                            <p>⏱️ {formatTime(audio.duration || 0)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="empty-state" style={{ height: '100%', minHeight: '400px' }}>
              <Music size={64} color="#ccc" />
              <h3>Sélectionnez un jour</h3>
              <p>Cliquez sur un jour en vert dans le calendrier pour voir ses audios</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarView;