import '../../../lib/complete-polyfills.js';

export async function GET() {
  return Response.json({
    status: "ok",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    mockMode: process.env.MOCK_DB === 'true',
    features: {
      realTimeVoting: true,
      realTimeReviews: true,
      analyticsTracking: true,
      cmsDashboard: true
    }
  });
}
