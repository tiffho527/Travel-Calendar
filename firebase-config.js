// Firebase Configuration
// INSTRUCTIONS: Replace these values with your own Firebase project credentials
// Get these from: Firebase Console > Project Settings > Your apps > Web app

const firebaseConfig = {
  apiKey: "AIzaSyAD2rMKQ1f-wzUTq9CIUpThwrk5Z3oX99Q",
  authDomain: "trip-calendar-4f14e.firebaseapp.com",
  databaseURL: "https://trip-calendar-4f14e-default-rtdb.firebaseio.com",
  projectId: "trip-calendar-4f14e",
  storageBucket: "trip-calendar-4f14e.firebasestorage.app",
  messagingSenderId: "214310496442",
  appId: "1:214310496442:web:f3646a0f4c1eb815607a83"
};

// Initialize Firebase (will be called from script.js)
let database;

function initFirebase() {
  // Check if Firebase SDK is loaded
  if (typeof firebase === 'undefined') {
    console.log('📴 Firebase SDK not loaded - using local mode');
    return false;
  }

  // Check if config has been updated from placeholder values
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY_HERE') {
    console.log('📴 Firebase not configured - using local mode');
    console.log('ℹ️  To enable collaboration: Update firebase-config.js with your Firebase credentials');
    return false;
  }

  try {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.log('📴 Firebase initialization failed - using local mode:', error.message);
    return false;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initFirebase, firebaseConfig };
}

