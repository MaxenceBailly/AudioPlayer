# 🎵 Audio Player

Application web de gestion et lecture d'audios avec système de playlists et calendrier.

## 🌟 Fonctionnalités

### Pour tous les utilisateurs
- 🔐 Authentification Google
- 🎵 Lecteur audio avec contrôles
- 📁 Navigation par playlists
- 📅 Vue calendrier
- 🌓 Mode sombre/clair
- 📱 Interface responsive

### Pour les admins
- ➕ Création et gestion de playlists
- ⬆️ Upload d'audios
- ✏️ Modification des audios (titre, date, permissions)
- 🗑️ Suppression d'audios
- 👥 Gestion des permissions par audio

### Système de rôles
- 👑 **Admin** : Accès complet
- 👸 **Princesse** : Accès aux audios autorisés
- 👤 **Lecteur** : Accès aux audios publics

## 🚀 Technologies utilisées

- **Frontend** : React 18
- **Authentification** : Firebase Authentication
- **Base de données** : Firestore
- **Stockage** : Cloudinary
- **Hébergement** : Firebase Hosting
- **Icônes** : Lucide React

## 📦 Installation

### Prérequis
- Node.js 16+
- Compte Firebase
- Compte Cloudinary

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/VOTRE_USERNAME/audio-player.git
cd audio-player
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Firebase**
   - Créez un projet sur [Firebase Console](https://console.firebase.google.com)
   - Activez Authentication (Google)
   - Activez Firestore Database
   - Récupérez vos clés de configuration

4. **Configurer Cloudinary**
   - Créez un compte sur [Cloudinary](https://cloudinary.com)
   - Créez un Upload Preset (unsigned)
   - Notez votre Cloud Name

5. **Créer le fichier de configuration**
```bash
cp src/config.example.js src/config.js
```

6. **Éditer `src/config.js`** avec vos vraies valeurs :
```javascript
export const FIREBASE_CONFIG = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

export const CLOUDINARY_CONFIG = {
  cloudName: 'VOTRE_CLOUD_NAME',
  uploadPreset: 'VOTRE_UPLOAD_PRESET',
};

export const USER_ROLES = {
  'admin@example.com': ROLES.ADMIN,
  'princesse@example.com': ROLES.PRINCESS,
};
```

7. **Configurer les règles Firestore**

Allez dans Firebase Console → Firestore Database → Rules :
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /playlists/{playlistId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /audios/{audioId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

8. **Lancer en développement**
```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🌐 Déploiement

### Firebase Hosting

1. **Installer Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Se connecter à Firebase**
```bash
firebase login
```

3. **Initialiser Firebase**
```bash
firebase init
```
- Sélectionnez "Hosting"
- Choisissez votre projet
- Public directory: `build`
- Single-page app: `Yes`

4. **Construire et déployer**
```bash
npm run build
firebase deploy
```

Votre application sera accessible sur `https://VOTRE_PROJET.web.app`

## 📁 Structure du projet
```
audio-player/
├── public/
├── src/
│   ├── components/
│   │   ├── AdminPanel.js
│   │   ├── AudioPlayer.js
│   │   ├── AudioUpload.js
│   │   ├── CalendarView.js
│   │   ├── Login.js
│   │   └── PlayerPanel.js
│   ├── contexts/
│   │   └── ThemeContext.js
│   ├── styles/
│   │   └── App.css
│   ├── App.js
│   ├── config.example.js
│   ├── config.js (gitignored)
│   ├── firebase.js
│   ├── cloudinary.js
│   └── index.js
├── .gitignore
├── package.json
└── README.md
```

## 🔒 Sécurité

- ⚠️ **Ne jamais commiter `src/config.js`**
- Le fichier est dans `.gitignore`
- Utilisez `src/config.example.js` comme template
- Configurez les règles Firestore pour sécuriser l'accès

## 🎨 Personnalisation

### Changer les couleurs
Modifiez les variables CSS dans `src/styles/App.css` :
```css
:root {
  --accent-color: #4CAF50;
  --info-color: #2196F3;
  /* ... */
}
```

### Ajouter des rôles
Modifiez `src/config.js` :
```javascript
export const ROLES = {
  ADMIN: 'admin',
  PRINCESS: 'princess',
  READER: 'reader',
  NOUVEAU_ROLE: 'nouveau_role' // Ajoutez ici
};
```

## 🐛 Problèmes connus

- Les audios ne s'affichent pas → Vérifiez les règles Firestore
- Connexion Google échoue → Vérifiez les domaines autorisés dans Firebase
- Upload échoue → Vérifiez votre configuration Cloudinary

## 📝 License

MIT License - Libre d'utilisation

## 👤 Auteur

Votre Nom - [GitHub](https://github.com/VOTRE_USERNAME)

## 🙏 Remerciements

- Firebase pour l'infrastructure
- Cloudinary pour le stockage
- Lucide pour les icônes