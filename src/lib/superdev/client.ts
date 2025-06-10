// Superdev client configuration
// This file provides the client setup for the Superdev platform

export const superdevClient = {
  // Basic client configuration
  apiUrl: process.env.VITE_SUPERDEV_API_URL || '/api',
  
  // Initialize the client
  init: () => {
    console.log('Superdev client initialized');
  },
  
  // Get current user context
  getCurrentUser: async () => {
    try {
      // This would typically fetch from the Superdev platform
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Basic configuration
  config: {
    retries: 3,
    timeout: 10000,
  }
};

// Initialize the client when imported
superdevClient.init();

export default superdevClient;