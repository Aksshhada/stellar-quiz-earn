// src/services/firebase.js
// Firebase Realtime Database integration for Stellar Quiz

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, update } from 'firebase/database';

// ✅ YOUR FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBkQEYs1WZVUpI7YizJsmVsTp3WMH5rzpQ",
  authDomain: "stellar-7ce59.firebaseapp.com",
  databaseURL: "https://stellar-7ce59-default-rtdb.firebaseio.com", // ⚠️ IMPORTANT: Add this!
  projectId: "stellar-7ce59",
  storageBucket: "stellar-7ce59.firebasestorage.app",
  messagingSenderId: "470056263519",
  appId: "1:470056263519:web:7adc4015cfddccf3fb60ea",
  measurementId: "G-38RX7M3T7B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Realtime Database instance
export const db = getDatabase(app);

// ====================================
// QUIZ MANAGEMENT FUNCTIONS
// ====================================

/**
 * Save quiz to Firebase
 * @param {Object} quiz - Quiz object with code, questions, etc.
 * @returns {Promise<string>} Quiz code
 */
export const saveQuizToFirebase = async (quiz) => {
  try {
    const quizRef = ref(db, `quizzes/${quiz.code}`);
    await set(quizRef, {
      ...quiz,
      createdAt: Date.now(),
      participants: {},
      results: {},
      status: 'active'
    });
    console.log(`✅ Quiz ${quiz.code} saved to Firebase`);
    return quiz.code;
  } catch (error) {
    console.error('❌ Error saving quiz:', error);
    throw new Error('Failed to save quiz to Firebase');
  }
};

/**
 * Get quiz from Firebase
 * @param {string} code - 6-digit quiz code
 * @returns {Promise<Object|null>} Quiz object or null if not found
 */
export const getQuizFromFirebase = async (code) => {
  try {
    const quizRef = ref(db, `quizzes/${code}`);
    const snapshot = await get(quizRef);
    
    if (snapshot.exists()) {
      console.log(`✅ Quiz ${code} loaded from Firebase`);
      return snapshot.val();
    }
    console.log(`❌ Quiz ${code} not found`);
    return null;
  } catch (error) {
    console.error('❌ Error getting quiz:', error);
    return null;
  }
};

/**
 * Join quiz (add participant)
 * @param {string} code - Quiz code
 * @param {string} publicKey - User's wallet address
 * @returns {Promise<boolean>} Success status
 */
export const joinQuizFirebase = async (code, publicKey) => {
  try {
    const participantRef = ref(db, `quizzes/${code}/participants/${publicKey}`);
    await set(participantRef, {
      publicKey,
      joinedAt: Date.now(),
      status: 'joined'
    });
    console.log(`✅ User ${publicKey.slice(0, 8)}... joined quiz ${code}`);
    return true;
  } catch (error) {
    console.error('❌ Error joining quiz:', error);
    return false;
  }
};

/**
 * Listen to quiz updates in real-time
 * @param {string} code - Quiz code
 * @param {Function} callback - Callback function with quiz data
 * @returns {Function} Unsubscribe function
 */
export const listenToQuiz = (code, callback) => {
  const quizRef = ref(db, `quizzes/${code}`);
  return onValue(quizRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
};

/**
 * Submit quiz result
 * @param {string} code - Quiz code
 * @param {string} publicKey - User's wallet address
 * @param {Object} result - Result object with score, answers, etc.
 * @returns {Promise<boolean>} Success status
 */
export const submitQuizResult = async (code, publicKey, result) => {
  try {
    const resultRef = ref(db, `quizzes/${code}/results/${publicKey}`);
    await set(resultRef, {
      ...result,
      publicKey,
      submittedAt: Date.now()
    });
    console.log(`✅ Result submitted for quiz ${code}`);
    return true;
  } catch (error) {
    console.error('❌ Error submitting result:', error);
    return false;
  }
};

/**
 * Get leaderboard
 * @param {string} code - Quiz code
 * @returns {Promise<Array>} Array of results sorted by score
 */
export const getLeaderboard = async (code) => {
  try {
    const resultsRef = ref(db, `quizzes/${code}/results`);
    const snapshot = await get(resultsRef);
    
    if (snapshot.exists()) {
      const results = snapshot.val();
      const leaderboard = Object.values(results)
        .sort((a, b) => {
          // Sort by score (descending), then by time (ascending)
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return a.timeElapsed - b.timeElapsed;
        })
        .slice(0, 10);
      
      console.log(`✅ Leaderboard loaded for quiz ${code}`);
      return leaderboard;
    }
    return [];
  } catch (error) {
    console.error('❌ Error getting leaderboard:', error);
    return [];
  }
};

/**
 * Get participant count in real-time
 * @param {string} code - Quiz code
 * @param {Function} callback - Callback function with participant count
 * @returns {Function} Unsubscribe function
 */
export const listenToParticipants = (code, callback) => {
  const participantsRef = ref(db, `quizzes/${code}/participants`);
  return onValue(participantsRef, (snapshot) => {
    if (snapshot.exists()) {
      const participants = Object.keys(snapshot.val());
      callback(participants.length);
    } else {
      callback(0);
    }
  });
};

/**
 * Get all quizzes created by a user
 * @param {string} publicKey - User's wallet address
 * @returns {Promise<Array>} Array of user's quizzes
 */
export const getUserQuizzes = async (publicKey) => {
  try {
    const quizzesRef = ref(db, 'quizzes');
    const snapshot = await get(quizzesRef);
    
    if (snapshot.exists()) {
      const allQuizzes = snapshot.val();
      const userQuizzes = Object.values(allQuizzes)
        .filter(quiz => quiz.createdBy === publicKey)
        .sort((a, b) => b.createdAt - a.createdAt);
      
      return userQuizzes;
    }
    return [];
  } catch (error) {
    console.error('❌ Error getting user quizzes:', error);
    return [];
  }
};

/**
 * Update quiz status
 * @param {string} code - Quiz code
 * @param {string} status - New status (active, completed, archived)
 * @returns {Promise<boolean>} Success status
 */
export const updateQuizStatus = async (code, status) => {
  try {
    const quizRef = ref(db, `quizzes/${code}`);
    await update(quizRef, { status });
    console.log(`✅ Quiz ${code} status updated to ${status}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating quiz status:', error);
    return false;
  }
};

/**
 * Delete quiz
 * @param {string} code - Quiz code
 * @returns {Promise<boolean>} Success status
 */
export const deleteQuiz = async (code) => {
  try {
    const quizRef = ref(db, `quizzes/${code}`);
    await set(quizRef, null);
    console.log(`✅ Quiz ${code} deleted`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting quiz:', error);
    return false;
  }
};

// Export all functions
export default {
  db,
  saveQuizToFirebase,
  getQuizFromFirebase,
  joinQuizFirebase,
  listenToQuiz,
  submitQuizResult,
  getLeaderboard,
  listenToParticipants,
  getUserQuizzes,
  updateQuizStatus,
  deleteQuiz
};