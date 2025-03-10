export async function GET() {
  return Response.json({
    status: "ok",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      realTimeVoting: true,
      productRankings: true,
      adminDashboard: true
    }
  });
} 