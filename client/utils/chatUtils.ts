// Utility functions for chat engagement tracking

/**
 * Mark that the user has joined clubs
 * This helps the chat system know when to show club chats
 */
export const markUserHasJoinedClubs = () => {
  localStorage.setItem('hasJoinedClubs', 'true');
};

/**
 * Mark that the user has sent messages
 * This helps the chat system know when to show direct messages
 */
export const markUserHasSentMessages = () => {
  localStorage.setItem('hasSentMessages', 'true');
};

/**
 * Check if user has joined any clubs
 */
export const hasUserJoinedClubs = (): boolean => {
  return localStorage.getItem('hasJoinedClubs') === 'true';
};

/**
 * Check if user has sent any messages
 */
export const hasUserSentMessages = (): boolean => {
  return localStorage.getItem('hasSentMessages') === 'true';
};

/**
 * Reset user engagement tracking (for new accounts)
 */
export const resetUserEngagement = () => {
  localStorage.removeItem('hasJoinedClubs');
  localStorage.removeItem('hasSentMessages');
};

/**
 * Check if user is in demo mode
 */
export const isUserInDemoMode = (): boolean => {
  return localStorage.getItem('isDemoUser') === 'true' || 
         window.location.pathname.includes('demo');
};
