import {
  getWeeklyData,
  saveWeeklyData,
  getHistoricalData,
  getAvailableWeeks,
} from '@/lib/sheets';
import {
  calculateSalesScore,
  calculateFinanceScore,
  calculateOperationsScore,
  calculateOverallScore,
  calculateDepartmentPercentage,
} from '@/lib/scoring';
import { mockWeeklyData, mockHistoricalScores, mockAvailableWeeks } from '@/lib/mockData';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const week = searchParams.get('week');
  const weeks = searchParams.get('weeks') || '12';

  try {
    // If demo mode or no Google Sheets config, use mock data
    if (DEMO_MODE || !process.env.GOOGLE_SHEETS_ID) {
      if (action === 'history') {
        return Response.json({ success: true, data: mockHistoricalScores });
      }
      if (action === 'weeks') {
        return Response.json({ success: true, weeks: mockAvailableWeeks });
      }
      return Response.json({ success: true, data: mockWeeklyData });
    }

    if (action === 'history') {
      try {
        const historicalData = await getHistoricalData(parseInt(weeks));
        if (!historicalData) {
          // Fall back to mock data if sheets not set up
          return Response.json({ success: true, data: mockHistoricalScores });
        }

        // Calculate scores for each week
        const scores = [];
        for (const [week, data] of Object.entries(historicalData)) {
          const salesData = historicalData.Sales?.find((d) => d.weekEnding === week);
          const financeData = historicalData.Finance?.find((d) => d.weekEnding === week);
          const operationsData = historicalData.Operations?.find((d) => d.weekEnding === week);

          if (salesData && financeData && operationsData) {
            const salesScore = calculateSalesScore(salesData);
            const financeScore = calculateFinanceScore(financeData);
            const operationsScore = calculateOperationsScore(operationsData);
            const overallScore = calculateOverallScore(
              salesScore,
              financeScore,
              operationsScore
            );

            scores.push({
              weekEnding: week,
              overall: overallScore,
              sales: calculateDepartmentPercentage(salesScore),
              finance: calculateDepartmentPercentage(financeScore),
              operations: calculateDepartmentPercentage(operationsScore),
            });
          }
        }

        return Response.json({ success: true, data: scores });
      } catch (err) {
        console.error('History fetch error, using mock data:', err.message);
        return Response.json({ success: true, data: mockHistoricalScores });
      }
    }

    if (action === 'weeks') {
      try {
        const availableWeeks = await getAvailableWeeks();
        return Response.json({ success: true, weeks: availableWeeks || [] });
      } catch (err) {
        console.error('Weeks fetch error, using mock data:', err.message);
        return Response.json({ success: true, weeks: mockAvailableWeeks });
      }
    }

    // Get data for specific week - fall back to mock if sheets not ready
    try {
      const data = await getWeeklyData(week);
      if (!data) {
        return Response.json({ success: true, data: mockWeeklyData, demo: true });
      }
      return Response.json({ success: true, data });
    } catch (err) {
      console.error('Weekly fetch error, using mock data:', err.message);
      return Response.json({ success: true, data: mockWeeklyData, demo: true });
    }
  } catch (error) {
    console.error('API error:', error);
    // Ultimate fallback - always show something rather than error
    return Response.json({ success: true, data: mockWeeklyData, demo: true });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { week, department, data } = body;

    if (!week || !department || !data) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In demo mode, just return success
    if (DEMO_MODE) {
      return Response.json({ success: true });
    }

    const result = await saveWeeklyData(week, department, data);
    if (!result) {
      return Response.json({ success: false, error: 'Could not save data' });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
