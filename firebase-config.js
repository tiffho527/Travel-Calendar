// Firebase Configuration
// INSTRUCTIONS: Replace these values with your own Firebase project credentials
// Get these from: Firebase Console > Project Settings > Your apps > Web app

const firebaseConfig = {
  // TODO: Replace with your Firebase project configuration
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (will be called from script-collaborative.js)
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

