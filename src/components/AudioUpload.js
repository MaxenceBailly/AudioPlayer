import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { uploadToCloudinary } from '../cloudinary';
import { ROLES } from '../config';
import { Upload, Trash2, Music, Calendar, Edit2, Save, X } from 'lucide-react';

function AudioUpload({ playlists }) {
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioTitle, setAudioTitle] = useState('');
  const [audioDate, setAudioDate] = useState('');
  const [visibleFor, setVisibleFor] = useState([ROLES.ADMIN, ROLES.PRINCESS, ROLES.READER]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audios, setAudios] = useState([]);
  const [loadingAudios, setLoadingAudios] = useState(true);
  
  // États pour l'édition
  const [editingAudioId, setEditingAudioId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPlaylist, setEditPlaylist] = useState('');
  const [editVisibleFor, setEditVisibleFor] = useState([]);

  useEffect(() => {
    loadAudios();
  }, []);

  const loadAudios = async () => {
    try {
      const q = query(collection(db, 'audios'), orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const audiosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAudios(audiosData);
      setLoadingAudios(false);
    } catch (error) {
      console.error('Erreur lors du chargement des audios:', error);
      setLoadingAudios(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        alert('Veuillez sélectionner un fichier audio');
        return;
      }
      setAudioFile(file);
      if (!audioTitle) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
        setAudioTitle(nameWithoutExtension);
      }
    }
  };

  const handlePermissionToggle = (role) => {
    setVisibleFor(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role || r === ROLES.ADMIN);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleEditPermissionToggle = (role) => {
    setEditVisibleFor(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role || r === ROLES.ADMIN);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!audioFile) {
      alert('Veuillez sélectionner un fichier audio');
      return;
    }
    if (!audioTitle.trim()) {
      alert('Veuillez entrer un titre');
      return;
    }
    if (!selectedPlaylist) {
      alert('Veuillez sélectionner une playlist');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadToCloudinary(audioFile, (progress) => {
        setUploadProgress(progress);
      });

      await addDoc(collection(db, 'audios'), {
        title: audioTitle,
        playlistId: selectedPlaylist,
        url: result.url,
        publicId: result.publicId,
        duration: Math.round(result.duration || 0),
        format: result.format,
        date: audioDate || null,
        visibleFor: visibleFor,
        uploadedAt: new Date(),
        order: audios.filter(a => a.playlistId === selectedPlaylist).length
      });

      setAudioFile(null);
      setAudioTitle('');
      setAudioDate('');
      setVisibleFor([ROLES.ADMIN, ROLES.PRINCESS, ROLES.READER]);
      setUploadProgress(0);
      setUploading(false);

      loadAudios();
      alert('Audio uploadé avec succès !');
      document.getElementById('audioFileInput').value = '';
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload: ' + error.message);
      setUploading(false);
    }
  };

  const startEditing = (audio) => {
    setEditingAudioId(audio.id);
    setEditTitle(audio.title);
    setEditDate(audio.date || '');
    setEditPlaylist(audio.playlistId);
    setEditVisibleFor(audio.visibleFor || [ROLES.ADMIN, ROLES.PRINCESS, ROLES.READER]);
  };

  const cancelEditing = () => {
    setEditingAudioId(null);
    setEditTitle('');
    setEditDate('');
    setEditPlaylist('');
    setEditVisibleFor([]);
  };

  const saveEditing = async () => {
    if (!editTitle.trim()) {
      alert('Le titre ne peut pas être vide');
      return;
    }

    try {
      await updateDoc(doc(db, 'audios', editingAudioId), {
        title: editTitle,
        date: editDate || null,
        playlistId: editPlaylist,
        visibleFor: editVisibleFor
      });

      cancelEditing();
      loadAudios();
      alert('Audio modifié avec succès !');
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification: ' + error.message);
    }
  };

  const handleDeleteAudio = async (audio) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${audio.title}" ?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'audios', audio.id));
      loadAudios();
      alert('Audio supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPlaylistName = (playlistId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    return playlist ? playlist.name : 'Playlist supprimée';
  };

  const formatPermissions = (permissions) => {
    if (!permissions || permissions.length === 3) return 'Tous';
    const labels = {
      [ROLES.ADMIN]: '👑',
      [ROLES.PRINCESS]: '👸',
      [ROLES.READER]: '👤'
    };
    return permissions.map(p => labels[p]).join(' ');
  };

  return (
    <div className="admin-section">
      <h2>Upload d'audios</h2>

      {/* Formulaire d'upload */}
      <form onSubmit={handleUpload} className="audio-upload-form">
        <div className="form-group">
          <label className="form-label">
            Sélectionner une playlist *
          </label>
          <select
            value={selectedPlaylist}
            onChange={(e) => setSelectedPlaylist(e.target.value)}
            className="form-select"
            disabled={uploading}
          >
            <option value="">-- Choisir une playlist --</option>
            {playlists.map(playlist => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Titre de l'audio *
          </label>
          <input
            type="text"
            placeholder="Ex: Épisode 1, Chapitre 3..."
            value={audioTitle}
            onChange={(e) => setAudioTitle(e.target.value)}
            className="form-input"
            disabled={uploading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} />
            Date personnalisée (optionnel)
          </label>
          <input
            type="date"
            value={audioDate}
            onChange={(e) => setAudioDate(e.target.value)}
            className="form-input"
            disabled={uploading}
          />
          <p className="form-help">
            Si vide, la date d'upload sera utilisée
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">
            Visible pour *
          </label>
          <div className="permissions-group">
            <label className="checkbox-label" style={{ cursor: 'not-allowed' }}>
              <input
                type="checkbox"
                checked={visibleFor.includes(ROLES.ADMIN)}
                disabled={true}
              />
              <span>👑 Admin (toujours)</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={visibleFor.includes(ROLES.PRINCESS)}
                onChange={() => handlePermissionToggle(ROLES.PRINCESS)}
                disabled={uploading}
              />
              <span>👸 Princesse</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={visibleFor.includes(ROLES.READER)}
                onChange={() => handlePermissionToggle(ROLES.READER)}
                disabled={uploading}
              />
              <span>👤 Lecteur</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Fichier audio *
          </label>
          <input
            id="audioFileInput"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="form-input"
            disabled={uploading}
          />
          {audioFile && (
            <p className="form-help">
              Fichier sélectionné: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {uploading && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }}>
              {uploadProgress}%
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '16px', fontWeight: 'bold' }}
        >
          <Upload size={20} />
          {uploading ? 'Upload en cours...' : 'Uploader l\'audio'}
        </button>
      </form>

      {/* Liste des audios */}
      <div>
        <h3>Tous les audios ({audios.length})</h3>
        
        {loadingAudios ? (
          <div className="empty-state"><p>Chargement des audios...</p></div>
        ) : audios.length === 0 ? (
          <div className="empty-state">
            <p>Aucun audio uploadé pour le moment.</p>
          </div>
        ) : (
          <div className="grid">
            {audios.map((audio) => (
              <div
                key={audio.id}
                className={`audio-item-admin ${editingAudioId === audio.id ? 'editing' : ''}`}
              >
                {editingAudioId === audio.id ? (
                  // MODE ÉDITION
                  <div className="edit-form">
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label className="form-label">Titre</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label className="form-label">Playlist</label>
                      <select
                        value={editPlaylist}
                        onChange={(e) => setEditPlaylist(e.target.value)}
                        className="form-select"
                      >
                        {playlists.map(playlist => (
                          <option key={playlist.id} value={playlist.id}>
                            {playlist.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label className="form-label">Visible pour</label>
                      <div className="edit-permissions">
                        <label className="checkbox-label" style={{ cursor: 'not-allowed' }}>
                          <input
                            type="checkbox"
                            checked={editVisibleFor.includes(ROLES.ADMIN)}
                            disabled={true}
                          />
                          <span>👑 Admin</span>
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={editVisibleFor.includes(ROLES.PRINCESS)}
                            onChange={() => handleEditPermissionToggle(ROLES.PRINCESS)}
                          />
                          <span>👸 Princesse</span>
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={editVisibleFor.includes(ROLES.READER)}
                            onChange={() => handleEditPermissionToggle(ROLES.READER)}
                          />
                          <span>👤 Lecteur</span>
                        </label>
                      </div>
                    </div>

                    <div className="edit-form-actions">
                      <button onClick={saveEditing} className="btn btn-primary" style={{ flex: 1 }}>
                        <Save size={18} />
                        Sauvegarder
                      </button>
                      <button onClick={cancelEditing} className="btn btn-light" style={{ flex: 1 }}>
                        <X size={18} />
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  // MODE AFFICHAGE
                  <div className="audio-item-display">
                    <div className="audio-item-info">
                      <Music size={24} color="var(--accent-color)" />
                      <div className="audio-item-details">
                        <h4>{audio.title}</h4>
                        <p>
                          📁 {getPlaylistName(audio.playlistId)} • 
                          ⏱️ {formatDuration(audio.duration)} • 
                          📅 {audio.date || (audio.uploadedAt?.toDate ? new Date(audio.uploadedAt.toDate()).toLocaleDateString('fr-FR') : 'N/A')} •
                          👥 {formatPermissions(audio.visibleFor)}
                        </p>
                      </div>
                    </div>
                    <div className="audio-item-controls">
                      <audio
                        controls
                        src={audio.url}
                      />
                      <button
                        onClick={() => startEditing(audio)}
                        className="btn btn-secondary"
                      >
                        <Edit2 size={16} />
                        <span className="hide-mobile">Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAudio(audio)}
                        className="btn btn-danger"
                      >
                        <Trash2 size={16} />
                        <span className="hide-mobile">Supprimer</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AudioUpload;