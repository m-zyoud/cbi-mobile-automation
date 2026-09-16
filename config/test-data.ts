export const testData = {
  searchTerms: [
    'chair',
    'table',
    'lamp',
    'pillow',
    'rug',
  ],

  account: {
    email: process.env.CBI_TEST_EMAIL || '',
    password: process.env.CBI_TEST_PASSWORD || '',
  },

  registration: {
    firstName: 'Test',
    lastName: 'User',
    email: `testuser${Date.now()}@example.com`,
    password:
      process.env.CBI_TEST_PASSWORD ||
      'TestPassword123!',
  },

  shipping: {
    firstName: 'Test',
    lastName: 'User',
    address: '123 Test St',
    city: 'Council Bluffs',
    state: 'IA',
    zip: '51503',
    phone: '2025550123',
    email: 'testuser@example.com',
  },
};