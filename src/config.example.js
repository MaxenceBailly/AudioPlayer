// ==================== CONFIGURATION EXEMPLE ====================
// Copiez ce fichier en "config.js" et remplissez avec vos vraies valeurs

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloudName: 'VOTRE_CLOUD_NAME',
  uploadPreset: 'VOTRE_UPLOAD_PRESET',
};

// User Roles Configuration
export const ROLES = {
  ADMIN: 'admin',
  PRINCESS: 'princess',
  READER: 'reader'
};

// User Emails Configuration
export const USER_ROLES = {
  'admin@example.com': ROLES.ADMIN,        // REMPLACEZ par l'email admin
  'princesse@example.com': ROLES.PRINCESS, // REMPLACEZ par l'email princesse
};

// Helper Functions
export const getUserRole = (email) => {
  return USER_ROLES[email] || ROLES.READER;
};

export const isAdmin = (email) => getUserRole(email) === ROLES.ADMIN;
export const isPrincess = (email) => getUserRole(email) === ROLES.PRINCESS;
export const isReader = (email) => getUserRole(email) === ROLES.READER;
export const canManageContent = (email) => isAdmin(email);