/**
 * Third-Party API Keys Configuration
 * 
 * Centralized location for all third-party service API keys.
 * DO NOT commit sensitive keys to public repositories.
 */

export const API_KEYS = {
  /**
   * Google Maps API Key
   * Used for: Maps display, geocoding, directions
   */
  GOOGLE_MAPS: 'AIzaSyDw59gPssVHEg1TcHoC9at1KDF98yVnQe4',

  /**
   * Add other third-party API keys here as needed:
   * - Payment gateways (Stripe, PayPal, etc.)
   * - Analytics (Google Analytics, Mixpanel, etc.)
   * - Push notifications (Firebase, OneSignal, etc.)
   * - SMS services (Twilio, etc.)
   */
} as const;

/**
 * Helper function to get API key by service name
 */
export const getApiKey = (service: keyof typeof API_KEYS): string => {
  return API_KEYS[service];
};
