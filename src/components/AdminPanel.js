import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import AudioUpload from './AudioUpload';

function AdminPanel() {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylists();
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

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      await addDoc(collection(db, 'playlists'), {
        name: newPlaylistName,
        createdAt: new Date(),
        order: playlists.length
      });
      setNewPlaylistName('');
      loadPlaylists();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de la playlist');
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette playlist ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'playlists', id));
      loadPlaylists();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const startEditing = (id, name) => {
    setEditingId(id);
    setEditingName(name);
  };

  const saveEditing = async () => {
    if (!editingName.trim()) return;

    try {
      await updateDoc(doc(db, 'playlists', editingId), {
        name: editingName
      });
      setEditingId(null);
      setEditingName('');
      loadPlaylists();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification');
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (loading) {
    return <div className="empty-state"><p>Chargement...</p></div>;
  }

  return (
    <div>
      <div className="admin-section">
        <h2>Gestion des Playlists</h2>

        {/* Formulaire de création */}
        <form onSubmit={handleCreatePlaylist} className="admin-form">
          <div className="admin-form-inline">
            <input
              type="text"
              placeholder="Nom de la nouvelle playlist..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="btn btn-primary">
              <Plus size={20} />
              Créer
            </button>
          </div>
        </form>

        {/* Liste des playlists */}
        <div>
          {playlists.length === 0 ? (
            <div className="empty-state">
              <p>Aucune playlist. Créez-en une pour commencer !</p>
            </div>
          ) : (
            <div className="grid">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="playlist-item">
                  {editingId === playlist.id ? (
                    <>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="form-input"
                        style={{ flex: 1 }}
                        autoFocus
                      />
                      <div className="playlist-item-actions">
                        <button onClick={saveEditing} className="btn btn-primary">
                          <Save size={16} />
                          <span className="hide-mobile">Sauvegarder</span>
                        </button>
                        <button onClick={cancelEditing} className="btn btn-light">
                          <X size={16} />
                          <span className="hide-mobile">Annuler</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="playlist-item-content">
                        <h3 style={{ margin: 0, fontSize: '18px' }}>
                          {playlist.name}
                        </h3>
                      </div>
                      <div className="playlist-item-actions">
                        <button
                          onClick={() => startEditing(playlist.id, playlist.name)}
                          className="btn btn-secondary"
                        >
                          <Edit2 size={16} />
                          <span className="hide-mobile">Modifier</span>
                        </button>
                        <button onClick={() => handleDeletePlaylist(playlist.id)}
                          className="btn btn-danger"
                        >
                          <Trash2 size={16} />
                          <span className="hide-mobile">Supprimer</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Séparateur */}
      <hr className="separator" />

      {/* Composant d'upload */}
      {playlists.length > 0 ? (
        <AudioUpload playlists={playlists} />
      ) : (
        <div className="card card-warning" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--warning-text)' }}>
            ⚠️ Créez au moins une playlist avant d'uploader des audios
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;