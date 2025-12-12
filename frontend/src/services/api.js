/**
 * Mocked API service for local development
 * Simulates backend responses without hitting real AWS endpoints
 */

// Simulated delay to mimic network latency
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data store
let mockQRCodes = [
  {
    qrId: 'demo123',
    label: 'GitHub Profile',
    destination: 'https://github.com',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://github.com',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    qrId: 'test456',
    label: 'Google Search',
    destination: 'https://google.com',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://google.com',
    createdAt: '2024-01-14T08:00:00Z'
  }
];

// Mock authenticated user
let mockUser = null;

/**
 * Auth API
 */
export const authApi = {
  /**
   * Sign up a new user
   */
  async signUp(email, password) {
    await delay(800);
    
    // Simulate validation
    if (!email.includes('@')) {
      throw new Error('Invalid email address');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    return { success: true, message: 'Account created successfully' };
  },

  /**
   * Log in an existing user
   */
  async login(email, password) {
    await delay(800);
    
    // Simulate login (accept any valid-looking credentials for demo)
    if (!email.includes('@') || password.length < 8) {
      throw new Error('Invalid email or password');
    }
    
    mockUser = {
      id: 'user-' + Math.random().toString(36).substring(2, 10),
      email,
      token: 'mock-jwt-token-' + Date.now()
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    
    return { user: mockUser };
  },

  /**
   * Log out the current user
   */
  async logout() {
    await delay(300);
    mockUser = null;
    localStorage.removeItem('auth_user');
    return { success: true };
  },

  /**
   * Get the current authenticated user
   */
  getCurrentUser() {
    if (mockUser) return mockUser;
    
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      mockUser = JSON.parse(stored);
      return mockUser;
    }
    
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  }
};

/**
 * QR Code API
 */
export const qrApi = {
  /**
   * Create a new QR code
   */
  async createQR(destination, label) {
    await delay(1000);
    
    if (!destination) {
      throw new Error('Destination URL is required');
    }
    
    // Validate URL
    try {
      new URL(destination);
    } catch {
      throw new Error('Invalid URL format');
    }
    
    const qrId = Math.random().toString(36).substring(2, 10);
    const newQR = {
      qrId,
      label: label || 'Untitled QR',
      destination,
      // Use a free QR code API for demo purposes
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(destination)}`,
      createdAt: new Date().toISOString()
    };
    
    mockQRCodes.unshift(newQR);
    
    return { qrCode: newQR };
  },

  /**
   * List all QR codes for the current user
   */
  async listQRCodes() {
    await delay(500);
    
    return {
      qrCodes: mockQRCodes,
      total: mockQRCodes.length
    };
  },

  /**
   * Update destination URL for a QR code
   */
  async updateDestination(qrId, newDestination) {
    await delay(600);
    
    const qrIndex = mockQRCodes.findIndex(qr => qr.qrId === qrId);
    if (qrIndex === -1) {
      throw new Error('QR code not found');
    }
    
    // Validate URL
    try {
      new URL(newDestination);
    } catch {
      throw new Error('Invalid URL format');
    }
    
    mockQRCodes[qrIndex] = {
      ...mockQRCodes[qrIndex],
      destination: newDestination,
      updatedAt: new Date().toISOString()
    };
    
    return { qrCode: mockQRCodes[qrIndex] };
  },

  /**
   * Delete a QR code
   */
  async deleteQR(qrId) {
    await delay(500);
    
    const qrIndex = mockQRCodes.findIndex(qr => qr.qrId === qrId);
    if (qrIndex === -1) {
      throw new Error('QR code not found');
    }
    
    mockQRCodes.splice(qrIndex, 1);
    
    return { success: true };
  },

  /**
   * Get redirect URL for a QR code
   */
  getRedirectUrl(qrId) {
    // In production, this would point to API Gateway
    // For demo, we simulate the redirect URL format
    return `https://api-placeholder.execute-api.us-east-1.amazonaws.com/dev/redirect/${qrId}`;
  }
};

/**
 * API configuration
 * In production, these would be populated from environment variables
 */
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_placeholder',
  cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || 'placeholder-client-id',
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1'
};

export default {
  auth: authApi,
  qr: qrApi,
  config: apiConfig
};
