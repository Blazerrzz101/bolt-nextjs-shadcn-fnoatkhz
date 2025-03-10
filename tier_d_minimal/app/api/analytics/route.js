import { getAnalytics } from '../../../lib/data-utils';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'week'; // day, week, month, year, all
    const category = url.searchParams.get('category');
    
    const analytics = getAnalytics(period, category);
    
    return Response.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return Response.json(
      { success: false, error: error.message || 'An error occurred fetching analytics data' },
      { status: 500 }
    );
  }
} 