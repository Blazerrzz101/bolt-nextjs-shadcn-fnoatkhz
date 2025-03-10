/**
 * Mock implementation for API routes
 * This is a simple mock that returns empty data for all API routes
 */

export const mockResponse = {
  success: true,
  message: "Using mock implementation during static build",
  data: []
};

// Simple mock API handler that returns the mock response
export const mockApiHandler = () => {
  return new Response(JSON.stringify(mockResponse), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export default mockApiHandler; 