import { google } from 'googleapis';

const SALES_HEADERS = ['Week Ending', 'Networking Events', 'One to Ones', 'LinkedIn Posts', 'Socket Pricing', 'Sales Handover', 'Content Hours', 'Proposals Sent', 'Proposals Won', 'Clients Won Value', 'Pipeline Value'];
const FINANCE_HEADERS = ['Week Ending', 'DD Sign Up', 'Unreconciled Items', 'Invoice Rec Diff', 'One Offs Not Billed', 'Fee Reviews Old', 'Overdue Balances'];
const OPERATIONS_HEADERS = ['Week Ending', 'Complaints', 'Email Comms', 'Accounts Completion', 'Accounts Not Started', 'SA Completion', 'Managements Up To Date', 'Xero Insights BK', 'Client Referrals', 'Staff Satisfaction', 'Google Reviews', 'Kudos'];

export async function POST(request) {
  try {
    const body = await request.json();
    const { pin } = body;
    if (pin !== (process.env.EDITOR_PIN || 'cloud10')) {
      return Response.json({ success: false, error: 'Invalid PIN' }, { status: 401 });
    }

    if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return Response.json({ success: false, error: 'Google Sheets not configured. Add GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY to environment variables.' }, { status: 400 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    // Get existing sheets
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);

    const requests = [];

    // Rename Sheet1 to Sales if it exists, otherwise create Sales
    if (existingSheets.includes('Sheet1')) {
      const sheet1 = spreadsheet.data.sheets.find(s => s.properties.title === 'Sheet1');
      requests.push({
        updateSheetProperties: {
          properties: { sheetId: sheet1.properties.sheetId, title: 'Sales' },
          fields: 'title',
        },
      });
    } else if (!existingSheets.includes('Sales')) {
      requests.push({ addSheet: { properties: { title: 'Sales' } } });
    }

    // Create Finance and Operations tabs if they don't exist
    if (!existingSheets.includes('Finance')) {
      requests.push({ addSheet: { properties: { title: 'Finance' } } });
    }
    if (!existingSheets.includes('Operations')) {
      requests.push({ addSheet: { properties: { title: 'Operations' } } });
    }

    // Apply tab changes first
    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
    }

    // Add headers to each tab
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sales!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [SALES_HEADERS] },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Finance!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [FINANCE_HEADERS] },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Operations!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [OPERATIONS_HEADERS] },
    });

    // Bold the header rows
    const updatedSpreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const formatRequests = updatedSpreadsheet.data.sheets.map(sheet => ({
      repeatCell: {
        range: {
          sheetId: sheet.properties.sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true },
            backgroundColor: { red: 0.184, green: 0.271, blue: 0.271 },
            textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
          },
        },
        fields: 'userEnteredFormat(textFormat,backgroundColor)',
      },
    }));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: formatRequests },
    });

    return Response.json({
      success: true,
      message: 'Google Sheet set up successfully! Tabs created: Sales, Finance, Operations with headers and formatting.',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
